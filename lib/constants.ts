// Đổi giá trị này mỗi khi sửa nội dung trang /chinh-sach-bao-mat
export const CONSENT_VERSION = 'pdp-2026-10-v3';

export const MAX_CV_BYTES = 5 * 1024 * 1024;

export const CV_TYPES: Record<string, { ext: string; label: string }> = {
  'application/pdf': { ext: 'pdf', label: 'PDF' },
  'application/msword': { ext: 'doc', label: 'DOC' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: 'docx', label: 'DOCX' },
  'image/jpeg': { ext: 'jpg', label: 'JPG' },
  'image/png': { ext: 'png', label: 'PNG' },
};

export const EDUCATION_LEVELS = ['THPT', 'Trung cấp', 'Cao đẳng', 'Đại học', 'Sau đại học', 'Khác'] as const;

export const SOURCES = ['Facebook', 'Zalo', 'Website', 'Trường học', 'Người quen giới thiệu', 'Khác'] as const;

export const STATUS_LABELS: Record<string, string> = {
  uploading: 'Đang tải CV',
  new: 'Mới nộp',
  reviewing: 'Đang xem xét',
  interview: 'Phỏng vấn',
  offered: 'Đã mời làm việc',
  hired: 'Đã nhận việc',
  rejected: 'Từ chối',
  withdrawn: 'Ứng viên rút',
};

export const HR_STATUSES = ['new', 'reviewing', 'interview', 'offered', 'hired', 'rejected', 'withdrawn'] as const;

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

// Thông tin liên hệ (theo poster tuyển dụng)
export const CONTACT = {
  email: 'hr@vioraliving.com.vn',
  phone: '0708 2999 07',
  phoneTel: '0708299907',
  address: 'Khu phố Bình Đức 2, Phường Lái Thiêu, TP.HCM',
  place: 'Viora Living Saigon – Cơ sở Lái Thiêu',
  tagline: 'Where Aging Becomes Living',
  // Địa điểm phỏng vấn giai đoạn hiện tại (nơi làm việc vẫn là Cơ sở Lái Thiêu)
  interviewPlace: 'Văn phòng phỏng vấn',
  interviewAddress: '62 Tân Canh, Phường Tân Sơn Hòa, TP.HCM',
};

export const WORK_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Toàn thời gian',
  PART_TIME: 'Bán thời gian / cộng tác',
  CONTRACT: 'Hợp đồng',
  INTERNSHIP: 'Thực tập',
};
