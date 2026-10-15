import { CONTACT } from '@/lib/constants';
import Icon from './Icon';

// Nút Gọi nổi ở góc phải màn hình (máy tính). Trên điện thoại nằm trong MobileApplyBar.
export default function ContactButtons() {
  return (
    <div className="contact-fab" aria-label="Liên hệ nhanh">
      <a className="fab fab-call" href={`tel:${CONTACT.phoneTel}`} title={`Gọi ${CONTACT.phone}`}>
        <Icon name="phone" size={22} />
        <span className="fab-label">{CONTACT.phone}</span>
      </a>
    </div>
  );
}
