-- =====================================================================
-- Viora Living Saigon – 2 chương trình tuyển dụng + thông tin bổ sung trong form
-- Chạy SAU 2 file trước (SQL Editor → New query → Run). An toàn khi chạy lại.
--
--  * 'nhat-ban' : Chương trình Đào tạo tại Nhật Bản (Điều dưỡng, 02 Caregiver)
--  * 'thuong'   : Tuyển dụng thường xuyên (10 Điều dưỡng, 10 NV chăm sóc, 05 KTV Vật lý trị liệu)
-- =====================================================================

-- ---------- 1. Bảng jobs: chương trình + hình thức làm việc ----------
alter table public.jobs add column if not exists program text not null default 'thuong';
alter table public.jobs add column if not exists work_types public.employment_type[] not null default '{FULL_TIME}';

do $$ begin
  alter table public.jobs add constraint jobs_program_check check (program in ('thuong','nhat-ban'));
exception when duplicate_object then null; end $$;

-- 2 vị trí có sẵn từ file đầu tiên chính là chương trình Nhật Bản → đổi slug cho rõ ràng
-- (applications.job_slug có ON UPDATE CASCADE nên hồ sơ cũ, nếu có, vẫn khớp)
update public.jobs set slug = 'nhat-ban-dieu-duong'
 where slug = 'dieu-duong' and program = 'thuong'
   and not exists (select 1 from public.jobs where slug = 'nhat-ban-dieu-duong');
update public.jobs set slug = 'nhat-ban-caregiver'
 where slug = 'caregiver'
   and not exists (select 1 from public.jobs where slug = 'nhat-ban-caregiver');

-- Nội dung theo poster "Tuyển dụng Điều dưỡng & Nhân viên chăm sóc (Caregiver) – Cơ hội đào tạo tại Nhật Bản"
update public.jobs set
  program = 'nhat-ban',
  title = 'Điều dưỡng',
  quantity = null,
  employment_type = 'FULL_TIME',
  work_types = '{FULL_TIME}',
  audience = 'Ưu tiên sinh viên mới ra trường',
  location = 'Viora Living Saigon – Cơ sở Lái Thiêu',
  requirements = array[
    'Tốt nghiệp chuyên ngành Điều dưỡng – ưu tiên mới ra trường.',
    'Dưới 35 tuổi, sức khỏe tốt.',
    'Tận tâm, kiên nhẫn, yêu thích chăm sóc người cao tuổi.',
    'Sẵn sàng làm theo ca và tham gia đào tạo tại Nhật Bản.'
  ],
  responsibilities = array[
    'Theo dõi, chăm sóc sức khỏe người cao tuổi theo quy trình chuyên môn.',
    'Ghi nhận, báo cáo tình trạng sức khỏe; phối hợp với bác sĩ.'
  ],
  sort_order = 1
where slug = 'nhat-ban-dieu-duong';

update public.jobs set
  program = 'nhat-ban',
  title = 'Nhân viên chăm sóc (Caregiver)',
  quantity = 2,
  employment_type = 'FULL_TIME',
  work_types = '{FULL_TIME}',
  audience = null,
  location = 'Viora Living Saigon – Cơ sở Lái Thiêu',
  requirements = array[
    'Ưu tiên tốt nghiệp THPT (lớp 12).',
    'Dưới 50 tuổi, sức khỏe tốt.',
    'Tận tâm, kiên nhẫn, yêu thích chăm sóc người cao tuổi.',
    'Sẵn sàng làm theo ca và tham gia đào tạo tại Nhật Bản.'
  ],
  responsibilities = array[
    'Hỗ trợ sinh hoạt hằng ngày: ăn uống, vệ sinh, di chuyển, nghỉ ngơi.',
    'Đồng hành vận động, giải trí; báo cáo thay đổi sức khỏe cho Điều dưỡng.'
  ],
  sort_order = 2
where slug = 'nhat-ban-caregiver';

-- Nội dung theo poster "Tuyển dụng" (tuyển thường xuyên)
insert into public.jobs (slug, program, title, quantity, employment_type, work_types, audience, requirements, responsibilities, sort_order, date_posted)
values
(
  'dieu-duong', 'thuong', 'Điều dưỡng', 10, 'FULL_TIME', '{FULL_TIME,PART_TIME}', null,
  array[
    'Tốt nghiệp chuyên ngành Điều dưỡng phù hợp với vị trí.',
    'Có sức khỏe tốt; tận tâm, kiên nhẫn, trách nhiệm và yêu thích công việc chăm sóc người cao tuổi.',
    'Có khả năng làm việc theo ca.',
    'Ưu tiên ứng viên ở tỉnh có nhu cầu làm việc ổn định, lâu dài.'
  ],
  array[
    'Theo dõi và chăm sóc sức khỏe người cao tuổi.',
    'Thực hiện công tác điều dưỡng theo chỉ định và quy trình chuyên môn.',
    'Hỗ trợ sinh hoạt, vận động và phục hồi chức năng hằng ngày.',
    'Theo dõi, ghi nhận và báo cáo tình trạng sức khỏe.',
    'Phối hợp với bác sĩ và đội ngũ chăm sóc trong kế hoạch chăm sóc cá nhân.'
  ],
  11, '2026-10-15'
),
(
  'nhan-vien-cham-soc', 'thuong', 'Nhân viên chăm sóc người cao tuổi', 10, 'FULL_TIME', '{FULL_TIME,PART_TIME}', null,
  array[
    'Ưu tiên đã được đào tạo hoặc có kinh nghiệm chăm sóc người cao tuổi/người bệnh.',
    'Có sức khỏe tốt; tận tâm, kiên nhẫn, trách nhiệm và yêu thích công việc chăm sóc người cao tuổi.',
    'Có khả năng làm việc theo ca.',
    'Ưu tiên ứng viên ở tỉnh có nhu cầu làm việc ổn định, lâu dài.'
  ],
  array[
    'Hỗ trợ sinh hoạt hằng ngày: ăn uống, vệ sinh, di chuyển, nghỉ ngơi.',
    'Đồng hành trong các hoạt động vận động, giải trí và sinh hoạt tại Trung tâm.',
    'Quan sát và báo cáo kịp thời các thay đổi về sức khỏe cho Điều dưỡng phụ trách.'
  ],
  12, '2026-10-15'
),
(
  'vat-ly-tri-lieu', 'thuong', 'Kỹ thuật viên Vật lý trị liệu', 5, 'FULL_TIME', '{FULL_TIME,PART_TIME}', null,
  array[
    'Tốt nghiệp chuyên ngành Vật lý trị liệu / Phục hồi chức năng.',
    'Có sức khỏe tốt; tận tâm, kiên nhẫn, trách nhiệm và yêu thích công việc chăm sóc người cao tuổi.',
    'Có khả năng làm việc theo ca.',
    'Ưu tiên ứng viên ở tỉnh có nhu cầu làm việc ổn định, lâu dài.'
  ],
  array[
    'Thực hiện các bài tập vật lý trị liệu, phục hồi chức năng cho người cao tuổi theo chỉ định.',
    'Theo dõi tiến triển vận động, phối hợp với đội ngũ chăm sóc.'
  ],
  13, '2026-10-15'
)
on conflict (slug) do nothing;

-- Địa chỉ đầy đủ cho mọi vị trí
update public.jobs set location = 'Viora Living Saigon – Cơ sở Lái Thiêu, Khu phố Bình Đức 2, Phường Lái Thiêu, TP.HCM'
 where location = 'Viora Living Saigon – Cơ sở Lái Thiêu';

-- ---------- 2. Bảng applications: thông tin thêm từ form ----------
alter table public.applications add column if not exists program text;
alter table public.applications add column if not exists work_type public.employment_type;
alter table public.applications add column if not exists need_housing boolean not null default false;

-- Cho phép lọc nhanh theo chương trình trong trang quản trị
create index if not exists idx_app_program on public.applications (program, created_at desc);

-- Thống kê theo chương trình (đổi cột nên phải tạo lại view)
drop view if exists public.v_application_stats;
create view public.v_application_stats
with (security_invoker = true) as
  select program, job_slug, job_title, status, count(*)::int as total
  from public.applications
  where status <> 'uploading'
  group by program, job_slug, job_title, status;
