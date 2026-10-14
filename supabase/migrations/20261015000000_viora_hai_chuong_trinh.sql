-- =====================================================================
-- Viora Living Saigon – 2 chương trình tuyển dụng (theo 2 poster) + thông tin bổ sung trong form
-- Chạy SAU 2 file trước (SQL Editor → New query → Run). An toàn khi chạy lại.
--
--  * 'thuong'        : Tuyển dụng chung – 10 Điều dưỡng, 10 NV chăm sóc, 05 KTV Vật lý trị liệu
--  * 'tan-sinh-vien' : Chương trình Tân sinh viên – Điều dưỡng, 02 Caregiver
--  Cả 2 chương trình đều được đào tạo tại Nhật Bản.
-- =====================================================================

-- ---------- 1. Bảng jobs: chương trình + hình thức làm việc ----------
alter table public.jobs add column if not exists program text not null default 'thuong';
alter table public.jobs add column if not exists work_types public.employment_type[] not null default '{FULL_TIME}';

-- Dọn tên cũ nếu đã chạy bản trước của file này ('nhat-ban' → 'tan-sinh-vien')
alter table public.jobs drop constraint if exists jobs_program_check;
update public.jobs set program = 'tan-sinh-vien' where program = 'nhat-ban';
update public.jobs set slug = 'tan-sinh-vien-dieu-duong'
 where slug = 'nhat-ban-dieu-duong' and not exists (select 1 from public.jobs where slug = 'tan-sinh-vien-dieu-duong');
update public.jobs set slug = 'tan-sinh-vien-caregiver'
 where slug = 'nhat-ban-caregiver' and not exists (select 1 from public.jobs where slug = 'tan-sinh-vien-caregiver');

-- 2 vị trí có sẵn từ file đầu tiên thuộc Chương trình Tân sinh viên → đổi slug
-- (applications.job_slug có ON UPDATE CASCADE nên hồ sơ cũ, nếu có, vẫn khớp)
update public.jobs set slug = 'tan-sinh-vien-dieu-duong', program = 'tan-sinh-vien'
 where slug = 'dieu-duong' and not exists (select 1 from public.jobs where slug = 'tan-sinh-vien-dieu-duong');
update public.jobs set slug = 'tan-sinh-vien-caregiver', program = 'tan-sinh-vien'
 where slug = 'caregiver' and not exists (select 1 from public.jobs where slug = 'tan-sinh-vien-caregiver');

alter table public.jobs add constraint jobs_program_check check (program in ('thuong','tan-sinh-vien'));

-- ---------- 2. Chương trình Tân sinh viên (poster "Tuyển dụng Điều dưỡng & Nhân viên chăm sóc (Caregiver)") ----------
update public.jobs set
  program = 'tan-sinh-vien',
  title = 'Điều dưỡng',
  quantity = null,
  employment_type = 'FULL_TIME',
  work_types = '{FULL_TIME}',
  audience = 'Dành cho tân cử nhân Điều dưỡng',
  requirements = array[
    'Tốt nghiệp chuyên ngành Điều dưỡng – ưu tiên mới ra trường.',
    'Dưới 35 tuổi, sức khỏe tốt.',
    'Tận tâm, kiên nhẫn, yêu thích chăm sóc người cao tuổi.',
    'Sẵn sàng làm theo ca và tham gia đào tạo tại Nhật.'
  ],
  responsibilities = array[
    'Theo dõi, chăm sóc sức khỏe người cao tuổi theo quy trình chuyên môn.',
    'Ghi nhận, báo cáo tình trạng sức khỏe; phối hợp với bác sĩ.'
  ],
  sort_order = 1
where slug = 'tan-sinh-vien-dieu-duong';

update public.jobs set
  program = 'tan-sinh-vien',
  title = 'Nhân viên chăm sóc (Caregiver)',
  quantity = 2,
  employment_type = 'FULL_TIME',
  work_types = '{FULL_TIME}',
  audience = null,
  requirements = array[
    'Ưu tiên tốt nghiệp THPT (lớp 12).',
    'Dưới 50 tuổi, sức khỏe tốt.',
    'Tận tâm, kiên nhẫn, yêu thích chăm sóc người cao tuổi.',
    'Sẵn sàng làm theo ca và tham gia đào tạo tại Nhật.'
  ],
  responsibilities = array[
    'Hỗ trợ sinh hoạt hằng ngày: ăn uống, vệ sinh, di chuyển, nghỉ ngơi.',
    'Đồng hành vận động, giải trí; báo cáo thay đổi sức khỏe cho Điều dưỡng.'
  ],
  sort_order = 2
where slug = 'tan-sinh-vien-caregiver';

-- ---------- 3. Tuyển dụng chung (poster "Tuyển dụng") ----------
insert into public.jobs (slug, program, title, quantity, employment_type, work_types, audience, requirements, responsibilities, sort_order, date_posted)
values
(
  'dieu-duong', 'thuong', 'Điều dưỡng', 10, 'FULL_TIME', '{FULL_TIME,PART_TIME}', null,
  array[]::text[],
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
  array[]::text[],
  array[
    'Hỗ trợ sinh hoạt hằng ngày: ăn uống, vệ sinh, di chuyển, nghỉ ngơi.',
    'Đồng hành trong các hoạt động vận động, giải trí và sinh hoạt tại Trung tâm.',
    'Quan sát và báo cáo kịp thời các thay đổi về sức khỏe cho Điều dưỡng phụ trách.'
  ],
  12, '2026-10-15'
),
(
  'vat-ly-tri-lieu', 'thuong', 'Kỹ thuật viên Vật lý trị liệu', 5, 'FULL_TIME', '{FULL_TIME,PART_TIME}', null,
  array[]::text[],
  array[
    'Thực hiện các bài tập vật lý trị liệu, phục hồi chức năng cho người cao tuổi theo chỉ định.',
    'Theo dõi tiến triển vận động, phối hợp với đội ngũ chăm sóc.'
  ],
  13, '2026-10-15'
)
on conflict (slug) do nothing;

-- Yêu cầu: ghi đúng từng ý như poster (chạy lại vẫn cập nhật)
update public.jobs set requirements = array[
  'Tốt nghiệp chuyên ngành Điều dưỡng phù hợp với vị trí.',
  'Có sức khỏe tốt.',
  'Tận tâm, kiên nhẫn, trách nhiệm và yêu thích công việc chăm sóc người cao tuổi.',
  'Có khả năng làm việc theo ca.',
  'Ưu tiên ứng viên ở tỉnh có nhu cầu làm việc ổn định, lâu dài.'
] where slug = 'dieu-duong' and program = 'thuong';

update public.jobs set requirements = array[
  'Ưu tiên đã được đào tạo hoặc có kinh nghiệm chăm sóc người cao tuổi/người bệnh.',
  'Có sức khỏe tốt.',
  'Tận tâm, kiên nhẫn, trách nhiệm và yêu thích công việc chăm sóc người cao tuổi.',
  'Có khả năng làm việc theo ca.',
  'Ưu tiên ứng viên ở tỉnh có nhu cầu làm việc ổn định, lâu dài.'
] where slug = 'nhan-vien-cham-soc';

update public.jobs set requirements = array[
  'Tốt nghiệp chuyên ngành Vật lý trị liệu / Phục hồi chức năng.',
  'Có sức khỏe tốt.',
  'Tận tâm, kiên nhẫn, trách nhiệm và yêu thích công việc chăm sóc người cao tuổi.',
  'Có khả năng làm việc theo ca.',
  'Ưu tiên ứng viên ở tỉnh có nhu cầu làm việc ổn định, lâu dài.'
] where slug = 'vat-ly-tri-lieu';

-- Địa chỉ đầy đủ cho mọi vị trí
update public.jobs set location = 'Viora Living Saigon – Cơ sở Lái Thiêu, Khu phố Bình Đức 2, Phường Lái Thiêu, TP.HCM';

-- ---------- 4. Bảng applications: thông tin thêm từ form ----------
alter table public.applications add column if not exists program text;
alter table public.applications add column if not exists work_type public.employment_type;
update public.applications set program = 'tan-sinh-vien' where program = 'nhat-ban';

create index if not exists idx_app_program on public.applications (program, created_at desc);

-- Thống kê theo chương trình (đổi cột nên phải tạo lại view)
drop view if exists public.v_application_stats;
create view public.v_application_stats
with (security_invoker = true) as
  select program, job_slug, job_title, status, count(*)::int as total
  from public.applications
  where status <> 'uploading'
  group by program, job_slug, job_title, status;
