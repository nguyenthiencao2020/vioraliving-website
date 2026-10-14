'use client';

import { useEffect, useState } from 'react';
import Icon from './Icon';

const SHARE_TEXT = 'Viora Living Saigon đang tuyển Điều dưỡng & Caregiver – có đào tạo tại Nhật Bản. Ứng tuyển online tại đây:';

export default function ShareButtons({ url }: { url: string }) {
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => setCanNativeShare(typeof navigator.share === 'function'), []);

  const shareUrl = `${url}/?utm_source=share&utm_medium=referral`;

  async function nativeShare() {
    try { await navigator.share({ title: 'Viora Living Saigon tuyển dụng', text: SHARE_TEXT, url: shareUrl }); } catch {}
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(`${SHARE_TEXT} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div className="share">
      {canNativeShare && (
        <button type="button" className="share-btn share-native" onClick={nativeShare}>
          <Icon name="share" size={18} /> Chia sẻ qua Zalo, Messenger…
        </button>
      )}
      <a
        className="share-btn share-fb" target="_blank" rel="noopener noreferrer"
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
      >
        <Icon name="facebook" size={18} /> Facebook
      </a>
      <button type="button" className="share-btn share-copy" onClick={copy}>
        <Icon name={copied ? 'check' : 'link'} size={18} /> {copied ? 'Đã sao chép!' : 'Sao chép link'}
      </button>
    </div>
  );
}
