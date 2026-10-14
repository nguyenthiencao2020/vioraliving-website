// lib/apply-server.ts – mẫu code server (Next.js App Router) dùng CSDL Supabase ở trên.
// Dùng trong app/api/apply/init/route.ts và app/api/apply/complete/route.ts
import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // chỉ dùng phía server
  { auth: { persistSession: false } }
);

const ALLOWED: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};
export const MAX_CV_BYTES = 5 * 1024 * 1024;

export const hashIp = (ip: string) =>
  createHash('sha256').update(ip + process.env.IP_HASH_SALT).digest('hex');

export const slugifyVi = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
   .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 60);

export async function allowRate(key: string, limit: number, windowSec: number) {
  const { data, error } = await supabaseAdmin.rpc('check_rate_limit', {
    p_key: key, p_limit: limit, p_window_seconds: windowSec,
  });
  if (error) { console.error('rate_limit', error); return true; } // lỗi thì không chặn ứng viên
  return data as boolean;
}

/** Bước 1: tạo hồ sơ 'uploading' + signed upload URL cho CV */
export async function initApplication(input: {
  jobSlug: string; fullName: string; phone: string; email?: string; birthplace: string;
  birthYear?: number; educationLevel?: string; school?: string; source?: string; message?: string;
  consentVersion: string; utm?: Record<string, string>; ip: string;
  cvMime: string; cvSize: number; cvFilename: string;
}) {
  const ext = ALLOWED[input.cvMime];
  if (!ext) throw new Error('Định dạng CV không hỗ trợ (PDF, DOC, DOCX, JPG, PNG).');
  if (input.cvSize > MAX_CV_BYTES) throw new Error('CV vượt quá 5MB.');

  const { data: job } = await supabaseAdmin
    .from('jobs').select('slug,title').eq('slug', input.jobSlug).eq('active', true).single();
  if (!job) throw new Error('Vị trí không còn tuyển.');

  const { data: app, error } = await supabaseAdmin.from('applications').insert({
    job_slug: job.slug, job_title: job.title,
    full_name: input.fullName.trim(), phone: input.phone, email: input.email || null,
    birthplace: input.birthplace.trim(), birth_year: input.birthYear ?? null,
    education_level: input.educationLevel ?? null, school: input.school ?? null,
    source: input.source ?? null, message: input.message ?? null,
    cv_filename: input.cvFilename, cv_mime: input.cvMime, cv_size: input.cvSize,
    consent_at: new Date().toISOString(), consent_version: input.consentVersion,
    utm: input.utm ?? null, ip_hash: hashIp(input.ip), status: 'uploading',
  }).select('id').single();
  if (error) throw error;

  const now = new Date();
  const path = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${job.slug}/` +
               `${app.id}_${slugifyVi(input.fullName)}.${ext}`;

  const { data: signed, error: e2 } = await supabaseAdmin.storage.from('cv').createSignedUploadUrl(path);
  if (e2) throw e2;
  await supabaseAdmin.from('applications').update({ cv_path: path }).eq('id', app.id);

  return { applicationId: app.id as string, path, token: signed.token };
  // Client: supabase.storage.from('cv').uploadToSignedUrl(path, token, file)
  // (client tạo bằng NEXT_PUBLIC_SUPABASE_URL + anon key; không cần quyền gì thêm)
}

/** Bước 2: xác nhận file đã lên, chuyển 'new', trả về dữ liệu để gửi email */
export async function completeApplication(applicationId: string) {
  const { data: app } = await supabaseAdmin
    .from('applications').select('*').eq('id', applicationId).eq('status', 'uploading').single();
  if (!app?.cv_path) throw new Error('Không tìm thấy hồ sơ.');

  const { data: file, error } = await supabaseAdmin.storage.from('cv').download(app.cv_path);
  if (error || !file) throw new Error('Chưa nhận được file CV, vui lòng thử lại.');

  await supabaseAdmin.from('applications').update({ status: 'new' }).eq('id', applicationId);
  const { data: link } = await supabaseAdmin.storage.from('cv')
    .createSignedUrl(app.cv_path, 60 * 60 * 24 * 7); // link xem CV 7 ngày cho email HR

  return { app, cvBuffer: Buffer.from(await file.arrayBuffer()), cvLink: link?.signedUrl };
  // Sau đó: gửi email HR (đính kèm cvBuffer) → update hr_notified_at
  //         gửi email ứng viên (nếu có email) → update candidate_notified_at
}
