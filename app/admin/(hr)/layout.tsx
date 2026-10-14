import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase/server';
import { signOut } from '../actions';

export const metadata: Metadata = { title: 'Quản lý hồ sơ', robots: { index: false } };

export default async function HrLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');
  const { data: isHr } = await supabase.rpc('is_hr');

  return (
    <div className="admin">
      <div className="admin-bar">
        <div className="container">
          <Link href="/admin" className="logo">Viora <span>HR</span></Link>
          <form action={signOut} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span className="muted" style={{ fontSize: '0.9rem' }}>{user.email}</span>
            <button className="btn btn-outline btn-sm">Đăng xuất</button>
          </form>
        </div>
      </div>
      <main>
        <div className="container">
          {isHr ? children : (
            <div className="card">
              <h2>Không có quyền truy cập</h2>
              <p className="muted">Tài khoản {user.email} chưa được cấp quyền xem hồ sơ. Vui lòng liên hệ quản trị viên.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
