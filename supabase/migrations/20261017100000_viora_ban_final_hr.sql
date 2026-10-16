-- =====================================================================
-- Viora Living Saigon – v1.2.0: BẢN FINAL theo poster HR (16/10/2026)
-- Chạy trong SQL Editor (sau các file trước). An toàn khi chạy lại.
--
--  * Chỉ tuyển 3 vị trí (Tuyển dụng chung): 10 Điều dưỡng, 10 NV chăm sóc người cao tuổi, 05 KTV VLTL – PHCN
--  * TẠM ẨN Chương trình Tân sinh viên (không xóa – hồ sơ cũ giữ nguyên).
--    Bật lại: supabase/rollback/bat_lai_tan_sinh_vien.sql
--  * Yêu cầu ghi đúng nguyên văn "Yêu cầu chung" trên poster
-- =====================================================================

update public.jobs set active = false where program = 'tan-sinh-vien';

update public.jobs set quantity = 10 where slug = 'dieu-duong';
update public.jobs set quantity = 10 where slug = 'nhan-vien-cham-soc';
update public.jobs set quantity = 5  where slug = 'vat-ly-tri-lieu';

update public.jobs set requirements = array[
  'Tốt nghiệp chuyên ngành Điều dưỡng phù hợp với vị trí.',
  'Có sức khỏe tốt.',
  'Tận tâm, kiên nhẫn, trách nhiệm và yêu thích công việc chăm sóc người cao tuổi.',
  'Có khả năng làm việc theo ca.',
  'Ưu tiên ứng viên ở tỉnh có nhu cầu làm việc ổn định, lâu dài.'
] where slug = 'dieu-duong';

update public.jobs set requirements = array[
  'Ưu tiên đã được đào tạo hoặc có kinh nghiệm chăm sóc người cao tuổi/người bệnh.',
  'Có sức khỏe tốt.',
  'Tận tâm, kiên nhẫn, trách nhiệm và yêu thích công việc chăm sóc người cao tuổi.',
  'Có khả năng làm việc theo ca.',
  'Ưu tiên ứng viên ở tỉnh có nhu cầu làm việc ổn định, lâu dài.'
] where slug = 'nhan-vien-cham-soc';

update public.jobs set requirements = array[
  'Tốt nghiệp chuyên ngành phù hợp (Vật lý trị liệu, Phục hồi chức năng).',
  'Có sức khỏe tốt.',
  'Tận tâm, kiên nhẫn, trách nhiệm và yêu thích công việc chăm sóc người cao tuổi.',
  'Có khả năng làm việc theo ca.',
  'Ưu tiên ứng viên ở tỉnh có nhu cầu làm việc ổn định, lâu dài.'
] where slug = 'vat-ly-tri-lieu';
