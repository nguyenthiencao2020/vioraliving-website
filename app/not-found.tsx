import Link from 'next/link';
import type { Metadata } from 'next';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import Icon from './components/Icon';
import { CONTACT } from '@/lib/constants';

export const metadata: Metadata = { title: 'Không tìm thấy trang', robots: { index: false } };

// Trang 404 mang giao diện Viora (thay cho trang đen mặc định)
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="nf">
        <div className="container nf-box">
          <span className="nf-code" aria-hidden>404</span>
          <h1>Vị trí này hiện không còn tuyển</h1>
          <p className="muted">
            Đường dẫn bạn mở có thể đã cũ hoặc vị trí đã tuyển đủ. Viora vẫn đang tuyển nhiều vị trí khác – mời bạn xem và ứng tuyển.
          </p>
          <div className="nf-actions">
            <Link href="/#vi-tri" className="btn btn-primary btn-lg">Xem vị trí đang tuyển <Icon name="arrow" size={18} /></Link>
            <a href={`tel:${CONTACT.phoneTel}`} className="btn btn-ghost btn-lg"><Icon name="phone" size={18} /> {CONTACT.phone}</a>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
