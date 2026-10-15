import { Fragment } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase/server';
import { STATUS_LABELS, WORK_TYPE_LABELS } from '@/lib/constants';
import { PROGRAMS, type ProgramId } from '@/lib/programs';
import StatusBadge from '../../StatusBadge';
import { formatDateTime, formatSize } from '../../format';
import UpdateForm from './UpdateForm';

export default async function ApplicationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createSupabaseServer();

  const [{ data: app }, { data: events }] = await Promise.all([
    supabase.from('applications').select('*').eq('id', id).maybeSingle(),
    supabase.from('application_events').select('*').eq('application_id', id).order('created_at', { ascending: false }),
  ]);
  if (!app) notFound();

  // Link xem CV có hạn 10 phút, tạo mới mỗi lần mở trang
  const cv = app.cv_path
    ? (await supabase.storage.from('cv').createSignedUrl(app.cv_path, 600, { download: app.cv_filename ?? true })).data
    : null;

  const rows: [string, React.ReactNode][] = [
    ['Vị trí', app.job_title],
    ['Chương trình', app.program ? PROGRAMS[app.program as ProgramId]?.tab ?? app.program : '—'],
    ['Hình thức', app.work_type ? WORK_TYPE_LABELS[app.work_type] : '—'],
    ['Điện thoại', <a key="p" href={`tel:${app.phone}`}>{app.phone}</a>],
    ['Email', app.email ? <a key="e" href={`mailto:${app.email}`}>{app.email}</a> : '—'],
    ['Nơi sinh / Nguyên quán', app.birthplace],
    ['Trình độ', app.education_level ?? '—'],
    ['Biết tin qua', app.source ?? '—'],
    ['Kinh nghiệm & giới thiệu', app.message ? <span key="m" style={{ whiteSpace: 'pre-wrap' }}>{app.message}</span> : '—'],
    ['Ngày nộp', formatDateTime(app.created_at)],
    ['Đồng ý chính sách', `${formatDateTime(app.consent_at)} (${app.consent_version})`],
    ['HR phụ trách', app.hr_owner ?? '—'],
  ];
  if (app.utm) rows.push(['UTM', Object.entries(app.utm).map(([k, v]) => `${k}=${v}`).join(', ')]);

  return (
    <>
      <p><Link href="/admin">← Danh sách hồ sơ</Link></p>
      <h1 style={{ fontSize: '1.6rem' }}>{app.full_name} <StatusBadge status={app.status} /></h1>

      <div className="detail">
        <div className="card">
          <dl className="info">
            {rows.map(([k, v]) => (<Fragment key={k}><dt>{k}</dt><dd>{v}</dd></Fragment>))}
          </dl>
          <div style={{ marginTop: 20 }}>
            {cv?.signedUrl ? (
              <a className="btn btn-primary" href={cv.signedUrl}>
                Tải CV ({app.cv_filename}, {formatSize(app.cv_size)})
              </a>
            ) : <span className="muted">Không có file CV.</span>}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 20 }}>
          <UpdateForm id={app.id} status={app.status} note={app.hr_note ?? ''} />
          <div className="card">
            <h3>Lịch sử</h3>
            <ul className="timeline">
              {events?.map(ev => (
                <li key={ev.id}>
                  <div>{STATUS_LABELS[ev.from_status] ?? ev.from_status} → <b>{STATUS_LABELS[ev.to_status] ?? ev.to_status}</b></div>
                  <div className="muted">{formatDateTime(ev.created_at)} · {ev.actor}</div>
                </li>
              ))}
              {!events?.length && <li className="muted">Chưa có thay đổi.</li>}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
