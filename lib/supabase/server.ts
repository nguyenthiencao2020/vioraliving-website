import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Client theo phiên đăng nhập của người dùng (HR) – RLS được áp dụng.
export async function createSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Gọi từ Server Component: không ghi được cookie, proxy.ts sẽ làm mới phiên.
          }
        },
      },
    }
  );
}
