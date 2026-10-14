import { STATUS_LABELS } from '@/lib/constants';

export default function StatusBadge({ status }: { status: string }) {
  return <span className={`status status-${status}`}>{STATUS_LABELS[status] ?? status}</span>;
}
