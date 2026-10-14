import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import { SITE_URL } from '@/lib/constants';
import './globals.css';

const font = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Tuyển dụng Điều dưỡng & Caregiver | Viora Living Saigon',
    template: '%s | Viora Living Saigon',
  },
  description:
    'Viora Living Saigon – Cơ sở Lái Thiêu tuyển Điều dưỡng và Nhân viên chăm sóc người cao tuổi (Caregiver). Có đào tạo tại Nhật Bản. Nộp hồ sơ trực tuyến.',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'Viora Living Saigon',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={font.className}>{children}</body>
    </html>
  );
}
