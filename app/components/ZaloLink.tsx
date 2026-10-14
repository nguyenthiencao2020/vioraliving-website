'use client';

import { useEffect, useState, type ReactNode } from 'react';
import QRCode from 'qrcode';
import { CONTACT } from '@/lib/constants';

// Điện thoại: mở thẳng app Zalo (link zalo.me). Máy tính: Zalo chưa hỗ trợ mở app từ web,
// nên hiện mã QR để quét bằng Zalo trên điện thoại (vào ngay khung chat), kèm nút mở Zalo PC/web.
export default function ZaloLink({ className, children, title }: { className?: string; children: ReactNode; title?: string }) {
  const [open, setOpen] = useState(false);
  const [qr, setQr] = useState('');

  useEffect(() => {
    if (!open) return;
    if (!qr) QRCode.toDataURL(CONTACT.zalo, { width: 480, margin: 1, color: { dark: '#0b5560', light: '#ffffff' } }).then(setQr).catch(() => {});
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, qr]);

  function onClick(e: React.MouseEvent) {
    const isPhone = window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 720;
    if (isPhone) return; // để trình duyệt mở link → app Zalo
    e.preventDefault();
    setOpen(true);
  }

  return (
    <>
      <a className={className} href={CONTACT.zalo} target="_blank" rel="noopener noreferrer" title={title} onClick={onClick}>
        {children}
      </a>
      {open && (
        <div className="zalo-modal" role="dialog" aria-modal="true" aria-labelledby="zalo-title" onClick={() => setOpen(false)}>
          <div className="zalo-box" onClick={e => e.stopPropagation()}>
            <button type="button" className="zalo-close" aria-label="Đóng" onClick={() => setOpen(false)}>×</button>
            <div className="zalo-badge">Zalo</div>
            <h3 id="zalo-title">Nhắn Zalo cho Viora</h3>
            <p className="muted">Mở <b>Zalo trên điện thoại</b> → bấm biểu tượng quét mã → quét mã dưới đây để chat ngay.</p>
            <div className="zalo-qr">{qr ? <img src={qr} alt={`Mã QR Zalo ${CONTACT.phone}`} /> : <span className="muted">Đang tạo mã…</span>}</div>
            <p className="zalo-phone">{CONTACT.phone}</p>
            <a className="btn btn-zalo" href={CONTACT.zalo} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
              Mở Zalo trên máy tính
            </a>
          </div>
        </div>
      )}
    </>
  );
}
