import { SITE_URL } from '../constants';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const BRAND = '#127884';

function layout(title: string, inner: string) {
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>${esc(title)}</title></head>
<body style="margin:0;background:#f6f3ee;font-family:Arial,Helvetica,sans-serif;color:#1f2a2c">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f3ee;padding:24px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="padding:28px 32px 8px;text-align:center">
<img src="${SITE_URL}/brand/mark.png" width="52" alt="" style="display:inline-block">
<div style="margin-top:8px"><img src="${SITE_URL}/brand/wordmark.png" width="170" alt="Viora Living Saigon" style="display:inline-block"></div>
</td></tr>
<tr><td style="padding:16px 32px 32px;font-size:15px;line-height:1.6">${inner}</td></tr>
<tr><td style="background:${BRAND};color:#e2f2f2;padding:18px 32px;font-size:13px;text-align:center">
Viora Living Saigon – Cơ sở Lái Thiêu<br><i>Where Aging Becomes Living</i>
</td></tr>
</table></td></tr></table></body></html>`;
}

export type MailApp = {
  id: string; full_name: string; job_title: string; phone: string; email: string | null;
  birth_year: number | null; birthplace: string; education_level: string | null; created_at: string;
  program?: string | null; work_type?: string | null; need_housing?: boolean | null;
};

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso));

/** Email cảm ơn gửi ứng viên – thiết kế bảng (table) để hiển thị đúng trên Gmail, Outlook, điện thoại. */
export function candidateConfirmation(app: MailApp, hrEmail: string) {
  const subject = `🎉 Viora đã nhận hồ sơ của bạn – ${app.job_title}`;
  const firstName = app.full_name.trim().split(/\s+/).pop() ?? app.full_name;
  const step = (n: number, title: string, text: string, last = false) => `
<tr>
  <td width="44" valign="top" style="padding:0">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="34" height="34" align="center" valign="middle"
      style="width:34px;height:34px;border-radius:17px;background:${n === 1 ? '#1e9e6a' : BRAND};color:#ffffff;font-weight:bold;font-size:15px;font-family:Arial,sans-serif">${n === 1 ? '&#10003;' : n}</td></tr></table>
    ${last ? '' : `<div style="width:2px;height:30px;background:#cfe6e6;margin:4px 0 4px 16px"></div>`}
  </td>
  <td valign="top" style="padding:6px 0 ${last ? 0 : 14}px 6px">
    <div style="font-weight:bold;font-size:15px;color:#0b5560">${title}</div>
    <div style="font-size:14px;color:#5d6a6c;line-height:1.5">${text}</div>
  </td>
</tr>`;

  const html = `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#eef5f4;font-family:Arial,Helvetica,sans-serif;color:#1f2a2c">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">Cảm ơn ${esc(firstName)}! Hồ sơ ${esc(app.job_title)} của bạn đã được gửi thành công. Phòng Nhân sự sẽ liên hệ sớm.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef5f4;padding:24px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">

  <!-- logo -->
  <tr><td align="center" style="padding:4px 0 18px">
    <img src="${SITE_URL}/brand/mark.png" width="40" alt="" style="display:inline-block;vertical-align:middle">
    <img src="${SITE_URL}/brand/wordmark.png" width="150" alt="Viora Living Saigon" style="display:inline-block;vertical-align:middle;margin-left:8px">
  </td></tr>

  <!-- card -->
  <tr><td style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(11,85,96,0.12)">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="font-size:0;line-height:0"><img src="${SITE_URL}/brand/email-banner.jpg" width="560" alt="Viora Living Saigon"
        style="display:block;width:100%;max-width:560px;height:auto;border-radius:20px 20px 0 0"></td></tr>
      <tr><td style="height:6px;background:linear-gradient(90deg,#0b5560,#2ca4ac,#d9a02a);background-color:#2ca4ac;font-size:0;line-height:0">&nbsp;</td></tr>

      <tr><td align="center" style="padding:30px 32px 6px">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="64" height="64" align="center" valign="middle"
          style="width:64px;height:64px;border-radius:32px;background:#e6f4ec;color:#1e9e6a;font-size:32px;font-weight:bold">&#10003;</td></tr></table>
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.25;color:#0b5560;font-weight:bold;margin-top:16px">Cảm ơn ${esc(firstName)}!</div>
        <div style="font-size:16px;color:#5d6a6c;margin-top:8px;line-height:1.5">Hồ sơ của bạn đã được gửi thành công tới<br><b style="color:#127884">Viora Living Saigon</b>.</div>
      </td></tr>

      <!-- summary -->
      <tr><td style="padding:22px 32px 4px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3faf9;border:1px solid #d6ecea;border-radius:14px">
          <tr>
            <td style="padding:14px 18px;border-right:1px solid #d6ecea" width="60%">
              <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#9a6b12;font-weight:bold">Vị trí ứng tuyển</div>
              <div style="font-size:16px;font-weight:bold;color:#0b5560;margin-top:4px">${esc(app.job_title)}</div>
              ${app.program === 'nhat-ban' ? '<div style="font-size:13px;color:#a3122a;margin-top:2px">&#9679; Chương trình Đào tạo tại Nhật Bản</div>' : ''}
            </td>
            <td style="padding:14px 18px">
              <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#9a6b12;font-weight:bold">Ngày nộp</div>
              <div style="font-size:16px;font-weight:bold;color:#0b5560;margin-top:4px">${formatDate(app.created_at)}</div>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- steps -->
      <tr><td style="padding:24px 32px 8px">
        <div style="font-size:13px;letter-spacing:1px;text-transform:uppercase;color:#9a6b12;font-weight:bold;margin-bottom:14px">Điều gì diễn ra tiếp theo?</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${step(1, 'Đã nhận hồ sơ', 'Hồ sơ và CV của bạn đã được lưu an toàn.')}
          ${step(2, 'Phòng Nhân sự xem xét', 'Chúng tôi đọc kỹ từng hồ sơ để tìm người phù hợp.')}
          ${step(3, 'Liên hệ hẹn phỏng vấn', `Nếu phù hợp, HR sẽ gọi tới số <b style="color:#1f2a2c">${esc(app.phone)}</b> – hãy để ý điện thoại nhé!`)}
          ${step(4, 'Phỏng vấn tại Lái Thiêu', 'Gặp gỡ đội ngũ và tìm hiểu chương trình đào tạo tại Nhật Bản.', true)}
        </table>
      </td></tr>

      <!-- CTA -->
      <tr><td align="center" style="padding:20px 32px 8px">
        <a href="${SITE_URL}/?utm_source=email&amp;utm_medium=confirmation" style="display:inline-block;background:#127884;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;padding:14px 30px;border-radius:999px">Tìm hiểu thêm về Viora &rarr;</a>
      </td></tr>
      <tr><td align="center" style="padding:6px 32px 28px;font-size:14px;color:#5d6a6c;line-height:1.6">
        Biết bạn bè cũng đang tìm việc? <a href="${SITE_URL}/?utm_source=email&amp;utm_medium=referral" style="color:#127884;font-weight:bold">Chia sẻ tin tuyển dụng</a>
      </td></tr>

      <tr><td style="padding:0 32px 28px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbf0d9;border-radius:14px">
          <tr><td style="padding:14px 18px;font-size:14px;color:#5a4410;line-height:1.55">
            &#128172; Cần bổ sung thông tin hoặc có câu hỏi? Chỉ cần <b>trả lời email này</b> hoặc viết tới
            <a href="mailto:${esc(hrEmail)}" style="color:#9a6b12;font-weight:bold">${esc(hrEmail)}</a>
            · Hotline/Zalo <a href="tel:0708299907" style="color:#9a6b12;font-weight:bold">0708 2999 07</a>.
          </td></tr>
        </table>
      </td></tr>

      <tr><td style="padding:0 32px 30px;font-size:15px;line-height:1.6">
        Trân trọng,<br><b style="color:#0b5560">Phòng Nhân sự – Viora Living Saigon</b>
      </td></tr>
    </table>
  </td></tr>

  <!-- footer -->
  <tr><td align="center" style="padding:22px 16px 8px;font-family:Georgia,'Times New Roman',serif;font-style:italic;color:#127884;font-size:15px">Where Aging Becomes Living</td></tr>
  <tr><td align="center" style="padding:0 16px 8px;font-size:12px;color:#7a8789;line-height:1.6">
    Viora Living Saigon – Cơ sở Lái Thiêu · Khu phố Bình Đức 2, Phường Lái Thiêu, TP.HCM<br>
    Email tự động gửi vì bạn đã nộp hồ sơ tại ${esc(SITE_URL.replace(/^https?:\/\//, ''))}.
    Dữ liệu được xử lý theo <a href="${SITE_URL}/chinh-sach-bao-mat" style="color:#7a8789">Chính sách bảo vệ dữ liệu cá nhân</a>.
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
  return { subject, html };
}

export function hrNotification(app: MailApp) {
  const subject = `[Hồ sơ mới] ${app.full_name} – ${app.job_title}`;
  const row = (k: string, v: string) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#5d6a6c;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:6px 0">${v}</td></tr>`;
  const html = layout(subject, `
<p>Có hồ sơ ứng tuyển mới trên website:</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:15px;margin:12px 0 20px">
${row('Họ tên', `<b>${esc(app.full_name)}</b>`)}
${row('Vị trí', esc(app.job_title) + (app.program === 'nhat-ban' ? ' <b style="color:#a3122a">(Chương trình Nhật Bản)</b>' : ''))}
${row('Hình thức', app.work_type === 'PART_TIME' ? 'Part-time' : 'Full-time')}
${row('Chỗ lưu trú', app.need_housing ? '<b>Cần chỗ ở</b>' : 'Không')}
${row('Điện thoại', `<a href="tel:${esc(app.phone)}" style="color:${BRAND}">${esc(app.phone)}</a>`)}
${row('Email', app.email ? esc(app.email) : '—')}
${row('Năm sinh', app.birth_year ? String(app.birth_year) : '—')}
${row('Nơi sinh', esc(app.birthplace))}
${row('Trình độ', app.education_level ? esc(app.education_level) : '—')}
</table>
<p style="text-align:center;margin:24px 0">
<a href="${SITE_URL}/admin/ho-so/${app.id}" style="background:${BRAND};color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:bold;display:inline-block">Xem hồ sơ & CV</a>
</p>
<p style="font-size:12px;color:#5d6a6c">CV không đính kèm trong email vì lý do bảo mật. Đăng nhập trang quản trị để xem.</p>`);
  return { subject, html };
}
