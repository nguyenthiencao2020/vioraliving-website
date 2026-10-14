'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createSupabasePublic } from '@/lib/supabase/public';
import { CV_TYPES, EDUCATION_LEVELS, MAX_CV_BYTES, SOURCES, WORK_TYPE_LABELS } from '@/lib/constants';
import { PROGRAMS, type ProgramId } from '@/lib/programs';
import { SELECT_JOB_EVENT } from './JobApplyButton';
import Icon from './components/Icon';
import { SELECT_PROGRAM_EVENT } from './components/ProgramTabs';

export type FormJob = { slug: string; title: string; program: ProgramId; quantity: number | null; work_types: string[] };

type Phase = 'idle' | 'sending' | 'uploading' | 'finishing' | 'done';

const EXT_TO_MIME: Record<string, string> = Object.fromEntries(
  Object.entries(CV_TYPES).map(([mime, { ext }]) => [ext, mime])
);
EXT_TO_MIME.jpeg = 'image/jpeg';

// Một số trình duyệt (nhất là trên điện thoại) không điền file.type → đoán theo đuôi file
function cvMime(file: File) {
  if (file.type in CV_TYPES) return file.type;
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  return EXT_TO_MIME[ext] ?? file.type;
}

function readUtm() {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
    const v = params.get(k);
    if (v) utm[k] = v.slice(0, 200);
  }
  return Object.keys(utm).length ? utm : undefined;
}

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Hệ thống đang bận, vui lòng thử lại sau ít phút.');
  return data;
}

const PHASE_LABEL: Record<Phase, string> = {
  idle: 'Gửi hồ sơ',
  sending: 'Đang gửi thông tin…',
  uploading: 'Đang tải CV lên…',
  finishing: 'Đang hoàn tất…',
  done: 'Đã gửi',
};

export default function ApplyForm({ jobs }: { jobs: FormJob[] }) {
  const [jobSlug, setJobSlugState] = useState(jobs.length === 1 ? jobs[0].slug : '');
  const [workType, setWorkType] = useState('');
  const job = jobs.find(j => j.slug === jobSlug);
  const programs = (['nhat-ban', 'thuong'] as const).filter(p => jobs.some(j => j.program === p));

  function setJobSlug(slug: string) {
    setJobSlugState(slug);
    const j = jobs.find(x => x.slug === slug);
    // Vị trí chỉ có 1 hình thức → chọn sẵn
    setWorkType(j && j.work_types.length === 1 ? j.work_types[0] : '');
  }
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    // Link từ mã QR trên poster: ?vi-tri=<slug>
    const fromUrl = new URLSearchParams(window.location.search).get('vi-tri');
    if (fromUrl && jobs.some(j => j.slug === fromUrl)) setJobSlug(fromUrl);
    const onSelect = (e: Event) => setJobSlug((e as CustomEvent<string>).detail);
    window.addEventListener(SELECT_JOB_EVENT, onSelect);
    return () => window.removeEventListener(SELECT_JOB_EVENT, onSelect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);
    const file = fd.get('cv');
    if (!jobSlug) return setError('Vui lòng chọn vị trí ứng tuyển.');
    if (!workType) return setError('Vui lòng chọn hình thức làm việc (Full-time / Part-time).');
    if (!(file instanceof File) || file.size === 0) return setError('Vui lòng đính kèm CV.');
    const mime = cvMime(file);
    if (!(mime in CV_TYPES)) return setError('CV chỉ nhận file PDF, DOC, DOCX, JPG hoặc PNG.');
    if (file.size > MAX_CV_BYTES) return setError('CV vượt quá 5MB. Vui lòng chọn file nhỏ hơn.');

    const text = (k: string) => String(fd.get(k) ?? '');
    try {
      setPhase('sending');
      const init = await postJson('/api/apply/init', {
        jobSlug,
        workType,
        needHousing: fd.get('needHousing') === 'on',
        fullName: text('fullName'),
        phone: text('phone'),
        email: text('email'),
        birthplace: text('birthplace'),
        birthYear: text('birthYear'),
        educationLevel: text('educationLevel'),
        school: text('school'),
        source: text('source'),
        message: text('message'),
        consent: fd.get('consent') === 'on',
        website: text('website'),
        utm: readUtm(),
        cv: { name: file.name, type: mime, size: file.size },
      });
      if (init.spam) return setPhase('done');

      setPhase('uploading');
      const { error: upErr } = await createSupabasePublic()
        .storage.from('cv')
        .uploadToSignedUrl(init.path, init.token, file, { contentType: mime });
      if (upErr) throw new Error('Tải CV thất bại. Vui lòng kiểm tra mạng và thử lại.');

      setPhase('finishing');
      await postJson('/api/apply/complete', { applicationId: init.applicationId });
      setPhase('done');
    } catch (err) {
      setPhase('idle');
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  }

  if (phase === 'done') {
    return (
      <div className="card form-card success-box" role="status">
        <div className="icon-badge"><Icon name="checkCircle" size={36} /></div>
        <h3>Viora đã nhận hồ sơ của bạn!</h3>
        <p className="muted">Phòng Nhân sự sẽ liên hệ qua số điện thoại bạn đã cung cấp. Cảm ơn bạn đã quan tâm.</p>
        <button className="btn btn-outline" onClick={() => { setFileName(''); setPhase('idle'); }}>Gửi thêm hồ sơ khác</button>
      </div>
    );
  }

  const busy = phase !== 'idle';

  return (
    <form className="card form-card" onSubmit={onSubmit}>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      <fieldset disabled={busy} style={{ border: 0, padding: 0, margin: 0 }}>
        <div className="form-grid">
          <div className="field full">
            <span className="field-label">1. Chọn vị trí ứng tuyển <span className="req">*</span></span>
            {programs.map(p => (
              <div key={p} className="job-pick-group">
                <div className={`job-pick-head ${p}`}>{p === 'nhat-ban' && <i className="jp-dot" aria-hidden />}{PROGRAMS[p].tab}</div>
                <div className="job-pick" role="radiogroup" aria-label={PROGRAMS[p].tab}>
                  {jobs.filter(j => j.program === p).map(j => (
                    <label key={j.slug} className={`pick ${jobSlug === j.slug ? 'on' : ''} ${p}`}>
                      <input
                        type="radio" name="jobSlug" value={j.slug} checked={jobSlug === j.slug} required
                        onChange={() => {
                          setJobSlug(j.slug);
                          window.dispatchEvent(new CustomEvent(SELECT_PROGRAM_EVENT, { detail: p }));
                        }}
                      />
                      <span className="pick-check" aria-hidden><Icon name="check" size={14} /></span>
                      <span className="pick-title">{j.title}</span>
                      <span className="pick-meta">
                        {j.quantity ? `${String(j.quantity).padStart(2, '0')} vị trí` : 'Đang tuyển'}
                        {' · '}{j.work_types.map(w => WORK_TYPE_LABELS[w]).join(' / ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {job && job.work_types.length > 1 && (
            <div className="field full">
              <span className="field-label">Hình thức làm việc <span className="req">*</span></span>
              <div className="seg" role="radiogroup" aria-label="Hình thức làm việc">
                {job.work_types.map(w => (
                  <label key={w} className={`seg-opt ${workType === w ? 'on' : ''}`}>
                    <input type="radio" name="workType" value={w} checked={workType === w} onChange={() => setWorkType(w)} />
                    {WORK_TYPE_LABELS[w]}
                    <small>{w === 'FULL_TIME' ? 'Thu nhập cạnh tranh' : 'Thu nhập theo giờ'}</small>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="field full"><span className="field-label">2. Thông tin của bạn</span></div>
          <div className="field">
            <label htmlFor="fullName">Họ và tên <span className="req">*</span></label>
            <input id="fullName" name="fullName" required minLength={2} maxLength={120} autoComplete="name" />
          </div>
          <div className="field">
            <label htmlFor="phone">Số điện thoại <span className="req">*</span></label>
            <input id="phone" name="phone" type="tel" required inputMode="tel" autoComplete="tel"
              maxLength={20} placeholder="0912 345 678" />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" maxLength={200} autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="birthYear">Năm sinh</label>
            <input id="birthYear" name="birthYear" type="number" min={1940} max={2010} inputMode="numeric" />
          </div>
          <div className="field full">
            <label htmlFor="birthplace">Nơi sinh / Nguyên quán <span className="req">*</span></label>
            <input id="birthplace" name="birthplace" required minLength={2} maxLength={200} placeholder="VD: Bình Dương" />
          </div>
          <div className="field">
            <label htmlFor="educationLevel">Trình độ học vấn</label>
            <select id="educationLevel" name="educationLevel" defaultValue="">
              <option value="">— Chọn —</option>
              {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="school">Trường tốt nghiệp</label>
            <input id="school" name="school" maxLength={200} />
          </div>
          <div className="field full">
            <label htmlFor="source">Bạn biết tin tuyển dụng qua đâu?</label>
            <select id="source" name="source" defaultValue="">
              <option value="">— Chọn —</option>
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="field full">
            <label htmlFor="message">Lời nhắn cho Viora</label>
            <textarea id="message" name="message" maxLength={2000} />
          </div>
          <div className="field full">
            <label className="checkbox housing">
              <input type="checkbox" name="needHousing" />
              <span><b>Tôi cần chỗ lưu trú tại cơ sở</b><br /><small className="muted">Viora có chỗ ở cho nhân sự có nhu cầu – ưu tiên ứng viên ở tỉnh.</small></span>
            </label>
          </div>

          <div className="field full">
            <label htmlFor="cv">3. CV / Hồ sơ <span className="req">*</span></label>
            <div className={`file-drop ${fileName ? 'has-file' : ''}`}>
              <span className="fd-icon"><Icon name={fileName ? 'checkCircle' : 'upload'} size={24} /></span>
              {fileName
                ? <><b>{fileName}</b><span className="muted">Bấm để chọn file khác</span></>
                : <><b>Bấm để chọn file CV</b><span className="muted">hoặc chụp ảnh hồ sơ bằng điện thoại</span></>}
              <input id="cv" name="cv" type="file" required
                onChange={e => setFileName(e.target.files?.[0]?.name ?? '')}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png" />
            </div>
            <div className="hint">PDF, DOC, DOCX, JPG hoặc PNG, tối đa 5MB. CV nên ghi rõ <b>nơi sinh / nguyên quán</b>.</div>
          </div>

          <div className="hp" aria-hidden>
            <label htmlFor="website">Website</label>
            <input id="website" name="website" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="field full">
            <label className="checkbox">
              <input type="checkbox" name="consent" required />
              <span>
                Tôi đồng ý để Viora Living Saigon xử lý dữ liệu cá nhân của tôi cho mục đích tuyển dụng theo{' '}
                <Link href="/chinh-sach-bao-mat" target="_blank">Chính sách bảo vệ dữ liệu cá nhân</Link>.{' '}
                <span className="req">*</span>
              </span>
            </label>
          </div>

          <div className="full submit-row">
            <button type="submit" className="btn btn-primary btn-lg" disabled={busy}>
              {PHASE_LABEL[phase]} {!busy && <Icon name="arrow" size={18} />}
            </button>
          </div>
        </div>
      </fieldset>
    </form>
  );
}
