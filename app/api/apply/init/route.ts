import { NextResponse } from 'next/server';
import { ApplyError, clientIp, initApplication, initSchema } from '@/lib/apply-server';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  // honeypot bị điền (bot) → giả vờ thành công, không lưu gì
  if (body?.website) return NextResponse.json({ spam: true });
  const parsed = initSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ.' }, { status: 400 });
  }
  try {
    return NextResponse.json(await initApplication(parsed.data, clientIp(req.headers)));
  } catch (e) {
    if (e instanceof ApplyError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error('apply/init', e);
    return NextResponse.json({ error: 'Hệ thống đang bận, vui lòng thử lại sau ít phút.' }, { status: 500 });
  }
}
