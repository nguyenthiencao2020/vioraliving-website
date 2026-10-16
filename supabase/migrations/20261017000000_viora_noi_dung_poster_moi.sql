-- =====================================================================
-- Viora Living Saigon – v1.1.0: cập nhật nội dung theo poster tuyển dụng mới của HR (16/10/2026)
-- Chạy SAU 4 file trước (SQL Editor → New query → Run). An toàn khi chạy lại.
-- Muốn quay về v1.0.0: chạy supabase/rollback/v1.0.0_jobs.sql
--
--  * KTV đổi tên: "Kỹ thuật viên Vật lý trị liệu, Phục hồi chức năng"
--  * Mô tả công việc + yêu cầu ghi đúng theo poster
--  * Vẫn giữ dòng "chấp nhận ứng viên chưa có kinh nghiệm" (theo yêu cầu HR trước đó)
-- =====================================================================

-- ---------- Tên vị trí ----------
update public.jobs set title = 'Kỹ thuật viên Vật lý trị liệu, Phục hồi chức năng'
 where slug in ('vat-ly-tri-lieu', 'tan-sinh-vien-vat-ly-tri-lieu');

-- ---------- Mô tả công việc (giống nhau ở cả 2 chương trình) ----------
update public.jobs set responsibilities = array[
  'Theo dõi và chăm sóc sức khỏe người cao tuổi.',
  'Thực hiện công tác điều dưỡng theo chỉ định và quy trình chuyên môn.',
  'Hỗ trợ sinh hoạt, vận động và phục hồi chức năng hằng ngày.',
  'Theo dõi, ghi nhận và báo cáo tình trạng sức khỏe.',
  'Phối hợp với bác sĩ và đội ngũ chăm sóc trong kế hoạch chăm sóc cá nhân.'
] where slug in ('dieu-duong', 'tan-sinh-vien-dieu-duong');

update public.jobs set responsibilities = array[
  'Hỗ trợ người cao tuổi trong sinh hoạt hằng ngày: ăn uống, vệ sinh, di chuyển, nghỉ ngơi.',
  'Đồng hành trong các hoạt động vận động, giải trí và sinh hoạt tại Trung tâm.',
  'Quan sát và báo cáo kịp thời các thay đổi về sức khỏe cho Điều dưỡng phụ trách.'
] where slug in ('nhan-vien-cham-soc', 'tan-sinh-vien-caregiver');

update public.jobs set responsibilities = array[
  'Đánh giá tình trạng vận động và xây dựng chương trình phục hồi chức năng phù hợp.',
  'Hướng dẫn, hỗ trợ người cao tuổi trong các bài tập vận động, trị liệu.',
  'Phối hợp với bác sĩ và đội ngũ chăm sóc để theo dõi tiến triển và báo cáo kết quả.',
  'Đồng hành trong kế hoạch phục hồi chức năng cá nhân.'
] where slug in ('vat-ly-tri-lieu', 'tan-sinh-vien-vat-ly-tri-lieu');

-- ---------- Yêu cầu – Tuyển dụng chung (theo "Yêu cầu chung" trên poster) ----------
update public.jobs set requirements = array[
  'Tốt nghiệp chuyên ngành Điều dưỡng phù hợp với vị trí.',
  'Chấp nhận ứng viên mới tốt nghiệp, chưa có kinh nghiệm – được đào tạo.',
  'Có sức khỏe tốt.',
  'Tận tâm, kiên nhẫn, trách nhiệm và yêu thích công việc chăm sóc người cao tuổi.',
  'Có khả năng làm việc theo ca.',
  'Ưu tiên ứng viên ở tỉnh có nhu cầu làm việc ổn định, lâu dài.'
] where slug = 'dieu-duong';

update public.jobs set requirements = array[
  'Ưu tiên đã được đào tạo hoặc có kinh nghiệm chăm sóc người cao tuổi/người bệnh; chưa có kinh nghiệm sẽ được đào tạo.',
  'Có sức khỏe tốt.',
  'Tận tâm, kiên nhẫn, trách nhiệm và yêu thích công việc chăm sóc người cao tuổi.',
  'Có khả năng làm việc theo ca.',
  'Ưu tiên ứng viên ở tỉnh có nhu cầu làm việc ổn định, lâu dài.'
] where slug = 'nhan-vien-cham-soc';

update public.jobs set requirements = array[
  'Tốt nghiệp chuyên ngành phù hợp (Vật lý trị liệu, Phục hồi chức năng).',
  'Chấp nhận ứng viên mới tốt nghiệp, chưa có kinh nghiệm – được đào tạo.',
  'Có sức khỏe tốt.',
  'Tận tâm, kiên nhẫn, trách nhiệm và yêu thích công việc chăm sóc người cao tuổi.',
  'Có khả năng làm việc theo ca.',
  'Ưu tiên ứng viên ở tỉnh có nhu cầu làm việc ổn định, lâu dài.'
] where slug = 'vat-ly-tri-lieu';

update public.jobs set requirements = array[
  'Tốt nghiệp chuyên ngành phù hợp (Vật lý trị liệu, Phục hồi chức năng) – ưu tiên mới ra trường.',
  'Chấp nhận ứng viên chưa có kinh nghiệm – được đào tạo thực tế tại nơi làm việc.',
  'Có sức khỏe tốt.',
  'Tận tâm, kiên nhẫn, yêu thích chăm sóc người cao tuổi.',
  'Sẵn sàng làm theo ca và tham gia đào tạo tại Nhật.'
] where slug = 'tan-sinh-vien-vat-ly-tri-lieu';
