import Link from 'next/link';
import { createSupabaseServer } from '@/lib/supabase/server';
import { SITE_URL } from '@/lib/constants';
import { PROGRAMS, type ProgramId } from '@/lib/programs';
import QrCard from './QrCard';

const utm = (campaign: string) => `utm_source=poster&utm_medium=qr&utm_campaign=${campaign}`;

export default async function QrPage() {
  const supabase = await createSupabaseServer();
  const { data: jobs } = await supabase
    .from('jobs').select('slug,title,program,quantity').eq('active', true).order('sort_order');

  return (
    <>
      <p><Link href="/admin">← Danh sách hồ sơ</Link></p>
      <h1 style={{ fontSize: '1.6rem' }}>Mã QR cho poster tuyển dụng</h1>
      <p className="muted" style={{ maxWidth: 760 }}>
        Tải mã QR và chèn vào poster in, bài đăng Facebook/Zalo. Ứng viên quét mã sẽ mở đúng chương trình,
        form tự chọn sẵn vị trí. Số hồ sơ đến từ QR được ghi nhận (UTM) trong từng hồ sơ.
        {SITE_URL.includes('localhost') && <b> ⚠️ Biến NEXT_PUBLIC_SITE_URL chưa đặt đúng tên miền – mã QR sẽ sai.</b>}
      </p>

      <h2 className="qr-h">Theo chương trình (dùng cho cả poster)</h2>
      <div className="qr-grid">
        {(Object.keys(PROGRAMS) as ProgramId[]).map(id => (
          <QrCard
            key={id} title={PROGRAMS[id].tab} subtitle="Mở trang, chuyển sẵn tới tab chương trình" file={`qr-${id}`}
            url={`${SITE_URL}/?ct=${id}&${utm(id)}#vi-tri`}
          />
        ))}
      </div>

      <h2 className="qr-h">Theo từng vị trí (mở thẳng form, chọn sẵn vị trí)</h2>
      <div className="qr-grid">
        {jobs?.map(j => (
          <QrCard
            key={j.slug}
            title={j.title}
            subtitle={`${PROGRAMS[j.program as ProgramId]?.tab ?? ''}${j.quantity ? ` · ${j.quantity} vị trí` : ''}`}
            file={`qr-${j.slug}`}
            url={`${SITE_URL}/?vi-tri=${j.slug}&${utm(j.program)}#ung-tuyen`}
          />
        ))}
      </div>
    </>
  );
}
