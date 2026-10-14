import { CONTACT } from '@/lib/constants';
import Icon from './Icon';
import ZaloLink from './ZaloLink';

// Nút Gọi + Zalo nổi ở góc phải màn hình (máy tính). Trên điện thoại nằm trong MobileApplyBar.
export default function ContactButtons() {
  return (
    <div className="contact-fab" aria-label="Liên hệ nhanh">
      <ZaloLink className="fab fab-zalo" title={`Nhắn Zalo ${CONTACT.phone}`}>
        <span className="fab-zalo-logo" aria-hidden>Zalo</span>
        <span className="fab-label">Nhắn Zalo</span>
      </ZaloLink>
      <a className="fab fab-call" href={`tel:${CONTACT.phoneTel}`} title={`Gọi ${CONTACT.phone}`}>
        <Icon name="phone" size={22} />
        <span className="fab-label">{CONTACT.phone}</span>
      </a>
    </div>
  );
}
