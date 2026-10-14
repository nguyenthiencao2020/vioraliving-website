import { createClient } from '@supabase/supabase-js';

// Client công khai (anon key), không lưu phiên. Dùng để đọc jobs và upload CV bằng signed URL.
export const createSupabasePublic = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
