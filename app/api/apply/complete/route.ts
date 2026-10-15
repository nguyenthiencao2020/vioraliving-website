import { after, NextResponse } from 'next/server';
import { z } from 'zod';
import { allowRate, ApplyError, clientIp, completeApplication, hashIp } from '@/lib/apply-server';
import { notifyApplication } from '@/lib/notify';

const schema = z.object({ applicationId: z.string().uuid() });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Dữ liệu không hợp lệ.' }, { status: 400 });
  try {
    // Kiểm tra giới hạn và xử lý hồ sơ chạy song song (giảm thời gian chờ)
    const [allowed, result] = await Promise.all([
      allowRate(`complete:ip:${hashIp(clientIp(req.headers))}`, 20, 600),
      completeApplication(parsed.data.applicationId),
    ]);
    // Gửi email (MS365) sau khi đã trả kết quả cho ứng viên, không làm chậm form
    if (result.transitioned) after(() => notifyApplication(parsed.data.applicationId));
    if (!allowed) {
      return NextResponse.json({ error: 'Bạn đã gửi quá nhiều lần. Vui lòng thử lại sau.' }, { status: 429 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof ApplyError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error('apply/complete', e);
    return NextResponse.json({ error: 'Hệ thống đang bận, vui lòng thử lại sau ít phút.' }, { status: 500 });
  }
}
