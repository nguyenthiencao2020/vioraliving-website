import Link from 'next/link';
import { createSupabaseServer } from '@/lib/supabase/server';
import { HR_STATUSES, STATUS_LABELS } from '@/lib/constants';
import StatusBadge from './StatusBadge';
import { formatDateTime } from './format';

const PAGE_SIZE = 50;

type Search = { trang_thai?: string; vi_tri?: string; q?: string; trang?: string };

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
    .select('id,created_at,job_title,full_name,phone,birth_year,education_level,status', { count: 'exact' })
    .neq('status', 'uploading')
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (sp.trang_thai && (HR_STATUSES as readonly string[]).includes(sp.trang_thai)) query = query.eq('status', sp.trang_thai);
  if (sp.vi_tri) query = query.eq('job_slug', sp.vi_tri);
  // Bỏ ký tự đặc biệt của cú pháp filter PostgREST
  const q = sp.q?.replace(/[,()%*\\]/g, ' ').trim().slice(0, 60);
  if (q) query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q.replace(/\s/g, '')}%`);

  const [{ data: apps, count, error }, { data: stats }, { data: jobs }] = await Promise.all([
    query,
    supabase.from('v_application_stats').select('status,total'),
    supabase.from('jobs').select('slug,title').order('sort_order'),
  ]);

  const byStatus: Record<string, number> = {};
  for (const s of stats ?? []) byStatus[s.status] = (byStatus[s.status] ?? 0) + s.total;
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <>
      <h1 style={{ fontSize: '1.6rem' }}>Hồ sơ ứng tuyển</h1>

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
          {jobs?.map(j => <option key={j.slug} value={j.slug}>{j.title}</option>)}
        </select>
        <button className="btn btn-primary btn-sm">Lọc</button>
        {(sp.q || sp.trang_thai || sp.vi_tri) && <Link className="btn btn-outline btn-sm" href="/admin">Xóa lọc</Link>}
      </form>

      {error && <div className="alert alert-error">Không tải được dữ liệu: {error.message}</div>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ngày nộp</th><th>Họ tên</th><th>Điện thoại</th><th>Vị trí</th>
              <th>Năm sinh</th><th>Trình độ</th><th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {apps?.length ? apps.map(a => (
              <tr key={a.id}>
                <td>{formatDateTime(a.created_at)}</td>
                <td><Link href={`/admin/ho-so/${a.id}`}>{a.full_name}</Link></td>
                <td><a href={`tel:${a.phone}`}>{a.phone}</a></td>
                <td>{a.job_title}</td>
                <td>{a.birth_year ?? ''}</td>
                <td>{a.education_level ?? ''}</td>
                <td><StatusBadge status={a.status} /></td>
              </tr>
            )) : (
              <tr><td colSpan={7} className="muted">Không có hồ sơ nào.</td></tr>
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
