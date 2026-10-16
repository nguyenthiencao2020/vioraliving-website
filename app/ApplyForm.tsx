'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { CV_TYPES, EDUCATION_LEVELS, MAX_CV_BYTES, SOURCES, WORK_TYPE_LABELS } from '@/lib/constants';
import { PROGRAMS, resolveSlug, type ProgramId } from '@/lib/programs';
import { SELECT_JOB_EVENT } from './JobApplyButton';
import Icon from './components/Icon';
import { SELECT_PROGRAM_EVENT } from './components/ProgramTabs';

export type FormJob = { slug: string; title: string; program: ProgramId; quantity: number | null; work_types: string[] };

type Phase = 'idle' | 'sending' | 'uploading' | 'finishing' | 'done';

// Cloudflare Turnstile (tùy chọn) – chỉ bật khi có NEXT_PUBLIC_TURNSTILE_SITE_KEY
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
};
declare global { interface Window { turnstile?: TurnstileApi } }

const NAME_RE = /^[\p{L}\s.'-]+$/u;
const LINK_RE = /(https?:\/\/|www\.|\b[a-z0-9-]{2,}\.(com|net|org|info|xyz|top|ru|cn|io|link|click|site|online|shop|vn)\b)/i;

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

// Ảnh CV chụp bằng điện thoại thường 3–5 MB → nén còn ~0,5–1 MB (chữ vẫn rõ) để tải nhanh hơn.
// Lỗi gì cũng trả lại file gốc. PDF / Word giữ nguyên.
async function shrinkImage(file: File, mime: string): Promise<{ file: File; mime: string }> {
  if (!/^image\/(jpeg|png)$/.test(mime) || file.size < 1.2 * 1024 * 1024 || typeof createImageBitmap !== 'function') return { file, mime };
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 2200 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale); canvas.height = Math.round(bmp.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return { file, mime };
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); // PNG trong suốt → nền trắng
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/jpeg', 0.85));
    if (!blob || blob.size >= file.size) return { file, mime };
    return { file: new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' }), mime: 'image/jpeg' };
  } catch {
    return { file, mime };
  }
}

// Tải CV lên link ký sẵn của Supabase, báo % (fetch không báo được tiến trình nên dùng XHR)
function uploadWithProgress(path: string, token: string, file: File, onProgress: (pct: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const url = `${base}/storage/v1/object/upload/sign/cv/${path.split('/').map(encodeURIComponent).join('/')}?token=${encodeURIComponent(token)}`;
    const body = new FormData();
    body.append('cacheControl', '3600');
    body.append('', file);
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('apikey', key);
    xhr.setRequestHeader('Authorization', `Bearer ${key}`);
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.timeout = 120_000;
    xhr.upload.onprogress = e => { if (e.lengthComputable) onProgress(Math.min(99, Math.round((e.loaded / e.total) * 100))); };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? (onProgress(100), resolve()) : reject(new Error('upload ' + xhr.status)));
    xhr.onerror = xhr.ontimeout = () => reject(new Error('network'));
    xhr.send(body);
  });
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
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(45_000),
    });
  } catch {
    throw new Error('Kết nối chậm hoặc bị gián đoạn. Vui lòng bấm Gửi hồ sơ lại.');
  }
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
  const programs = (['thuong', 'tan-sinh-vien'] as const).filter(p => jobs.some(j => j.program === p));

  function setJobSlug(slug: string) {
    setJobSlugState(slug);
    const j = jobs.find(x => x.slug === slug);
    // Vị trí chỉ có 1 hình thức → chọn sẵn
    setWorkType(j && j.work_types.length === 1 ? j.work_types[0] : '');
  }
  const [phase, setPhase] = useState<Phase>('idle');
  const [pct, setPct] = useState(0);
  const [doneName, setDoneName] = useState('');
  const [doneEmail, setDoneEmail] = useState(false);
  const [popup, setPopup] = useState(false);
  const [error, setError] = useState('');
  // Lỗi gắn với 1 ô cụ thể: hiện ngay dưới ô đó và cuộn tới
  const [fieldErr, setFieldErr] = useState<{ field: string; msg: string } | null>(null);
  const [fileName, setFileName] = useState('');
  const [msgLen, setMsgLen] = useState(0);
  const mountedAt = useRef(0);
  const progressRef = useRef<HTMLDivElement>(null);
  const tsBox = useRef<HTMLDivElement>(null);
  const tsWidget = useRef<string | undefined>(undefined);
  const [tsToken, setTsToken] = useState('');

  useEffect(() => { mountedAt.current = performance.now(); }, []);

  // Tải và hiển thị Turnstile (chế độ chỉ hiện khi cần tương tác – đa số người dùng không thấy gì)
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || phase === 'done') return;
    const render = () => {
      if (!window.turnstile || !tsBox.current || tsWidget.current) return;
      tsWidget.current = window.turnstile.render(tsBox.current, {
        sitekey: TURNSTILE_SITE_KEY,
        appearance: 'interaction-only',
        language: 'vi',
        callback: (t: string) => setTsToken(t),
        'expired-callback': () => setTsToken(''),
        'error-callback': () => setTsToken(''),
      });
    };
    if (window.turnstile) render();
    else if (!document.getElementById('cf-turnstile')) {
      const sc = document.createElement('script');
      sc.id = 'cf-turnstile';
      sc.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      sc.async = true;
      sc.onload = render;
      document.head.appendChild(sc);
    } else {
      document.getElementById('cf-turnstile')!.addEventListener('load', render);
    }
    return () => { tsWidget.current = undefined; };
  }, [phase === 'done']); // eslint-disable-line react-hooks/exhaustive-deps

  const resetTurnstile = () => {
    if (TURNSTILE_SITE_KEY && window.turnstile && tsWidget.current) { window.turnstile.reset(tsWidget.current); setTsToken(''); }
  };

  useEffect(() => {
    // Link từ mã QR trên poster: ?vi-tri=<slug>
    const fromUrl = resolveSlug(new URLSearchParams(window.location.search).get('vi-tri') ?? '', jobs.map(j => j.slug));
    if (fromUrl) setJobSlug(fromUrl);
    const onSelect = (e: Event) => setJobSlug((e as CustomEvent<string>).detail);
    window.addEventListener(SELECT_JOB_EVENT, onSelect);
    return () => window.removeEventListener(SELECT_JOB_EVENT, onSelect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setFieldErr(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const file = fd.get('cv');
    const val = (k: string) => String(fd.get(k) ?? '').trim();
    const fail = (field: string, msg: string) => {
      setFieldErr({ field, msg });
      const el = form.querySelector<HTMLElement>(`[data-field="${field}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.querySelector<HTMLElement>('input:not([type=radio]), select, textarea')?.focus({ preventScroll: true });
    };
    if (!jobSlug) return fail('jobSlug', 'Vui lòng chọn vị trí ứng tuyển.');
    if (!workType) return fail('workType', 'Vui lòng chọn hình thức làm việc (Full-time / Part-time).');
    if (val('fullName').length < 2) return fail('fullName', 'Vui lòng nhập họ và tên.');
    if (!NAME_RE.test(val('fullName'))) return fail('fullName', 'Họ tên chỉ gồm chữ cái, vui lòng kiểm tra lại.');
    if (!/^(\+?84|0)\d{9}$/.test(val('phone').replace(/[\s.\-()]/g, ''))) return fail('phone', 'Số điện thoại chưa đúng, ví dụ 0912 345 678.');
    if (val('email') && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val('email'))) return fail('email', 'Email chưa đúng định dạng.');
    if (val('birthplace').length < 2) return fail('birthplace', 'Vui lòng nhập nơi sinh / nguyên quán.');
    if (val('message').length < 20) return fail('message', 'Vui lòng giới thiệu ngắn về kinh nghiệm và bản thân (tối thiểu 20 ký tự).');
    if (LINK_RE.test(val('message'))) return fail('message', 'Phần giới thiệu không được chứa đường link.');
    if (!(file instanceof File) || file.size === 0) return fail('cv', 'Vui lòng đính kèm CV.');
    const mime0 = cvMime(file);
    if (!(mime0 in CV_TYPES)) return fail('cv', 'CV chỉ nhận file PDF, DOC, DOCX, JPG hoặc PNG.');
    if (file.size > MAX_CV_BYTES) return fail('cv', 'CV vượt quá 5MB. Vui lòng chọn file nhỏ hơn.');

    if (fd.get('consent') !== 'on') return fail('consent', 'Vui lòng đánh dấu đồng ý với Chính sách bảo vệ dữ liệu cá nhân.');

    if (TURNSTILE_SITE_KEY && !tsToken) return fail('turnstile', 'Đang xác minh chống spam, vui lòng đợi vài giây rồi bấm Gửi lại.');
    const text = (k: string) => String(fd.get(k) ?? '');
    setDoneName(val('fullName').replace(/\s+/g, ' '));
    setDoneEmail(!!val('email'));
    try {
      setPhase('sending'); setPct(0);
      progressRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const { file: cvFile, mime } = await shrinkImage(file, mime0);
      const init = await postJson('/api/apply/init', {
        jobSlug,
        workType,
        fullName: text('fullName'),
        phone: text('phone'),
        email: text('email'),
        birthplace: text('birthplace'),
        educationLevel: text('educationLevel'),
        source: text('source'),
        message: text('message'),
        consent: fd.get('consent') === 'on',
        website: text('website'),
        utm: readUtm(),
        cv: { name: cvFile.name, type: mime, size: cvFile.size },
        fillMs: Math.round(performance.now() - mountedAt.current),
        turnstileToken: tsToken || undefined,
      });
      if (init.spam) return setPhase('done');

      setPhase('uploading');
      await uploadWithProgress(init.path, init.token, cvFile, setPct)
        .catch(() => { throw new Error('Chưa tải được file CV lên. Vui lòng kiểm tra mạng (có thể thử bằng 4G) rồi bấm Gửi hồ sơ lại.'); });

      setPhase('finishing');
      // Thử lại 1 lần nếu mạng chập chờn (bước này gọi lại nhiều lần vẫn an toàn)
      await postJson('/api/apply/complete', { applicationId: init.applicationId })
        .catch(() => postJson('/api/apply/complete', { applicationId: init.applicationId }));
      setPhase('done');
      setPopup(true);
    } catch (err) {
      resetTurnstile(); // mã xác minh chỉ dùng được 1 lần
      setPhase('idle');
      const msg = err instanceof Error ? err.message : '';
      // Lỗi mạng thô của trình duyệt (tiếng Anh) → câu tiếng Việt dễ hiểu
      setError(!msg || /failed to fetch|network|load failed/i.test(msg) ? 'Kết nối bị gián đoạn. Vui lòng kiểm tra mạng rồi bấm Gửi hồ sơ lại.' : msg);
    }
  }

  // Đóng popup → đưa người dùng về đúng khung cảm ơn trong form
  const closePopup = () => { setPopup(false); requestAnimationFrame(() => document.getElementById('ung-tuyen')?.scrollIntoView({ behavior: 'smooth', block: 'start' })); };
  const resetForm = () => { setPopup(false); setFileName(''); setMsgLen(0); setPhase('idle'); requestAnimationFrame(() => document.getElementById('ung-tuyen')?.scrollIntoView({ behavior: 'smooth', block: 'start' })); };

  if (phase === 'done') {
    return (
      <>
        <div className="card form-card success-box" role="status">
          <div className="icon-badge"><Icon name="checkCircle" size={36} /></div>
          <h3>{doneName ? `Cảm ơn ${doneName}!` : 'Viora đã nhận hồ sơ của bạn!'}</h3>
          <p className="muted">Viora Living Saigon đã nhận hồ sơ của bạn. Phòng Nhân sự sẽ liên hệ qua số điện thoại bạn đã cung cấp.</p>
          <button className="btn btn-outline" onClick={resetForm}>Gửi thêm hồ sơ khác</button>
        </div>
        {popup && <SuccessPopup name={doneName} hasEmail={doneEmail} onClose={closePopup} onAgain={resetForm} />}
      </>
    );
  }

  const busy = phase !== 'idle';

  const f = (field: string, base = 'field') => ({
    'data-field': field,
    className: `${base}${fieldErr?.field === field ? ' has-error' : ''}`,
  });
  const err = (field: string) =>
    fieldErr?.field === field ? <div className="field-error" role="alert">{fieldErr.msg}</div> : null;

  return (
    <form className="card form-card" onSubmit={onSubmit} onChange={() => fieldErr && setFieldErr(null)} noValidate>
      <fieldset disabled={busy} style={{ border: 0, padding: 0, margin: 0 }}>
        <div className="form-grid">
          <div {...f('jobSlug', 'field full')}>
            <span className="field-label">1. Chọn vị trí ứng tuyển <span className="req">*</span></span>
            {programs.map(p => (
              <div key={p} className="job-pick-group">
                {programs.length > 1 && <div className={`job-pick-head ${p}`}>{PROGRAMS[p].tab}</div>}
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
                      <span className="pick-meta">{j.work_types.map(w => WORK_TYPE_LABELS[w]).join(' / ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            {err('jobSlug')}
          </div>

          {job && job.work_types.length > 1 && (
            <div {...f('workType', 'field full')}>
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
              {err('workType')}
            </div>
          )}

          <div className="field full"><span className="field-label">2. Thông tin của bạn</span></div>
          <div {...f('fullName')}>
            <label htmlFor="fullName">Họ và tên <span className="req">*</span></label>
            <input id="fullName" name="fullName" required minLength={2} maxLength={120} autoComplete="name" />
            {err('fullName')}
          </div>
          <div {...f('phone')}>
            <label htmlFor="phone">Số điện thoại <span className="req">*</span></label>
            <input id="phone" name="phone" type="tel" required inputMode="tel" autoComplete="tel"
              maxLength={20} placeholder="0912 345 678" />
            {err('phone')}
          </div>
          <div {...f('email')}>
            <label htmlFor="email">Email <span className="opt">để nhận xác nhận</span></label>
            <input id="email" name="email" type="email" maxLength={200} autoComplete="email" placeholder="ten@gmail.com" />
            {err('email')}
          </div>
          <div {...f('birthplace')}>
            <label htmlFor="birthplace">Nơi sinh / Nguyên quán <span className="req">*</span></label>
            <input id="birthplace" name="birthplace" required minLength={2} maxLength={200} placeholder="VD: Bình Dương" />
            {err('birthplace')}
          </div>
          <div className="field">
            <label htmlFor="educationLevel">Trình độ học vấn</label>
            <select id="educationLevel" name="educationLevel" defaultValue="">
              <option value="">— Chọn —</option>
              {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="source">Bạn biết tin tuyển dụng qua đâu?</label>
            <select id="source" name="source" defaultValue="">
              <option value="">— Chọn —</option>
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div {...f('message', 'field full')}>
            <label htmlFor="message" className="field-label">3. Kinh nghiệm & giới thiệu bản thân <span className="req">*</span></label>
            <textarea
              id="message" name="message" required minLength={20} maxLength={2000} rows={5}
              placeholder={'Vài dòng giới thiệu để HR hiểu bạn hơn, ví dụ:\n• Kinh nghiệm chăm sóc người cao tuổi / người bệnh (nếu có)\n• Vì sao bạn muốn làm việc tại Viora\n• Thời gian có thể bắt đầu đi làm'}
              onChange={e => setMsgLen(e.target.value.length)}
            />
            <div className="hint counter-row"><span>Tối thiểu 20 ký tự</span><span>{msgLen}/2000</span></div>
            {err('message')}
          </div>

          <div {...f('cv', 'field full')}>
            <label htmlFor="cv" className="field-label">4. CV / Hồ sơ <span className="req">*</span></label>
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
            {err('cv')}
          </div>


          <div className="hp" aria-hidden>
            <label htmlFor="website">Website</label>
            <input id="website" name="website" tabIndex={-1} autoComplete="off" />
          </div>

          <div {...f('consent', 'field full')}>
            <label className="checkbox">
              <input type="checkbox" name="consent" required />
              <span>
                Tôi đồng ý để Viora Living Saigon xử lý dữ liệu cá nhân của tôi cho mục đích tuyển dụng theo{' '}
                <Link href="/chinh-sach-bao-mat" target="_blank">Chính sách bảo vệ dữ liệu cá nhân</Link>.{' '}
                <span className="req">*</span>
              </span>
            </label>
            {err('consent')}
          </div>
          {TURNSTILE_SITE_KEY && (
            <div {...f('turnstile', 'full')}>
              <div ref={tsBox} className="turnstile-box" />
              {err('turnstile')}
            </div>
          )}

          {error && <div className="full alert alert-error" role="alert">{error}</div>}

          {busy && (
            <div className="full submit-progress" ref={progressRef} role="status" aria-live="polite">
              <ol>
                {([
                  ['sending', 'Gửi thông tin'],
                  ['uploading', phase === 'uploading' ? `Tải CV lên · ${pct}%` : 'Tải CV lên'],
                  ['finishing', 'Hoàn tất hồ sơ'],
                ] as const).map(([k, label], i) => {
                  const order = ['sending', 'uploading', 'finishing'];
                  const cur = order.indexOf(phase);
                  const st = i < cur ? 'done' : i === cur ? 'active' : 'todo';
                  return (
                    <li key={k} className={st}>
                      <span className="sp-dot">{st === 'done' ? <Icon name="check" size={14} /> : i + 1}</span>
                      {label}
                    </li>
                  );
                })}
              </ol>
              <div className="sp-bar"><span style={{ width: `${phase === 'sending' ? 12 : phase === 'uploading' ? 15 + pct * 0.7 : 92}%` }} /></div>
              <p>Vui lòng giữ trang này mở – thường chỉ mất vài giây.</p>
            </div>
          )}

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


/** Popup chúc mừng giữa màn hình khi nộp xong (không cần kéo trang lên mới thấy). */
function SuccessPopup({ name, hasEmail, onClose, onAgain }: { name: string; hasEmail: boolean; onClose: () => void; onAgain: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  return createPortal(
    <div className="sp-overlay" onClick={onClose}>
      <div className="sp-modal" role="dialog" aria-modal="true" aria-labelledby="sp-title" onClick={e => e.stopPropagation()}>
        <div className="sp-burst" aria-hidden>{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ ['--a' as string]: `${i * 30}deg` }} />)}</div>
        <svg className="sp-check" viewBox="0 0 52 52" aria-hidden>
          <circle cx="26" cy="26" r="24" />
          <path d="M15 27l7 7 15-16" />
        </svg>
        <div className="eyebrow">Nộp hồ sơ thành công</div>
        <h3 id="sp-title">{name ? `Cảm ơn ${name}!` : 'Cảm ơn bạn!'}</h3>
        <p>Viora Living Saigon đã nhận hồ sơ của bạn. Phòng Nhân sự sẽ liên hệ qua <b>số điện thoại</b> bạn đã cung cấp trong thời gian sớm nhất.</p>
        {hasEmail && <p className="sp-note"><Icon name="mail" size={16} /> Email xác nhận sẽ được gửi tới hộp thư của bạn trong ít phút (xem cả mục Spam).</p>}
        <div className="sp-actions">
          <button ref={closeRef} type="button" className="btn btn-primary" onClick={onClose}>Đóng</button>
          <button type="button" className="btn btn-ghost" onClick={onAgain}>Gửi thêm hồ sơ khác</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
