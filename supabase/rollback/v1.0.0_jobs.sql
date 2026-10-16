-- =====================================================================
-- ROLLBACK nội dung vị trí về v1.0.0 (16/10/2026)
-- Dùng khi đã chạy 20261017000000_viora_noi_dung_poster_moi.sql và muốn quay lại.
-- Chạy trong Supabase SQL Editor, SAU ĐÓ chạy lại file
-- supabase/migrations/20261016000000_viora_nhan_chua_kinh_nghiem.sql (khôi phục yêu cầu v1.0.0).
-- Code website quay lại bằng nhánh GitHub release/v1.0.0 (xem VERSIONS.md).
-- =====================================================================
update public.jobs set title = 'Kỹ thuật viên Vật lý trị liệu'
 where slug in ('vat-ly-tri-lieu', 'tan-sinh-vien-vat-ly-tri-lieu');

update public.jobs set responsibilities = array[
  'Theo dõi, chăm sóc sức khỏe người cao tuổi theo quy trình chuyên môn.',
  'Ghi nhận, báo cáo tình trạng sức khỏe; phối hợp với bác sĩ.'
] where slug = 'tan-sinh-vien-dieu-duong';

update public.jobs set responsibilities = array[
  'Hỗ trợ sinh hoạt hằng ngày: ăn uống, vệ sinh, di chuyển, nghỉ ngơi.',
  'Đồng hành vận động, giải trí; báo cáo thay đổi sức khỏe cho Điều dưỡng.'
] where slug = 'tan-sinh-vien-caregiver';

update public.jobs set responsibilities = array[
  'Hỗ trợ sinh hoạt hằng ngày: ăn uống, vệ sinh, di chuyển, nghỉ ngơi.',
  'Đồng hành trong các hoạt động vận động, giải trí và sinh hoạt tại Trung tâm.',
  'Quan sát và báo cáo kịp thời các thay đổi về sức khỏe cho Điều dưỡng phụ trách.'
] where slug = 'nhan-vien-cham-soc';

update public.jobs set responsibilities = array[
  'Thực hiện các bài tập vật lý trị liệu, phục hồi chức năng cho người cao tuổi theo chỉ định.',
  'Theo dõi tiến triển vận động, phối hợp với đội ngũ chăm sóc.'
] where slug in ('vat-ly-tri-lieu', 'tan-sinh-vien-vat-ly-tri-lieu');
