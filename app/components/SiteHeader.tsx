import Image from 'next/image';
import Link from 'next/link';
import { CONTACT } from '@/lib/constants';
import Icon from './Icon';

// home = true: link cuộn trong trang chủ (#vi-tri); trang khác: link về trang chủ (/#vi-tri)
export default function SiteHeader({ home = false }: { home?: boolean }) {
  const h = (id: string) => (home ? `#${id}` : `/#${id}`);
  return (
    <header className="site-header">
      <div className="container">
        <Link href="/" className="brand" aria-label="Viora Living Saigon – Trang chủ tuyển dụng">
          <Image src="/brand/mark.png" alt="" width={209} height={192} className="brand-mark" priority />
          <Image src="/brand/wordmark.png" alt="Viora Living Saigon" width={605} height={120} className="brand-word" priority />
        </Link>
        <nav className="nav">
          <a className="nav-link" href={h('vi-tri')}>Vị trí</a>
          <a className="nav-link" href={h('chinh-sach')}>Quyền lợi</a>
          <a className="nav-link" href={h('quy-trinh')}>Quy trình</a>
          <a className="nav-link" href={h('hoi-dap')}>Hỏi đáp</a>
          <a className="nav-link nav-phone" href={`tel:${CONTACT.phoneTel}`}><Icon name="phone" size={16} /> {CONTACT.phone}</a>
          <a className="btn btn-primary btn-sm" href={h('ung-tuyen')}>Ứng tuyển</a>
        </nav>
      </div>
    </header>
  );
}
