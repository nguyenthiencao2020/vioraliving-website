import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Vercel Cron gọi hằng ngày (vercel.json), tự gửi header Authorization: Bearer <CRON_SECRET>
export async function GET(req: Request) {
  if (!process.env.CRON_SECRET || req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // 1. Xoá file CV của các hồ sơ kẹt ở 'uploading' > 24h (cleanup_stale chỉ xoá dòng trong CSDL)
  const cutoff = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { data: stale, error } = await supabaseAdmin.from('applications')
    .select('cv_path').eq('status', 'uploading').lt('created_at', cutoff).not('cv_path', 'is', null).limit(1000);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const paths = stale.map(r => r.cv_path as string);
  let removedFiles = 0;
  for (let i = 0; i < paths.length; i += 100) {
    const { data } = await supabaseAdmin.storage.from('cv').remove(paths.slice(i, i + 100));
    removedFiles += data?.length ?? 0;
  }

  // 2. Xoá dòng hồ sơ 'uploading' cũ + rate_limits cũ
  const { data: result, error: e2 } = await supabaseAdmin.rpc('cleanup_stale');
  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });

  return NextResponse.json({ removedFiles, ...result });
}
