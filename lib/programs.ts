// Nội dung 2 chương trình tuyển dụng, lấy từ poster tuyển dụng của Viora.
// Danh sách vị trí (số lượng, yêu cầu, mô tả) nằm trong bảng `jobs` của Supabase.

export type ProgramId = 'nhat-ban' | 'thuong';

export type Program = {
  id: ProgramId;
  tab: string;
  eyebrow: string;
  title: string;
  lead: string;
  benefits: string[];
};

export const PROGRAMS: Record<ProgramId, Program> = {
  'nhat-ban': {
    id: 'nhat-ban',
    tab: 'Đào tạo tại Nhật Bản',
    eyebrow: 'Đặc biệt · Sau khi trúng tuyển',
    title: 'Được đào tạo tại Nhật Bản',
    lead: 'Khởi đầu sự nghiệp chăm sóc người cao tuổi theo tiêu chuẩn Nhật Bản cùng Viora Living Saigon. Chi phí ăn ở, đi lại do Viora Living Saigon chi trả.',
    benefits: [
      'Thu nhập cạnh tranh, theo năng lực.',
      'Đào tạo quy trình chăm sóc chuẩn Nhật Bản.',
      'BHXH, BHYT, BHTN và phúc lợi đầy đủ.',
      'Lộ trình phát triển lên vị trí quản lý.',
      'Môi trường chuyên nghiệp, thân thiện.',
      'Có chỗ lưu trú tại cơ sở khi có nhu cầu.',
    ],
  },
  thuong: {
    id: 'thuong',
    tab: 'Tuyển dụng thường xuyên',
    eyebrow: 'Full-time · Part-time',
    title: 'Cùng Viora chăm sóc người cao tuổi',
    lead: 'Bằng sự tận tâm, tôn trọng và chuyên nghiệp. Làm việc theo ca, 6 ngày/tuần, chọn Full-time hoặc Part-time.',
    benefits: [
      'Được đào tạo chuyên môn về chăm sóc người cao tuổi tại Nhật.',
      'Được đào tạo bài bản về quy trình chăm sóc người cao tuổi theo tiêu chuẩn Nhật Bản.',
      'Làm việc trong môi trường chuyên nghiệp, thân thiện, nhiều cơ hội phát triển và nâng cao tay nghề.',
      'Có lộ trình phát triển lên các vị trí quản lý đối với nhân sự gắn bó lâu dài.',
      'BHXH, BHYT, BHTN và các chế độ phúc lợi đầy đủ.',
      'Có chỗ lưu trú tại cơ sở cho nhân sự có nhu cầu.',
    ],
  },
};

// Thu nhập & hình thức (poster tuyển dụng thường xuyên)
export const INCOME = [
  { label: 'Thu nhập Full-time', value: 'Cạnh tranh, hấp dẫn', note: 'Theo năng lực và kinh nghiệm' },
  { label: 'Part-time', value: 'Thu nhập theo giờ', note: 'Thỏa thuận theo năng lực' },
  { label: 'Hình thức làm việc', value: 'Full-time · Part-time', note: 'Làm việc theo ca · 6 ngày/tuần' },
];
