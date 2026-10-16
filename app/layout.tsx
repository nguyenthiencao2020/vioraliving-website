import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro, Playfair_Display } from 'next/font/google';
import { SITE_URL } from '@/lib/constants';
import './globals.css';

const font = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-sans',
});

// Chữ có chân cho tiêu đề, gần với chữ trong logo Viora
const serif = Playfair_Display({
  subsets: ['vietnamese', 'latin'],
  weight: ['600', '700'],
  display: 'swap',
  variable: '--font-serif',
});

export const viewport: Viewport = { themeColor: '#127884' };

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Tuyển dụng Điều dưỡng, Nhân viên chăm sóc, KTV Vật lý trị liệu, PHCN | Viora Living Saigon',
    template: '%s | Viora Living Saigon',
  },
  description:
    'Viora Living Saigon – Cơ sở Lái Thiêu tuyển Điều dưỡng, Nhân viên chăm sóc người cao tuổi, Kỹ thuật viên Vật lý trị liệu, Phục hồi chức năng. Full-time / Part-time, được đào tạo tại Nhật Bản. Nộp hồ sơ trực tuyến.',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'Viora Living Saigon',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${font.className} ${font.variable} ${serif.variable}`}>{children}</body>
    </html>
  );
}
