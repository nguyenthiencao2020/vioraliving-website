import Image from 'next/image';
import Link from 'next/link';
import { CONTACT } from '@/lib/constants';
import Icon from './Icon';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="brand brand-light">
            <Image src="/brand/mark.png" alt="" width={209} height={192} className="brand-mark" />
            <Image src="/brand/wordmark-white.png" alt="Viora Living Saigon" width={605} height={120} className="brand-word" />
          </div>
          <p className="tagline">{CONTACT.tagline}</p>
          <div className="footer-sub"><Icon name="pin" size={16} /> {CONTACT.place}<br />{CONTACT.address}</div>
        </div>
        <div className="footer-links">
          <a href={`tel:${CONTACT.phoneTel}`}><Icon name="phone" size={16} /> {CONTACT.phone}</a>
          <a href={`mailto:${CONTACT.email}`}><Icon name="mail" size={16} /> {CONTACT.email}</a>
          <Link href="/chinh-sach-bao-mat"><Icon name="shield" size={16} /> Chính sách bảo vệ dữ liệu cá nhân</Link>
        </div>
      </div>
    </footer>
  );
}
