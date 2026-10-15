'use client';

import { useActionState } from 'react';
import { resendEmails, type ResendState } from './actions';

export default function ResendEmail({ id }: { id: string }) {
  const [state, action, pending] = useActionState<ResendState, FormData>(resendEmails, {});
  return (
    <form action={action} style={{ marginTop: 8 }}>
      <input type="hidden" name="id" value={id} />
      <button className="btn btn-ghost btn-sm" disabled={pending}>{pending ? 'Đang gửi…' : 'Gửi lại email'}</button>
      {state.ok && <div className="alert alert-success" style={{ marginTop: 8 }}>Đã gửi.</div>}
      {state.error && <div className="alert alert-error" style={{ marginTop: 8, wordBreak: 'break-word' }}>{state.error}</div>}
    </form>
  );
}
