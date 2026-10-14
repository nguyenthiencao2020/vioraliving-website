import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Client quyền service_role: bỏ qua RLS. CHỈ dùng trong code server.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);
