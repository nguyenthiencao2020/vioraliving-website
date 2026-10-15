import 'server-only';
import { supabaseAdmin } from './supabase/admin';
import { isMailConfigured, MAIL_FROM, sendMail } from './mail/ms365';
import { candidateConfirmation, hrNotification, type MailApp } from './mail/templates';

// Danh sách email HR nhận thông báo, cách nhau dấu phẩy. Để trống = không gửi cho HR.
const hrRecipients = () =>
  (process.env.HR_NOTIFY_TO ?? '').split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);

/** Tình trạng cấu hình email – chỉ trả tên biến còn thiếu, không bao giờ trả giá trị. */
export function mailConfigStatus() {
  const missing = ['MS365_TENANT_ID', 'MS365_CLIENT_ID', 'MS365_CLIENT_SECRET', 'MAIL_FROM', 'HR_NOTIFY_TO']
    .filter(k => !process.env[k]?.trim());
  // Chỉ tiết lộ độ dài + dạng chuỗi để nhận ra lỗi chép nhầm "Secret ID" (dạng GUID 36 ký tự)
  const raw = process.env.MS365_CLIENT_SECRET ?? '';
  const secret = raw.trim().replace(/^["']|["']$/g, '');
  const secretHint = !secret ? '' : /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(secret)
    ? `MS365_CLIENT_SECRET đang là dạng Secret ID (GUID ${secret.length} ký tự) – cần dán cột Value`
    : `MS365_CLIENT_SECRET: ${secret.length} ký tự, đúng dạng Value${raw !== secret ? ' (đã tự bỏ dấu cách/ngoặc thừa)' : ''}`;
  return { configured: isMailConfigured(), missing, secretHint };
}

/**
 * Gửi email xác nhận cho ứng viên + báo HR cho một hồ sơ đã nộp xong.
 * Mỗi email chỉ gửi 1 lần (đánh dấu candidate_notified_at / hr_notified_at). Lỗi được lưu vào notify_error
 * để cron gửi lại.
 */
export async function notifyApplication(applicationId: string) {
  if (!isMailConfigured()) return;

  const { data: app } = await supabaseAdmin
    .from('applications')
    .select('id,full_name,job_title,program,work_type,phone,email,birthplace,education_level,message,source,cv_filename,cv_size,created_at,status,hr_notified_at,candidate_notified_at')
    .eq('id', applicationId)
    .maybeSingle();
  if (!app || app.status === 'uploading') return;

  const errors: string[] = [];
  const replyTo = MAIL_FROM!;

  if (app.email && !app.candidate_notified_at) {
    try {
      const { subject, html } = candidateConfirmation(app as MailApp, replyTo);
      await sendMail({ to: [app.email], subject, html, replyTo });
      await supabaseAdmin.from('applications').update({ candidate_notified_at: new Date().toISOString() }).eq('id', app.id);
    } catch (e) {
      errors.push(`candidate: ${(e as Error).message}`);
    }
  }

  const hrAll = hrRecipients();
  const hr = hrAll.filter(e => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e));
  if (hrAll.length && !hr.length && !app.hr_notified_at) {
    errors.push(`hr: biến HR_NOTIFY_TO trên Vercel không phải địa chỉ email (đang là "${hrAll.join(', ').slice(0, 60)}"). Sửa thành vd hr@vioraliving.com.vn rồi Redeploy.`);
  }
  if (hr.length && !app.hr_notified_at) {
    try {
      const { subject, html } = hrNotification(app as MailApp);
      // Bấm Trả lời trong email báo HR → gửi thẳng cho ứng viên (nếu ứng viên có email)
      await sendMail({ to: hr, subject, html, replyTo: app.email ?? undefined });
      await supabaseAdmin.from('applications').update({ hr_notified_at: new Date().toISOString() }).eq('id', app.id);
    } catch (e) {
      errors.push(`hr: ${(e as Error).message}`);
    }
  }

  await supabaseAdmin.from('applications')
    .update({ notify_error: errors.length ? errors.join(' | ').slice(0, 1000) : null })
    .eq('id', app.id);
  if (errors.length) console.error('notifyApplication', app.id, errors);
}

/** Gửi lại các email bị lỗi trong 3 ngày gần đây (gọi từ cron). */
export async function retryFailedNotifications() {
  if (!isMailConfigured()) return 0;
  const since = new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString();
  const { data } = await supabaseAdmin
    .from('applications').select('id')
    .neq('status', 'uploading').not('notify_error', 'is', null).gte('created_at', since).limit(50);
  for (const row of data ?? []) await notifyApplication(row.id);
  return data?.length ?? 0;
}
