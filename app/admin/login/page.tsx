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
        {loi === 'link' && (
          <div className="alert alert-error">Link đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu link mới.</div>
        )}
        <LoginForm />
      </div>
    </main>
  );
}
