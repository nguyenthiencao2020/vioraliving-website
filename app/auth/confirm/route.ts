import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createSupabaseServer } from '@/lib/supabase/server';

// Đích của link đăng nhập trong email.
// - token_hash: khi đã sửa email template (khuyên dùng, mở được trên thiết bị khác)
// - code: template mặc định (PKCE) – phải mở link trên cùng trình duyệt đã yêu cầu
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const code = searchParams.get('code');
  const supabase = await createSupabaseServer();

  let ok = false;
  if (tokenHash && type) {
    ok = !(await supabase.auth.verifyOtp({ type, token_hash: tokenHash })).error;
  } else if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  }

  const dest = request.nextUrl.clone();
  dest.search = '';
  dest.pathname = ok ? '/admin' : '/admin/login';
  if (!ok) dest.searchParams.set('loi', 'link');
  return NextResponse.redirect(dest);
}
