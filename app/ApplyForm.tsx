'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createSupabasePublic } from '@/lib/supabase/public';
import { CV_TYPES, EDUCATION_LEVELS, MAX_CV_BYTES, SOURCES } from '@/lib/constants';
import { SELECT_JOB_EVENT } from './JobApplyButton';
import Icon from './components/Icon';

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

export default function ApplyForm({ jobs }: { jobs: { slug: string; title: string }[] }) {
  const [jobSlug, setJobSlug] = useState(jobs.length === 1 ? jobs[0].slug : '');
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    const onSelect = (e: Event) => setJobSlug((e as CustomEvent<string>).detail);
    window.addEventListener(SELECT_JOB_EVENT, onSelect);
    return () => window.removeEventListener(SELECT_JOB_EVENT, onSelect);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);
    const file = fd.get('cv');
    if (!(file instanceof File) || file.size === 0) return setError('Vui lòng đính kèm CV.');
    const mime = cvMime(file);
    if (!(mime in CV_TYPES)) return setError('CV chỉ nhận file PDF, DOC, DOCX, JPG hoặc PNG.');
    if (file.size > MAX_CV_BYTES) return setError('CV vượt quá 5MB. Vui lòng chọn file nhỏ hơn.');

    const text = (k: string) => String(fd.get(k) ?? '');
    try {
      setPhase('sending');
      const init = await postJson('/api/apply/init', {
        jobSlug,
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
            <label htmlFor="jobSlug">Vị trí ứng tuyển <span className="req">*</span></label>
            <select id="jobSlug" name="jobSlug" required value={jobSlug} onChange={e => setJobSlug(e.target.value)}>
              <option value="" disabled>— Chọn vị trí —</option>
              {jobs.map(j => <option key={j.slug} value={j.slug}>{j.title}</option>)}
            </select>
          </div>

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
            <label htmlFor="cv">CV / Hồ sơ <span className="req">*</span></label>
            <div className={`file-drop ${fileName ? 'has-file' : ''}`}>
              <span className="fd-icon"><Icon name={fileName ? 'checkCircle' : 'upload'} size={24} /></span>
              {fileName
                ? <><b>{fileName}</b><span className="muted">Bấm để chọn file khác</span></>
                : <><b>Bấm để chọn file CV</b><span className="muted">hoặc chụp ảnh hồ sơ bằng điện thoại</span></>}
              <input id="cv" name="cv" type="file" required
                onChange={e => setFileName(e.target.files?.[0]?.name ?? '')}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png" />
            </div>
            <div className="hint">PDF, DOC, DOCX, JPG hoặc PNG, tối đa 5MB.</div>
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
