'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import { HR_STATUSES } from '@/lib/constants';

export type UpdateState = { ok?: boolean; error?: string };

const schema = z.object({
  id: z.string().uuid(),
  status: z.enum(HR_STATUSES),
  hr_note: z.string().max(5000),
});

export async function updateApplication(_prev: UpdateState, formData: FormData): Promise<UpdateState> {
  const parsed = schema.safeParse({
    id: formData.get('id'),
    status: formData.get('status'),
    hr_note: formData.get('hr_note') ?? '',
  });
  if (!parsed.success) return { error: 'Dữ liệu không hợp lệ.' };
  const { id, status, hr_note } = parsed.data;

  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Phiên đăng nhập đã hết hạn.' };

  // RLS chỉ cho HR cập nhật; người khác sẽ nhận 0 dòng
  const { data, error } = await supabase
    .from('applications')
    .update({ status, hr_note: hr_note.trim() || null, hr_owner: user.email })
    .eq('id', id)
    .select('id');
  if (error) return { error: error.message };
  if (!data?.length) return { error: 'Không có quyền cập nhật hồ sơ này.' };

  revalidatePath(`/admin/ho-so/${id}`);
  revalidatePath('/admin');
  return { ok: true };
}
