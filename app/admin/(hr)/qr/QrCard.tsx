'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

// Tạo mã QR ngay trên trình duyệt; HR bấm tải về PNG để chèn vào poster / bài đăng
export default function QrCard({ title, subtitle, url, file }: { title: string; subtitle?: string; url: string; file: string }) {
  const [src, setSrc] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(url, { width: 1024, margin: 2, errorCorrectionLevel: 'M', color: { dark: '#0b5560', light: '#ffffff' } })
      .then(setSrc)
      .catch(() => setSrc(''));
  }, [url]);

  return (
    <div className="card qr-card">
      <div className="qr-img">{src ? <img src={src} alt={`Mã QR: ${title}`} /> : <span className="muted">Đang tạo…</span>}</div>
      <div className="qr-body">
        <b>{title}</b>
        {subtitle && <small className="muted">{subtitle}</small>}
        <code className="qr-url">{url}</code>
        <div className="qr-actions">
          <a className={`btn btn-primary btn-sm ${src ? '' : 'disabled'}`} href={src || undefined} download={`${file}.png`}>Tải PNG</a>
          <button
            type="button" className="btn btn-outline btn-sm"
            onClick={() => navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); })}
          >
            {copied ? 'Đã chép!' : 'Chép link'}
          </button>
        </div>
      </div>
    </div>
  );
}
