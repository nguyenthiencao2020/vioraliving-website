'use server';

import { headers } from 'next/headers';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createSupabaseServer } from '@/lib/supabase/server';
import { allowRate, clientIp, hashIp } from '@/lib/apply-server';
import { SITE_URL } from '@/lib/constants';

export type LoginState = { message?: string; error?: string };

const SENT = 'Nếu email này có quyền truy cập, link đăng nhập đã được gửi. Vui lòng kiểm tra hộp thư (cả mục Spam).';

export async function sendMagicLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = z.string().trim().toLowerCase().email().safeParse(formData.get('email'));
  if (!parsed.success) return { error: 'Email không hợp lệ.' };
  const email = parsed.data;

  const ip = clientIp(await headers());
  if (!(await allowRate(`login:ip:${hashIp(ip)}`, 5, 900))) {
    return { error: 'Bạn đã thử quá nhiều lần. Vui lòng đợi 15 phút.' };
  }

  // Chỉ gửi link cho email nằm trong hr_users. Trả về cùng một thông báo để không lộ email nào là HR.
  const { data: hr } = await supabaseAdmin.from('hr_users').select('email').ilike('email', email).maybeSingle();
  if (!hr) return { message: SENT };

  // Tạo sẵn tài khoản cho HR lần đầu đăng nhập, để có thể TẮT đăng ký công khai trên Supabase.
  // email_confirm = true là an toàn vì tài khoản không có mật khẩu: chỉ đăng nhập được bằng link gửi tới hộp thư này.
  const { error: createErr } = await supabaseAdmin.auth.admin.createUser({ email, email_confirm: true });
  if (createErr && createErr.code !== 'email_exists') console.error('createUser', createErr);

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: `${SITE_URL}/auth/confirm` },
  });
  if (error) {
    console.error('signInWithOtp', error);
    return { error: 'Không gửi được email đăng nhập. Vui lòng thử lại sau ít phút.' };
  }
  return { message: SENT };
}
