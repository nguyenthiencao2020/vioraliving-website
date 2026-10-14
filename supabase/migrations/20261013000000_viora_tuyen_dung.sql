-- =====================================================================
-- Viora Living Saigon – CSDL Tuyển dụng (Supabase)
-- Chạy 1 lần trong Supabase Dashboard → SQL Editor → New query → Run
-- An toàn khi chạy lại (idempotent ở mức tối đa).
-- =====================================================================

-- ---------- 1. Kiểu dữ liệu ----------
do $$ begin
  create type public.application_status as enum
    ('uploading','new','reviewing','interview','offered','hired','rejected','withdrawn');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.employment_type as enum
    ('FULL_TIME','PART_TIME','CONTRACT','INTERNSHIP');
exception when duplicate_object then null; end $$;

-- ---------- 2. Hàm cập nhật updated_at ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

-- ---------- 3. Bảng HR được phép truy cập (dùng cho trang admin sau này) ----------
create table if not exists public.hr_users (
  email       text primary key,
  full_name   text,
  role        text not null default 'hr' check (role in ('hr','admin')),
  created_at  timestamptz not null default now()
);

create or replace function public.is_hr()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.hr_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ---------- 4. Vị trí tuyển dụng ----------
create table if not exists public.jobs (
  slug              text primary key,
  title             text not null,
  quantity          int check (quantity is null or quantity > 0),
  employment_type   public.employment_type not null default 'FULL_TIME',
  audience          text,
  location          text not null default 'Viora Living Saigon – Cơ sở Lái Thiêu',
  requirements      text[] not null default '{}',
  responsibilities  text[] not null default '{}',
  active            boolean not null default true,
  sort_order        int not null default 0,
  date_posted       date not null default current_date,
  valid_through     date,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
drop trigger if exists trg_jobs_updated on public.jobs;
create trigger trg_jobs_updated before update on public.jobs
  for each row execute function public.set_updated_at();

-- ---------- 5. Hồ sơ ứng tuyển ----------
create table if not exists public.applications (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  job_slug         text not null references public.jobs(slug) on update cascade,
  job_title        text not null,                 -- lưu cứng tên vị trí tại thời điểm nộp
  full_name        text not null check (length(trim(full_name)) between 2 and 120),
  phone            text not null check (phone ~ '^0[0-9]{9}$'),
  email            text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  birthplace       text not null check (length(trim(birthplace)) between 2 and 200), -- nơi sinh / nguyên quán
  birth_year       int  check (birth_year is null or birth_year between 1940 and 2010),
  education_level  text check (education_level is null or education_level in ('THPT','Trung cấp','Cao đẳng','Đại học','Sau đại học','Khác')),
  school           text,
  source           text,                          -- biết đến qua đâu
  message          text check (message is null or length(message) <= 2000),
  cv_path          text,                          -- path trong bucket 'cv'
  cv_filename      text,                          -- tên file gốc
  cv_mime          text,
  cv_size          int,
  consent_at       timestamptz not null,
  consent_version  text not null,                 -- vd 'pdp-2026-10'
  utm              jsonb,
  ip_hash          text,                          -- sha256(ip + salt), không lưu IP thô
  status           public.application_status not null default 'uploading',
  hr_note          text,
  hr_owner         text,                          -- email HR phụ trách
  hr_notified_at   timestamptz,
  candidate_notified_at timestamptz,
  notify_error     text
);
create index if not exists idx_app_job_status on public.applications (job_slug, status, created_at desc);
create index if not exists idx_app_phone      on public.applications (phone);
create index if not exists idx_app_pending_notify on public.applications (created_at)
  where hr_notified_at is null and status <> 'uploading';

drop trigger if exists trg_app_updated on public.applications;
create trigger trg_app_updated before update on public.applications
  for each row execute function public.set_updated_at();

-- Lịch sử đổi trạng thái (audit cho HR)
create table if not exists public.application_events (
  id              bigint generated always as identity primary key,
  application_id  uuid not null references public.applications(id) on delete cascade,
  created_at      timestamptz not null default now(),
  actor           text,                           -- email HR hoặc 'system'
  from_status     public.application_status,
  to_status       public.application_status,
  note            text
);
create index if not exists idx_events_app on public.application_events (application_id, created_at desc);

create or replace function public.log_status_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    insert into public.application_events (application_id, actor, from_status, to_status)
    values (new.id, coalesce(auth.jwt() ->> 'email', 'system'), old.status, new.status);
  end if;
  return new;
end $$;
drop trigger if exists trg_app_status_log on public.applications;
create trigger trg_app_status_log after update of status on public.applications
  for each row execute function public.log_status_change();

-- ---------- 6. Rate limit (gọi từ API server) ----------
create table if not exists public.rate_limits (
  key           text not null,
  window_start  timestamptz not null,
  count         int not null default 1,
  primary key (key, window_start)
);

-- Trả về true nếu còn được phép. Ví dụ: check_rate_limit('ip:abc', 5, 60)
create or replace function public.check_rate_limit(p_key text, p_limit int, p_window_seconds int)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_window timestamptz; v_count int;
begin
  v_window := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  insert into public.rate_limits (key, window_start, count) values (p_key, v_window, 1)
  on conflict (key, window_start) do update set count = public.rate_limits.count + 1
  returning count into v_count;
  return v_count <= p_limit;
end $$;

-- ---------- 7. View cho HR ----------
create or replace view public.v_applications_overdue
with (security_invoker = true) as
  select id, created_at, job_title, full_name, phone, status,
         (now()::date - created_at::date) as days_open
  from public.applications
  where status in ('new','reviewing') and created_at < now() - interval '30 days';

drop view if exists public.v_application_stats;
create view public.v_application_stats
with (security_invoker = true) as
  select job_slug, job_title, status, count(*)::int as total
  from public.applications
  where status <> 'uploading'
  group by job_slug, job_title, status;

-- ---------- 8. Row Level Security ----------
alter table public.jobs                enable row level security;
alter table public.applications        enable row level security;
alter table public.application_events  enable row level security;
alter table public.hr_users            enable row level security;
alter table public.rate_limits         enable row level security;

-- Ai cũng xem được vị trí đang tuyển (để web đọc trực tiếp nếu muốn)
drop policy if exists jobs_public_read on public.jobs;
create policy jobs_public_read on public.jobs
  for select to anon, authenticated using (active = true);

drop policy if exists jobs_hr_all on public.jobs;
create policy jobs_hr_all on public.jobs
  for all to authenticated using (public.is_hr()) with check (public.is_hr());

-- Hồ sơ: CHỈ HR đăng nhập mới xem/sửa. Ứng viên KHÔNG đọc được gì.
-- Việc tạo hồ sơ đi qua API server dùng service_role (bỏ qua RLS).
drop policy if exists app_hr_select on public.applications;
create policy app_hr_select on public.applications
  for select to authenticated using (public.is_hr());

drop policy if exists app_hr_update on public.applications;
create policy app_hr_update on public.applications
  for update to authenticated using (public.is_hr()) with check (public.is_hr());

drop policy if exists events_hr_select on public.application_events;
create policy events_hr_select on public.application_events
  for select to authenticated using (public.is_hr());

drop policy if exists hr_users_self on public.hr_users;
create policy hr_users_self on public.hr_users
  for select to authenticated using (public.is_hr());
-- rate_limits: không có policy → chỉ service_role/hàm security definer dùng được.

-- Thu hồi quyền mặc định không cần thiết
revoke all on public.applications, public.application_events, public.rate_limits, public.hr_users from anon;
revoke execute on function public.check_rate_limit(text,int,int) from anon, authenticated, public;
grant  execute on function public.check_rate_limit(text,int,int) to service_role;

-- ---------- 9. Storage: bucket 'cv' (PRIVATE) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cv', 'cv', false, 5242880,   -- 5 MB
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ]
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Ứng viên upload qua signed upload URL do server tạo → không cần policy insert cho anon.
-- HR đăng nhập được xem/tải CV:
drop policy if exists cv_hr_read on storage.objects;
create policy cv_hr_read on storage.objects
  for select to authenticated using (bucket_id = 'cv' and public.is_hr());

drop policy if exists cv_hr_delete on storage.objects;
create policy cv_hr_delete on storage.objects
  for delete to authenticated using (bucket_id = 'cv' and public.is_hr());

-- ---------- 10. Dữ liệu ban đầu ----------
-- Chỉ thêm dữ liệu mẫu khi bảng còn trống (chạy lại file này không tạo vị trí trùng)
do $seed$ begin
if not exists (select 1 from public.jobs) then
insert into public.jobs (slug, title, quantity, employment_type, audience, requirements, responsibilities, sort_order, date_posted)
values
(
  'dieu-duong', 'Điều dưỡng', null, 'FULL_TIME', 'Dành cho tân cử nhân Điều dưỡng',
  array[
    'Tốt nghiệp chuyên ngành Điều dưỡng – ưu tiên sinh viên mới ra trường.',
    'Có sức khỏe tốt.',
    'Tận tâm, kiên nhẫn, yêu thích chăm sóc người cao tuổi.',
    'Sẵn sàng làm việc theo ca và tham gia đào tạo tại Nhật Bản.'
  ],
  array[
    'Theo dõi, chăm sóc sức khỏe người cao tuổi theo quy trình chuyên môn.',
    'Hỗ trợ sinh hoạt, vận động và phục hồi chức năng hằng ngày.',
    'Ghi nhận, báo cáo tình trạng sức khỏe; phối hợp với bác sĩ và đội ngũ chăm sóc.'
  ],
  1, '2026-10-13'
),
(
  'caregiver', 'Nhân viên chăm sóc người cao tuổi (Caregiver)', 2, 'FULL_TIME', null,
  array[
    'Ưu tiên tốt nghiệp THPT (lớp 12).',
    'Có sức khỏe tốt.',
    'Tận tâm, kiên nhẫn, yêu thích chăm sóc người cao tuổi.',
    'Sẵn sàng làm việc theo ca và tham gia đào tạo tại Nhật Bản.'
  ],
  array[
    'Hỗ trợ sinh hoạt hằng ngày: ăn uống, vệ sinh, di chuyển, nghỉ ngơi.',
    'Đồng hành trong các hoạt động vận động, giải trí tại Trung tâm.',
    'Quan sát và báo cáo kịp thời thay đổi sức khỏe cho Điều dưỡng phụ trách.'
  ],
  2, '2026-10-13'
)
on conflict (slug) do nothing;
end if;
end $seed$;

-- Thêm email HR được phép đăng nhập trang quản trị (sửa lại cho đúng):
insert into public.hr_users (email, full_name, role)
values ('hr@vioraliving.com.vn', 'Phòng Nhân sự', 'admin')
on conflict (email) do nothing;

-- ---------- 11. Dọn dẹp (gọi từ Vercel Cron hằng ngày, qua service_role) ----------
create or replace function public.cleanup_stale()
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_apps int; v_rl int;
begin
  delete from public.applications
   where status = 'uploading' and created_at < now() - interval '24 hours';
  get diagnostics v_apps = row_count;
  delete from public.rate_limits where window_start < now() - interval '2 days';
  get diagnostics v_rl = row_count;
  return jsonb_build_object('deleted_uploading', v_apps, 'deleted_rate_limits', v_rl);
end $$;
revoke execute on function public.cleanup_stale() from anon, authenticated, public;
grant  execute on function public.cleanup_stale() to service_role;
-- Lưu ý: file CV mồ côi của hồ sơ 'uploading' bị xoá phải được xoá qua Storage API
-- (API cron lấy danh sách cv_path trước khi gọi cleanup_stale()).
