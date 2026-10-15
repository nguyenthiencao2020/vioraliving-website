-- =====================================================================
-- Viora Living Saigon – Nhận ứng viên mới tốt nghiệp / chưa có kinh nghiệm
-- Chạy SAU 3 file trước (SQL Editor → New query → Run). An toàn khi chạy lại.
--
--  * Thêm "Kỹ thuật viên Vật lý trị liệu" vào Chương trình Tân sinh viên (Full-time)
--  * Cả 6 vị trí ghi rõ: chấp nhận ứng viên chưa có kinh nghiệm – được đào tạo
-- =====================================================================

insert into public.jobs (slug, program, title, quantity, employment_type, work_types, audience, requirements, responsibilities, sort_order, date_posted, location)
values (
  'tan-sinh-vien-vat-ly-tri-lieu', 'tan-sinh-vien', 'Kỹ thuật viên Vật lý trị liệu', null, 'FULL_TIME', '{FULL_TIME}', null,
  array[]::text[],
  array[
    'Thực hiện các bài tập vật lý trị liệu, phục hồi chức năng cho người cao tuổi theo chỉ định.',
    'Theo dõi tiến triển vận động, phối hợp với đội ngũ chăm sóc.'
  ],
  3, '2026-10-16',
  'Viora Living Saigon – Cơ sở Lái Thiêu, Khu phố Bình Đức 2, Phường Lái Thiêu, TP.HCM'
)
on conflict (slug) do nothing;

-- ---------- Chương trình Tân sinh viên ----------
update public.jobs set requirements = array[
  'Tốt nghiệp chuyên ngành Điều dưỡng – ưu tiên mới ra trường.',
  'Chấp nhận ứng viên chưa có kinh nghiệm – được đào tạo thực tế tại nơi làm việc.',
  'Có sức khỏe tốt.',
  'Tận tâm, kiên nhẫn, yêu thích chăm sóc người cao tuổi.',
  'Sẵn sàng làm theo ca và tham gia đào tạo tại Nhật.'
] where slug = 'tan-sinh-vien-dieu-duong';

update public.jobs set requirements = array[
  'Ưu tiên tốt nghiệp THPT (lớp 12).',
  'Chấp nhận ứng viên chưa có kinh nghiệm – được đào tạo thực tế tại nơi làm việc.',
  'Có sức khỏe tốt.',
  'Tận tâm, kiên nhẫn, yêu thích chăm sóc người cao tuổi.',
  'Sẵn sàng làm theo ca và tham gia đào tạo tại Nhật.'
] where slug = 'tan-sinh-vien-caregiver';

update public.jobs set requirements = array[
  'Tốt nghiệp chuyên ngành Vật lý trị liệu / Phục hồi chức năng – ưu tiên mới ra trường.',
  'Chấp nhận ứng viên chưa có kinh nghiệm – được đào tạo thực tế tại nơi làm việc.',
  'Có sức khỏe tốt.',
  'Tận tâm, kiên nhẫn, yêu thích chăm sóc người cao tuổi.',
  'Sẵn sàng làm theo ca và tham gia đào tạo tại Nhật.'
] where slug = 'tan-sinh-vien-vat-ly-tri-lieu';

-- ---------- Tuyển dụng chung ----------
update public.jobs set requirements = array[
  'Tốt nghiệp chuyên ngành Điều dưỡng phù hợp với vị trí.',
  'Chấp nhận ứng viên mới tốt nghiệp, chưa có kinh nghiệm – được đào tạo.',
  'Có sức khỏe tốt.',
  'Tận tâm, kiên nhẫn, trách nhiệm và yêu thích công việc chăm sóc người cao tuổi.',
  'Có khả năng làm việc theo ca.',
  'Ưu tiên ứng viên ở tỉnh có nhu cầu làm việc ổn định, lâu dài.'
] where slug = 'dieu-duong';

update public.jobs set requirements = array[
  'Chấp nhận ứng viên chưa có kinh nghiệm – được đào tạo từ đầu.',
  'Có sức khỏe tốt.',
  'Tận tâm, kiên nhẫn, trách nhiệm và yêu thích công việc chăm sóc người cao tuổi.',
  'Có khả năng làm việc theo ca.',
  'Ưu tiên ứng viên ở tỉnh có nhu cầu làm việc ổn định, lâu dài.'
] where slug = 'nhan-vien-cham-soc';

update public.jobs set requirements = array[
  'Tốt nghiệp chuyên ngành Vật lý trị liệu / Phục hồi chức năng.',
  'Chấp nhận ứng viên mới tốt nghiệp, chưa có kinh nghiệm – được đào tạo.',
  'Có sức khỏe tốt.',
  'Tận tâm, kiên nhẫn, trách nhiệm và yêu thích công việc chăm sóc người cao tuổi.',
  'Có khả năng làm việc theo ca.',
  'Ưu tiên ứng viên ở tỉnh có nhu cầu làm việc ổn định, lâu dài.'
] where slug = 'vat-ly-tri-lieu';
