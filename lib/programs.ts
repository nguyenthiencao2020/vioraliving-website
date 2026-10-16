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
    lead: 'Điều dưỡng, Nhân viên chăm sóc người cao tuổi và Kỹ thuật viên Vật lý trị liệu, Phục hồi chức năng. Chọn Full-time hoặc Part-time, làm việc theo ca 6 ngày/tuần.',
  },
  'tan-sinh-vien': {
    id: 'tan-sinh-vien',
    tab: 'Chương trình Tân sinh viên',
    audience: 'Dành cho bạn mới tốt nghiệp',
    title: 'Chương trình Tân sinh viên',
    lead: 'Khởi đầu sự nghiệp chăm sóc người cao tuổi theo tiêu chuẩn Nhật Bản cùng Viora Living Saigon. Dành cho sinh viên, học viên vừa tốt nghiệp – chưa có kinh nghiệm, Viora đào tạo từ đầu.',
  },
};

// Chính sách chung cho cả 2 chương trình (theo poster tuyển dụng 16/10/2026)
export const BENEFITS = [
  'Được đào tạo chuyên môn về chăm sóc người cao tuổi tại Nhật Bản – chi phí ăn ở, đi lại do Viora Living Saigon chi trả.',
  'Nhận ứng viên mới tốt nghiệp, chưa có kinh nghiệm – được kèm cặp, đào tạo thực tế ngay tại nơi làm việc.',
  'Thu nhập cạnh tranh, theo năng lực và kinh nghiệm.',
  'BHXH, BHYT, BHTN và các chế độ phúc lợi đầy đủ.',
  'Môi trường làm việc chuyên nghiệp, nhân văn.',
  'Cơ hội phát triển nghề nghiệp lâu dài trong lĩnh vực chăm sóc người cao tuổi.',
  'Có chỗ lưu trú tại Trung tâm cho nhân sự có nhu cầu.',
];

// Biểu tượng cho từng quyền lợi ở trên (cùng thứ tự)
export const BENEFIT_ICONS = ['plane', 'graduation', 'trend', 'shield', 'users', 'sprout', 'home'] as const;

// Link cũ (mã QR in trước khi đổi tên) vẫn mở đúng chương trình / vị trí
export const LEGACY_PROGRAM: Record<string, ProgramId> = { 'nhat-ban': 'tan-sinh-vien' };
export const legacySlug = (slug: string) => slug.replace(/^nhat-ban-/, 'tan-sinh-vien-');

// 4 giá trị của Viora (theo poster)
export const VALUES = [
  { icon: 'heart', title: 'Tận tâm', text: 'Chăm sóc bằng trái tim', image: '/images/value-tan-tam.webp', pos: '64% 40%', alt: 'Nhân viên Viora nắm tay, trò chuyện cùng người cao tuổi' },
  { icon: 'users', title: 'Chuyên nghiệp', text: 'Đội ngũ chăm sóc chuyên môn', image: '/images/value-chuyen-nghiep.webp', pos: '60% 50%', alt: 'Khuôn viên khu dưỡng lão Viora Living Saigon' },
  { icon: 'sprout', title: 'Toàn diện', text: 'Sức khỏe thể chất và tinh thần', image: '/images/value-toan-dien.webp', pos: '55% 40%', alt: 'Nhân viên Viora cùng người cao tuổi trong vườn hoa' },
  { icon: 'sparkle', title: 'Kiến tạo', text: 'Cuộc sống ý nghĩa mỗi ngày', image: '/images/value-kien-tao.webp', pos: '58% 50%', alt: 'Phòng nghỉ sáng sủa, ấm cúng tại Viora' },
] as const;

// Thu nhập & hình thức (poster tuyển dụng thường xuyên)
export const INCOME = [
  { label: 'Thu nhập Full-time', value: 'Cạnh tranh, hấp dẫn', note: 'Theo năng lực và kinh nghiệm' },
  { label: 'Part-time', value: 'Thu nhập theo giờ', note: 'Thỏa thuận theo năng lực' },
  { label: 'Hình thức làm việc', value: 'Full-time · Part-time', note: 'Làm việc theo ca · 6 ngày/tuần' },
];
