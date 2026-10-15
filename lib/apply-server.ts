import 'server-only';
import { createHash } from 'crypto';
import { z } from 'zod';
import { supabaseAdmin } from './supabase/admin';
import { CONSENT_VERSION, CV_TYPES, EDUCATION_LEVELS, MAX_CV_BYTES } from './constants';
import { hasLink, NAME_RE, PLACE_RE, verifyTurnstile } from './antispam';

/** Lỗi có thể hiển thị thẳng cho ứng viên. */
export class ApplyError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export function hashIp(ip: string) {
  const salt = process.env.IP_HASH_SALT;
  if (!salt) throw new Error('Thiếu biến môi trường IP_HASH_SALT');
  return createHash('sha256').update(ip + salt).digest('hex');
}

export function clientIp(headers: Headers) {
  return headers.get('x-real-ip') || headers.get('x-forwarded-for')?.split(',')[0].trim() || '0.0.0.0';
}

export const slugifyVi = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
   .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 60) || 'ung-vien';

/** '+84 912.345.678' → '0912345678' */
export function normalizePhone(raw: string) {
  let p = raw.replace(/[\s.\-()]/g, '');
  if (p.startsWith('+84')) p = '0' + p.slice(3);
  else if (p.startsWith('84') && p.length === 11) p = '0' + p.slice(2);
  return p;
}

export async function allowRate(key: string, limit: number, windowSec: number) {
  const { data, error } = await supabaseAdmin.rpc('check_rate_limit', {
    p_key: key, p_limit: limit, p_window_seconds: windowSec,
  });
  if (error) { console.error('rate_limit', error); return true; } // lỗi thì không chặn ứng viên
  return data as boolean;
}

const optionalText = (max: number) =>
  z.preprocess(v => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().trim().max(max).optional());

const currentYear = new Date().getFullYear();

export const initSchema = z.object({
  jobSlug: z.string().min(1, 'Vui lòng chọn vị trí ứng tuyển.').max(80),
  fullName: z.string().trim().min(2, 'Vui lòng nhập họ tên.').max(120)
    .refine(v => NAME_RE.test(v), 'Họ tên chỉ gồm chữ cái, vui lòng kiểm tra lại.'),
  phone: z.string().max(20).transform(normalizePhone)
    .refine(p => /^0\d{9}$/.test(p), 'Số điện thoại phải có 10 số, ví dụ 0912345678.'),
  email: z.preprocess(v => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().trim().max(200).email('Email không hợp lệ.').optional()),
  birthplace: z.string().trim().min(2, 'Vui lòng nhập nơi sinh / nguyên quán.').max(200)
    .refine(v => PLACE_RE.test(v) && !hasLink(v), 'Nơi sinh / nguyên quán chưa hợp lệ.'),
  birthYear: z.preprocess(v => (v === '' || v == null ? undefined : Number(v)),
    z.number().int().min(1940).max(Math.min(2010, currentYear - 16), 'Năm sinh không hợp lệ.').optional()),
  educationLevel: z.preprocess(v => (v === '' ? undefined : v), z.enum(EDUCATION_LEVELS).optional()),
  school: optionalText(200),
  source: optionalText(100),
  message: z.string({ required_error: 'Vui lòng giới thiệu ngắn về kinh nghiệm và bản thân (tối thiểu 20 ký tự).' }).trim()
    .min(20, 'Vui lòng giới thiệu ngắn về kinh nghiệm và bản thân (tối thiểu 20 ký tự).').max(2000)
    .refine(v => !hasLink(v), 'Phần giới thiệu không được chứa đường link.'),
  consent: z.literal(true, { errorMap: () => ({ message: 'Vui lòng đồng ý với Chính sách bảo vệ dữ liệu cá nhân.' }) }),
  utm: z.record(z.string().max(40), z.string().max(200)).optional()
    .refine(u => !u || Object.keys(u).length <= 10),
  cv: z.object({
    name: z.string().min(1, 'Vui lòng đính kèm CV.').max(200),
    type: z.string().refine(t => t in CV_TYPES, 'Định dạng CV không hỗ trợ (PDF, DOC, DOCX, JPG, PNG).'),
    size: z.number().int().positive().max(MAX_CV_BYTES, 'CV vượt quá 5MB.'),
  }),
  workType: z.preprocess(v => (v === '' ? undefined : v), z.enum(['FULL_TIME', 'PART_TIME']).optional()),
  website: z.string().max(0).optional(), // honeypot – người thật để trống
  fillMs: z.number().optional(),          // thời gian điền form (bẫy thời gian)
  turnstileToken: z.string().max(4096).optional(),
});
export type InitInput = z.infer<typeof initSchema>;

/** Bước 1: tạo hồ sơ 'uploading' + signed upload URL cho CV */
export async function initApplication(input: InitInput, ip: string) {
  const ipHash = hashIp(ip);
  if (!(await allowRate(`apply:ip:${ipHash}`, 5, 600)) ||
      !(await allowRate(`apply:phone:${input.phone}`, 3, 86400))) {
    throw new ApplyError('Bạn đã gửi quá nhiều lần. Vui lòng thử lại sau.', 429);
  }

  if (!(await verifyTurnstile(input.turnstileToken, ip))) {
    throw new ApplyError('Xác minh chống spam chưa thành công. Vui lòng đợi vài giây rồi bấm Gửi lại.', 400);
  }

  // Chống nộp trùng: cùng số điện thoại + cùng vị trí trong 7 ngày
  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
  const { data: dup } = await supabaseAdmin.from('applications').select('id')
    .eq('phone', input.phone).eq('job_slug', input.jobSlug).neq('status', 'uploading').gte('created_at', since).limit(1);
  if (dup?.length) {
    throw new ApplyError('Bạn đã nộp hồ sơ cho vị trí này rồi. Phòng Nhân sự sẽ liên hệ với bạn sớm, không cần gửi lại.', 409);
  }

  const { data: job } = await supabaseAdmin
    .from('jobs').select('slug,title,program,work_types').eq('slug', input.jobSlug).eq('active', true).maybeSingle();
  if (!job) throw new ApplyError('Vị trí này không còn tuyển.');

  const workTypes = (job.work_types ?? ['FULL_TIME']) as string[];
  const workType = input.workType ?? (workTypes.length === 1 ? workTypes[0] : undefined);
  if (!workType || !workTypes.includes(workType)) throw new ApplyError('Vui lòng chọn hình thức làm việc (Full-time / Part-time).');

  const { data: app, error } = await supabaseAdmin.from('applications').insert({
    job_slug: job.slug, job_title: job.title, program: job.program,
    work_type: workType,
    full_name: input.fullName, phone: input.phone, email: input.email ?? null,
    birthplace: input.birthplace, birth_year: input.birthYear ?? null,
    education_level: input.educationLevel ?? null, school: input.school ?? null,
    source: input.source ?? null, message: input.message ?? null,
    cv_filename: input.cv.name, cv_mime: input.cv.type, cv_size: input.cv.size,
    consent_at: new Date().toISOString(), consent_version: CONSENT_VERSION,
    utm: input.utm ?? null, ip_hash: ipHash, status: 'uploading',
  }).select('id').single();
  if (error) throw error;

  const now = new Date();
  const path = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${job.slug}/` +
               `${app.id}_${slugifyVi(input.fullName)}.${CV_TYPES[input.cv.type].ext}`;

  const { data: signed, error: e2 } = await supabaseAdmin.storage.from('cv').createSignedUploadUrl(path);
  if (e2) throw e2;
  const { error: e3 } = await supabaseAdmin.from('applications').update({ cv_path: path }).eq('id', app.id);
  if (e3) throw e3;

  return { applicationId: app.id as string, path, token: signed.token };
}

// Chữ ký đầu file: kiểm tra file thật đúng loại đã khai báo, không chỉ dựa vào Content-Type
const MAGIC: Record<string, number[][]> = {
  pdf: [[0x25, 0x50, 0x44, 0x46]],                       // %PDF
  doc: [[0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]],
  docx: [[0x50, 0x4b, 0x03, 0x04]],                      // ZIP
  jpg: [[0xff, 0xd8, 0xff]],
  png: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
};

async function readFileHead(path: string, n = 8): Promise<Uint8Array | null> {
  const { data } = await supabaseAdmin.storage.from('cv').createSignedUrl(path, 60);
  if (!data?.signedUrl) return null;
  const res = await fetch(data.signedUrl, { headers: { Range: `bytes=0-${n - 1}` }, cache: 'no-store' });
  if (!res.ok || !res.body) return null;
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total < n) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.length;
  }
  await reader.cancel().catch(() => {});
  const head = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) { head.set(c, offset); offset += c.length; }
  return head.slice(0, n);
}

/** Bước 2: xác nhận file đã lên và đúng loại, chuyển hồ sơ sang 'new'. Gọi lại nhiều lần vẫn an toàn. */
export async function completeApplication(applicationId: string) {
  const { data: app } = await supabaseAdmin
    .from('applications').select('id,status,cv_path,cv_mime').eq('id', applicationId).maybeSingle();
  if (!app?.cv_path) throw new ApplyError('Không tìm thấy hồ sơ.', 404);
  if (app.status !== 'uploading') return { ok: true as const, transitioned: false }; // đã hoàn tất trước đó

  const head = await readFileHead(app.cv_path);
  if (!head || head.length === 0) throw new ApplyError('Chưa nhận được file CV, vui lòng thử lại.');

  const ext = CV_TYPES[app.cv_mime ?? '']?.ext;
  const valid = ext && MAGIC[ext].some(sig => sig.every((b, i) => head[i] === b));
  if (!valid) {
    await supabaseAdmin.storage.from('cv').remove([app.cv_path]);
    await supabaseAdmin.from('applications').delete().eq('id', app.id).eq('status', 'uploading');
    throw new ApplyError('File CV bị lỗi hoặc không đúng định dạng. Vui lòng chọn file khác và gửi lại.');
  }

  // Điều kiện status = 'uploading' để 2 request đồng thời không cùng chuyển trạng thái
  const { data: updated, error } = await supabaseAdmin.from('applications')
    .update({ status: 'new' }).eq('id', app.id).eq('status', 'uploading').select('id');
  if (error) throw error;
  return { ok: true as const, transitioned: (updated?.length ?? 0) > 0 };
}
