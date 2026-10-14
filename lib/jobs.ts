import { createSupabasePublic } from './supabase/public';

export type Job = {
  slug: string;
  title: string;
  quantity: number | null;
  employment_type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  audience: string | null;
  location: string;
  requirements: string[];
  responsibilities: string[];
  date_posted: string;
  valid_through: string | null;
};

/** Vị trí đang tuyển (RLS chỉ trả về active = true). Lỗi → mảng rỗng để trang vẫn hiển thị. */
export async function getActiveJobs(): Promise<Job[]> {
  const { data, error } = await createSupabasePublic()
    .from('jobs')
    .select('slug,title,quantity,employment_type,audience,location,requirements,responsibilities,date_posted,valid_through')
    .eq('active', true)
    .or(`valid_through.is.null,valid_through.gte.${new Date().toISOString().slice(0, 10)}`)
    .order('sort_order');
  if (error) {
    console.error('getActiveJobs', error);
    return [];
  }
  return data as Job[];
}
