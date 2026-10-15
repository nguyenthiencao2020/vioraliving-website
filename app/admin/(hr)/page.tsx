import Link from 'next/link';
import { createSupabaseServer } from '@/lib/supabase/server';
import { HR_STATUSES, STATUS_LABELS, WORK_TYPE_LABELS } from '@/lib/constants';
import { PROGRAMS } from '@/lib/programs';
import StatusBadge from './StatusBadge';
import { formatDateTime } from './format';

const PAGE_SIZE = 50;

type Search = { trang_thai?: string; vi_tri?: string; ct?: string; q?: string; trang?: string };

function buildHref(base: Search, patch: Partial<Search>) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...base, ...patch })) if (v) params.set(k, v);
  const qs = params.toString();
  return qs ? `/admin?${qs}` : '/admin';
}

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.trang) || 1);
  const supabase = await createSupabaseServer();

  let query = supabase
    .from('applications')
    .select('id,created_at,job_title,program,work_type,full_name,phone,birthplace,education_level,status', { count: 'exact' })
    .neq('status', 'uploading')
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (sp.trang_thai && (HR_STATUSES as readonly string[]).includes(sp.trang_thai)) query = query.eq('status', sp.trang_thai);
  if (sp.vi_tri) query = query.eq('job_slug', sp.vi_tri);
  if (sp.ct && sp.ct in PROGRAMS) query = query.eq('program', sp.ct);
  // Bỏ ký tự đặc biệt của cú pháp filter PostgREST
  const q = sp.q?.replace(/[,()%*\\]/g, ' ').trim().slice(0, 60);
  if (q) query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q.replace(/\s/g, '')}%`);

  const [{ data: apps, count, error }, { data: stats }, { data: jobs }] = await Promise.all([
    query,
    supabase.from('v_application_stats').select('status,total'),
    supabase.from('jobs').select('slug,title,program').order('sort_order'),
  ]);

  const byStatus: Record<string, number> = {};
  for (const s of stats ?? []) byStatus[s.status] = (byStatus[s.status] ?? 0) + s.total;
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: '1.6rem', margin: 0 }}>Hồ sơ ứng tuyển</h1>
        <Link className="btn btn-outline btn-sm" href="/admin/qr">Mã QR cho poster</Link>
      </div>
      <div style={{ height: 16 }} />

      <div className="stats">
        {(['new', 'reviewing', 'interview', 'offered', 'hired'] as const).map(s => (
          <Link key={s} className="stat" href={buildHref({}, { trang_thai: s })}>
            <b>{byStatus[s] ?? 0}</b>
            <span className="muted">{STATUS_LABELS[s]}</span>
          </Link>
        ))}
      </div>

      <form className="filters" action="/admin">
        <input name="q" placeholder="Tìm tên hoặc số điện thoại" defaultValue={sp.q} />
        <select name="trang_thai" defaultValue={sp.trang_thai ?? ''}>
          <option value="">Tất cả trạng thái</option>
          {HR_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <select name="vi_tri" defaultValue={sp.vi_tri ?? ''}>
          <option value="">Tất cả vị trí</option>
          {jobs?.map(j => <option key={j.slug} value={j.slug}>{j.title}{j.program === 'tan-sinh-vien' ? ' (Tân sinh viên)' : ''}</option>)}
        </select>
        <select name="ct" defaultValue={sp.ct ?? ''}>
          <option value="">Tất cả chương trình</option>
          {Object.values(PROGRAMS).map(p => <option key={p.id} value={p.id}>{p.tab}</option>)}
        </select>
        <button className="btn btn-primary btn-sm">Lọc</button>
        {(sp.q || sp.trang_thai || sp.vi_tri || sp.ct) && <Link className="btn btn-outline btn-sm" href="/admin">Xóa lọc</Link>}
      </form>

      {error && <div className="alert alert-error">Không tải được dữ liệu: {error.message}</div>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ngày nộp</th><th>Họ tên</th><th>Điện thoại</th><th>Vị trí</th><th>Hình thức</th>
              <th>Nơi sinh</th><th>Trình độ</th><th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {apps?.length ? apps.map(a => (
              <tr key={a.id}>
                <td>{formatDateTime(a.created_at)}</td>
                <td><Link href={`/admin/ho-so/${a.id}`}>{a.full_name}</Link></td>
                <td><a href={`tel:${a.phone}`}>{a.phone}</a></td>
                <td>{a.job_title}{a.program === 'tan-sinh-vien' && <span className="tag-tsv">Tân SV</span>}</td>
                <td>{a.work_type ? WORK_TYPE_LABELS[a.work_type] : ''}</td>
                <td>{a.birthplace}</td>
                <td>{a.education_level ?? ''}</td>
                <td><StatusBadge status={a.status} /></td>
              </tr>
            )) : (
              <tr><td colSpan={8} className="muted">Không có hồ sơ nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pager">
          {page > 1 && <Link className="btn btn-outline btn-sm" href={buildHref(sp, { trang: String(page - 1) })}>← Trước</Link>}
          <span className="muted">Trang {page}/{totalPages} · {count} hồ sơ</span>
          {page < totalPages && <Link className="btn btn-outline btn-sm" href={buildHref(sp, { trang: String(page + 1) })}>Sau →</Link>}
        </div>
      )}
    </>
  );
}
