// Nội dung 2 chương trình tuyển dụng, lấy từ poster tuyển dụng của Viora.
// Danh sách vị trí (số lượng, yêu cầu, mô tả) nằm trong bảng `jobs` của Supabase.

export type ProgramId = 'thuong' | 'tan-sinh-vien';

export type Program = {
  id: ProgramId;
  tab: string;
  audience: string;
  title: string;
  lead: string;
};

// 2 chương trình có CHÍNH SÁCH & QUYỀN LỢI NHƯ NHAU, chỉ khác đối tượng tuyển.
export const PROGRAMS: Record<ProgramId, Program> = {
  thuong: {
    id: 'thuong',
    tab: 'Tuyển dụng chung',
    audience: 'Dành cho mọi ứng viên',
    title: 'Tuyển dụng chung',
    lead: 'Điều dưỡng, Nhân viên chăm sóc người cao tuổi và Kỹ thuật viên Vật lý trị liệu. Chọn Full-time hoặc Part-time, làm việc theo ca 6 ngày/tuần.',
  },
  'tan-sinh-vien': {
    id: 'tan-sinh-vien',
    tab: 'Chương trình Tân sinh viên',
    audience: 'Dành cho bạn mới tốt nghiệp',
    title: 'Chương trình Tân sinh viên',
    lead: 'Khởi đầu sự nghiệp chăm sóc người cao tuổi theo tiêu chuẩn Nhật Bản cùng Viora Living Saigon. Dành cho sinh viên, học viên vừa tốt nghiệp – chưa có kinh nghiệm, Viora đào tạo từ đầu.',
  },
};

// Chính sách chung cho cả 2 chương trình (theo 2 poster)
export const BENEFITS = [
  'Được đào tạo chuyên môn về chăm sóc người cao tuổi tại Nhật Bản – chi phí ăn ở, đi lại do Viora Living Saigon chi trả.',
  'Nhận ứng viên mới tốt nghiệp, chưa có kinh nghiệm – được kèm cặp, đào tạo thực tế ngay tại nơi làm việc.',
  'Được đào tạo bài bản về quy trình chăm sóc người cao tuổi theo tiêu chuẩn Nhật Bản.',
  'Thu nhập cạnh tranh, theo năng lực và kinh nghiệm.',
  'Làm việc trong môi trường chuyên nghiệp, thân thiện, nhiều cơ hội phát triển và nâng cao tay nghề.',
  'Có lộ trình phát triển lên các vị trí quản lý đối với nhân sự gắn bó lâu dài.',
  'BHXH, BHYT, BHTN và các chế độ phúc lợi đầy đủ.',
];

// Link cũ (mã QR in trước khi đổi tên) vẫn mở đúng chương trình / vị trí
export const LEGACY_PROGRAM: Record<string, ProgramId> = { 'nhat-ban': 'tan-sinh-vien' };
export const legacySlug = (slug: string) => slug.replace(/^nhat-ban-/, 'tan-sinh-vien-');

// Thu nhập & hình thức (poster tuyển dụng thường xuyên)
export const INCOME = [
  { label: 'Thu nhập Full-time', value: 'Cạnh tranh, hấp dẫn', note: 'Theo năng lực và kinh nghiệm' },
  { label: 'Part-time', value: 'Thu nhập theo giờ', note: 'Thỏa thuận theo năng lực' },
  { label: 'Hình thức làm việc', value: 'Full-time · Part-time', note: 'Làm việc theo ca · 6 ngày/tuần' },
];
