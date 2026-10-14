'use client';

import { useActionState } from 'react';
import { sendMagicLink, type LoginState } from './actions';

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(sendMagicLink, {});
  return (
    <form action={action}>
      {state.error && <div className="alert alert-error" role="alert">{state.error}</div>}
      {state.message && <div className="alert alert-success" role="status">{state.message}</div>}
      <div className="field" style={{ marginBottom: 16 }}>
        <label htmlFor="email">Email công ty</label>
        <input id="email" name="email" type="email" required autoComplete="email" placeholder="ten@vioraliving.com.vn" />
      </div>
      <button className="btn btn-primary" disabled={pending} style={{ width: '100%' }}>
        {pending ? 'Đang gửi…' : 'Gửi link đăng nhập'}
      </button>
    </form>
  );
}
