import type { Metadata } from 'next';
import LoginForm from './LoginForm';

export const metadata: Metadata = { title: 'Đăng nhập quản trị', robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ loi?: string }> }) {
  const { loi } = await searchParams;
  return (
    <main className="container">
      <div className="card login-box">
        <h1 style={{ fontSize: '1.5rem' }}>Quản lý hồ sơ ứng tuyển</h1>
        <p className="muted">Nhập email công ty. Hệ thống sẽ gửi link đăng nhập vào hộp thư của bạn.</p>
        <p className="muted" style={{ fontSize: '0.9rem' }}>💡 Mở email và bấm link <b>trên chính máy và trình duyệt này</b>.</p>
        {loi === 'link' && (
          <div className="alert alert-error">Không đăng nhập được bằng link này. Link chỉ dùng 1 lần, hết hạn sau 1 giờ và <b>phải mở trên cùng máy, cùng trình duyệt</b> đã bấm “Gửi link đăng nhập”. Vui lòng gửi lại link mới.</div>
        )}
        <LoginForm />
      </div>
    </main>
  );
}
