'use client';

import { useActionState } from 'react';
import { HR_STATUSES, STATUS_LABELS } from '@/lib/constants';
import { updateApplication, type UpdateState } from './actions';

export default function UpdateForm({ id, status, note }: { id: string; status: string; note: string }) {
  const [state, action, pending] = useActionState<UpdateState, FormData>(updateApplication, {});
  return (
    <form action={action} className="card">
      <h3>Xử lý hồ sơ</h3>
      {state.error && <div className="alert alert-error">{state.error}</div>}
      {state.ok && <div className="alert alert-success">Đã lưu.</div>}
      <input type="hidden" name="id" value={id} />
      <div className="field" style={{ marginBottom: 12 }}>
        <label htmlFor="status">Trạng thái</label>
        <select id="status" name="status" defaultValue={status}>
          {HR_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>
      <div className="field" style={{ marginBottom: 12 }}>
        <label htmlFor="hr_note">Ghi chú nội bộ</label>
        <textarea id="hr_note" name="hr_note" defaultValue={note} maxLength={5000} />
      </div>
      <button className="btn btn-primary" disabled={pending}>{pending ? 'Đang lưu…' : 'Lưu'}</button>
    </form>
  );
}
