import { CONTACT, SITE_URL, WORK_TYPE_LABELS } from '../constants';
import { PROGRAMS, type ProgramId } from '../programs';

// Mẫu email dựng bằng bảng (table) + style inline để hiển thị đúng trên Gmail, Outlook, Apple Mail và điện thoại.
// Màu nền luôn có bgcolor dự phòng vì Outlook không hiểu gradient / border-radius.

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const C = {
  brand: '#127884',
  dark: '#0b5560',
  bright: '#2ca4ac',
  gold: '#d9a02a',
  goldText: '#9a6b12',
  goldSoft: '#fbf0d9',
  mint: '#e2f2f2',
  bg: '#eef5f4',
  text: '#1f2a2c',
  muted: '#5d6a6c',
  line: '#e4ece9',
};
const SERIF = "'Playfair Display',Georgia,'Times New Roman',serif";
const SANS = "'Be Vietnam Pro',Arial,Helvetica,sans-serif";

export type MailApp = {
  id: string; full_name: string; job_title: string; phone: string; email: string | null;
  birthplace: string; education_level: string | null; created_at: string; message?: string | null;
  program?: string | null; work_type?: string | null; source?: string | null;
  cv_filename?: string | null; cv_size?: number | null;
};

const fmt = (iso: string, withTime = false) =>
  new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(new Date(iso));

// Chỉ ghi tên chương trình khi khác "Tuyển dụng chung" (vd. Chương trình Tân sinh viên)
const programName = (p?: string | null) => (p && p !== 'thuong' && PROGRAMS[p as ProgramId]?.tab) || '';
const workName = (w?: string | null) => (w && WORK_TYPE_LABELS[w]) || '';
const phonePretty = (p: string) => p.replace(/^(\d{4})(\d{3})(\d{3})$/, '$1 $2 $3');
const fileSize = (b?: number | null) =>
  b == null ? '' : b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;

/** Nút bấm "chống vỡ" cho mọi trình đọc email */
function button(href: string, label: string, opts: { bg?: string; color?: string; border?: string } = {}) {
  const bg = opts.bg ?? C.brand;
  const color = opts.color ?? '#ffffff';
  const border = opts.border ?? bg;
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="display:inline-table"><tr>
<td bgcolor="${bg}" style="border-radius:999px;background:${bg};border:2px solid ${border}">
<a href="${href}" style="display:inline-block;padding:13px 26px;font-family:${SANS};font-size:15px;font-weight:bold;color:${color};text-decoration:none;border-radius:999px">${label}</a>
</td></tr></table>`;
}

function chip(text: string, bg: string, color: string) {
  return `<span style="display:inline-block;padding:4px 12px;margin:0 6px 6px 0;border-radius:999px;background:${bg};color:${color};font-family:${SANS};font-size:12px;font-weight:bold;letter-spacing:.3px">${text}</span>`;
}

/** Khung chung: nền, logo, thẻ nội dung, chân trang */
function shell(opts: { title: string; preheader: string; topLabel: string; body: string; footerNote: string }) {
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">
<title>${esc(opts.title)}</title>
<style>
@media (max-width:600px){ .px{padding-left:20px!important;padding-right:20px!important} .col{display:block!important;width:100%!important;box-sizing:border-box!important} .hide-sm{display:none!important} .h1{font-size:26px!important} }
a{color:${C.brand}}
</style></head>
<body style="margin:0;padding:0;background:${C.bg};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">${esc(opts.preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.bg}" style="background:${C.bg}">
<tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">

  <tr><td style="padding:0 4px 16px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td valign="middle">
        <img src="${SITE_URL}/brand/mark.png" width="36" height="33" alt="" style="display:inline-block;vertical-align:middle;border:0">
        <img src="${SITE_URL}/brand/wordmark.png" width="136" height="27" alt="Viora Living Saigon" style="display:inline-block;vertical-align:middle;margin-left:8px;border:0">
      </td>
      <td align="right" valign="middle" class="hide-sm" style="font-family:${SANS};font-size:11px;letter-spacing:1.5px;font-weight:bold;color:${C.goldText};text-transform:uppercase">${opts.topLabel}</td>
    </tr></table>
  </td></tr>

  <tr><td bgcolor="#ffffff" style="background:#ffffff;border-radius:22px;overflow:hidden;box-shadow:0 12px 40px rgba(11,85,96,.12)">
    ${opts.body}
  </td></tr>

  <tr><td align="center" style="padding:26px 16px 6px;font-family:${SERIF};font-style:italic;font-size:16px;color:${C.brand}">${CONTACT.tagline}</td></tr>
  <tr><td align="center" style="padding:0 16px 8px;font-family:${SANS};font-size:12px;line-height:1.7;color:#7a8789">
    <b style="color:${C.muted}">Viora Living Saigon – Cơ sở Lái Thiêu</b><br>${CONTACT.address}<br>
    Hotline <a href="tel:${CONTACT.phoneTel}" style="color:#7a8789">${CONTACT.phone}</a> · <a href="mailto:${CONTACT.email}" style="color:#7a8789">${CONTACT.email}</a><br>
    <span style="color:#9aa5a6">${opts.footerNote}</span>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

const accentBar = `<tr><td height="6" bgcolor="${C.bright}" style="height:6px;line-height:6px;font-size:0;background:${C.bright};background-image:linear-gradient(90deg,${C.dark},${C.bright},${C.gold})">&nbsp;</td></tr>`;

// =====================================================================
// Email cảm ơn ứng viên
// =====================================================================
export function candidateConfirmation(app: MailApp, hrEmail: string) {
  const subject = `Viora Living Saigon đã nhận hồ sơ ${app.job_title} của bạn`;
  // Gọi đầy đủ họ tên cho trang trọng (vd "Cảm ơn Nguyễn Thị Lan!")
  const fullName = app.full_name.trim().replace(/\s+/g, ' ');
  const program = programName(app.program);

  const step = (n: number, title: string, text: string, state: 'done' | 'next' | 'todo', last = false) => {
    const circleBg = state === 'done' ? '#1e9e6a' : state === 'next' ? C.brand : '#ffffff';
    const circleColor = state === 'todo' ? C.brand : '#ffffff';
    const circleBorder = state === 'todo' ? '#cfe6e6' : circleBg;
    return `<tr>
<td width="40" valign="top" style="padding:0">
  <table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="32" height="32" align="center" valign="middle" bgcolor="${circleBg}"
    style="width:32px;height:32px;border-radius:16px;background:${circleBg};border:2px solid ${circleBorder};color:${circleColor};font-family:${SANS};font-size:14px;font-weight:bold">${state === 'done' ? '&#10003;' : n}</td></tr></table>
  ${last ? '' : `<div style="width:2px;height:26px;background:#cfe6e6;margin:4px 0 4px 17px"></div>`}
</td>
<td valign="top" style="padding:5px 0 ${last ? 0 : 12}px 8px;font-family:${SANS}">
  <div style="font-size:15px;font-weight:bold;color:${C.dark}">${title}${state === 'next' ? ` <span style="display:inline-block;margin-left:6px;padding:2px 8px;border-radius:999px;background:${C.goldSoft};color:${C.goldText};font-size:11px">Tiếp theo</span>` : ''}</div>
  <div style="font-size:14px;line-height:1.55;color:${C.muted}">${text}</div>
</td></tr>`;
  };

  const summaryCell = (label: string, value: string) => `
<td class="col" valign="top" style="padding:14px 16px;font-family:${SANS}">
  <div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:${C.goldText};font-weight:bold">${label}</div>
  <div style="font-size:15px;font-weight:bold;color:${C.dark};margin-top:4px">${value}</div>
</td>`;

  const body = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr><td style="font-size:0;line-height:0"><img src="${SITE_URL}/brand/email-banner-v3.jpg" width="600" alt="Viora Living Saigon"
    style="display:block;width:100%;max-width:600px;height:auto;border:0;border-radius:22px 22px 0 0"></td></tr>
  ${accentBar}

  <tr><td class="px" align="center" style="padding:34px 40px 6px">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="64" height="64" align="center" valign="middle" bgcolor="#e6f4ec"
      style="width:64px;height:64px;border-radius:32px;background:#e6f4ec;color:#1e9e6a;font-size:30px;font-weight:bold;font-family:${SANS}">&#10003;</td></tr></table>
    <div style="font-family:${SANS};font-size:12px;letter-spacing:2px;font-weight:bold;color:${C.goldText};text-transform:uppercase;margin-top:18px">Nộp hồ sơ thành công</div>
    <div class="h1" style="font-family:${SERIF};font-size:32px;line-height:1.2;color:${C.dark};font-weight:bold;margin-top:8px">Cảm ơn ${esc(fullName)}!</div>
    <div style="font-family:${SANS};font-size:16px;line-height:1.6;color:${C.muted};margin-top:10px">
      Viora Living Saigon đã nhận được hồ sơ của bạn.<br>Chúng tôi trân trọng sự quan tâm của bạn tới nghề chăm sóc người cao tuổi.
    </div>
  </td></tr>

  <tr><td class="px" style="padding:24px 40px 4px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#f3faf9" style="background:#f3faf9;border:1px solid #d6ecea;border-radius:16px">
      <tr>
        ${summaryCell('Vị trí ứng tuyển', esc(app.job_title))}
        ${summaryCell(program ? 'Chương trình' : 'Hình thức', esc(program.replace(/^Chương trình\s+/i, '') || workName(app.work_type) || 'Full-time'))}
        ${summaryCell('Ngày nộp', fmt(app.created_at))}
      </tr>
    </table>
  </td></tr>

  <tr><td class="px" style="padding:28px 40px 6px">
    <div style="font-family:${SANS};font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:${C.goldText};font-weight:bold;margin-bottom:14px">Các bước tiếp theo</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${step(1, 'Đã nhận hồ sơ', 'Hồ sơ và CV của bạn đã được lưu an toàn.', 'done')}
      ${step(2, 'Phòng Nhân sự xem xét', 'Chúng tôi đọc kỹ từng hồ sơ để tìm người phù hợp.', 'next')}
      ${step(3, 'Liên hệ hẹn phỏng vấn', `Nếu phù hợp, HR sẽ gọi tới số <b style="color:${C.text}">${esc(phonePretty(app.phone))}</b> – bạn để ý điện thoại nhé.`, 'todo')}
      ${step(4, 'Phỏng vấn trực tiếp', `Tại văn phòng ${CONTACT.interviewAddress} – gặp gỡ đội ngũ và tìm hiểu chương trình đào tạo tại Nhật Bản.`, 'todo', true)}
    </table>
  </td></tr>

  <tr><td class="px" style="padding:26px 40px 4px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.dark}" style="background:${C.dark};border-radius:16px">
      <tr><td style="padding:20px 22px;font-family:${SANS}">
        <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#f5d38a;font-weight:bold">Đặc biệt · Sau khi trúng tuyển</div>
        <div style="font-size:20px;font-weight:bold;color:#ffffff;margin-top:6px">Được đào tạo tại <span style="color:#f5c54a">Nhật Bản</span></div>
        <div style="font-size:14px;color:#cfe6e6;margin-top:4px">Chi phí ăn ở, đi lại do Viora Living Saigon chi trả.</div>
      </td></tr>
    </table>
  </td></tr>

  <tr><td class="px" align="center" style="padding:28px 40px 6px">
    ${button(`${SITE_URL}/?utm_source=email&amp;utm_medium=confirmation#vi-tri`, 'Tìm hiểu thêm về Viora &rarr;')}
    <div style="font-family:${SANS};font-size:14px;color:${C.muted};margin-top:14px">
      Bạn bè cũng đang tìm việc? <a href="${SITE_URL}/?utm_source=email&amp;utm_medium=referral" style="color:${C.brand};font-weight:bold">Chia sẻ tin tuyển dụng</a>
    </div>
  </td></tr>

  <tr><td class="px" style="padding:24px 40px 8px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.goldSoft}" style="background:${C.goldSoft};border-radius:14px">
      <tr><td style="padding:16px 20px;font-family:${SANS};font-size:14px;line-height:1.6;color:#5a4410">
        <b>Cần bổ sung thông tin hoặc có câu hỏi?</b><br>
        Trả lời email này, gọi <a href="tel:${CONTACT.phoneTel}" style="color:${C.goldText};font-weight:bold">${CONTACT.phone}</a>
        hoặc viết tới <a href="mailto:${esc(hrEmail)}" style="color:${C.goldText};font-weight:bold">${esc(hrEmail)}</a>.
      </td></tr>
    </table>
  </td></tr>

  <tr><td class="px" style="padding:20px 40px 34px;font-family:${SANS};font-size:15px;line-height:1.6;color:${C.text}">
    Trân trọng,<br><b style="color:${C.dark}">Phòng Nhân sự – Viora Living Saigon</b>
  </td></tr>
</table>`;

  const html = shell({
    title: subject,
    preheader: `Cảm ơn ${fullName}! Hồ sơ ${app.job_title} đã được gửi thành công. Phòng Nhân sự sẽ liên hệ với bạn sớm.`,
    topLabel: 'Tuyển dụng',
    body,
    footerNote: `Email tự động vì bạn đã nộp hồ sơ tại ${SITE_URL.replace(/^https?:\/\//, '')}. Dữ liệu được xử lý theo <a href="${SITE_URL}/chinh-sach-bao-mat" style="color:#9aa5a6">Chính sách bảo vệ dữ liệu cá nhân</a>.`,
  });
  return { subject, html };
}

// =====================================================================
// Email báo HR khi có hồ sơ mới
// =====================================================================
export function hrNotification(app: MailApp, opts: { cvAttached?: boolean } = {}) {
  const program = programName(app.program);
  const work = workName(app.work_type);
  const subject = `[Hồ sơ mới] ${app.full_name} – ${app.job_title}${program ? ` (${program})` : ''}`;
  const words = app.full_name.trim().split(/\s+/);
  const initials = ((words[words.length - 1]?.[0] ?? '') + (words.length > 1 ? words[0][0] : '')).toUpperCase();
  const adminUrl = `${SITE_URL}/admin/ho-so/${app.id}`;
  const intro = app.message?.trim() ?? '';
  const introShort = intro.length > 600 ? intro.slice(0, 600) + '…' : intro;

  const info = (label: string, value: string) => `
<td class="col" width="50%" valign="top" style="padding:12px 16px;border-bottom:1px solid ${C.line};font-family:${SANS}">
  <div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#8a9698;font-weight:bold">${label}</div>
  <div style="font-size:15px;font-weight:bold;color:${C.text};margin-top:3px;word-break:break-word">${value}</div>
</td>`;

  const body = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr><td bgcolor="${C.dark}" class="px" style="background:${C.dark};background-image:linear-gradient(135deg,${C.dark} 0%,${C.brand} 60%,${C.bright} 100%);padding:30px 36px;border-radius:22px 22px 0 0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="72" valign="middle" class="hide-sm">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="60" height="60" align="center" valign="middle" bgcolor="${C.gold}"
          style="width:60px;height:60px;border-radius:30px;background:${C.gold};color:#ffffff;font-family:${SANS};font-size:22px;font-weight:bold;letter-spacing:1px">${esc(initials)}</td></tr></table>
      </td>
      <td valign="middle" style="font-family:${SANS}">
        <div style="font-size:11px;letter-spacing:2px;font-weight:bold;color:#f5d38a;text-transform:uppercase">Hồ sơ ứng tuyển mới</div>
        <div class="h1" style="font-family:${SERIF};font-size:30px;line-height:1.2;color:#ffffff;font-weight:bold;margin:6px 0 4px">${esc(app.full_name)}</div>
        <div style="font-size:15px;color:#d6ecea">ứng tuyển <b style="color:#ffffff">${esc(app.job_title)}</b></div>
      </td>
    </tr></table>
    <div style="margin-top:14px">
      ${program ? chip(esc(program), '#f5d38a', '#3b2a06') : ''}${work ? chip(esc(work), 'rgba(255,255,255,0.16)', '#ffffff') : ''}${chip(`Nộp lúc ${fmt(app.created_at, true)}`, 'rgba(255,255,255,0.16)', '#ffffff')}
    </div>
  </td></tr>
  ${accentBar}

  <tr><td class="px" style="padding:26px 36px 8px">
    <div style="font-family:${SANS};font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:${C.goldText};font-weight:bold;margin-bottom:8px">Thông tin ứng viên</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.line};border-radius:14px;border-collapse:separate">
      <tr>
        ${info('Điện thoại', `<a href="tel:${esc(app.phone)}" style="color:${C.brand};text-decoration:none">${esc(phonePretty(app.phone))}</a>`)}
        ${info('Email', app.email ? `<a href="mailto:${esc(app.email)}" style="color:${C.brand};text-decoration:none">${esc(app.email)}</a>` : '<span style="color:#9aa5a6;font-weight:normal">Không cung cấp</span>')}
      </tr>
      <tr>
        ${info('Nơi sinh / Nguyên quán', esc(app.birthplace))}
        ${info('Trình độ học vấn', app.education_level ? esc(app.education_level) : '<span style="color:#9aa5a6;font-weight:normal">—</span>')}
      </tr>
      <tr>
        ${info('Hình thức mong muốn', work ? esc(work) : '—')}
        ${info('Biết tin qua', app.source ? esc(app.source) : '<span style="color:#9aa5a6;font-weight:normal">—</span>')}
      </tr>
    </table>
  </td></tr>

  ${introShort ? `<tr><td class="px" style="padding:20px 36px 4px">
    <div style="font-family:${SANS};font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:${C.goldText};font-weight:bold;margin-bottom:8px">Kinh nghiệm &amp; giới thiệu bản thân</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="4" bgcolor="${C.gold}" style="background:${C.gold};border-radius:4px">&nbsp;</td>
      <td bgcolor="#fbf8f3" style="background:#fbf8f3;padding:14px 18px;font-family:${SANS};font-size:15px;line-height:1.65;color:${C.text};white-space:pre-wrap">${esc(introShort)}</td>
    </tr></table>
  </td></tr>` : ''}

  ${app.cv_filename ? `<tr><td class="px" style="padding:20px 36px 4px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#f3faf9" style="background:#f3faf9;border:1px solid #d6ecea;border-radius:14px"><tr>
      <td width="56" align="center" valign="middle" style="padding:14px 0 14px 16px">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="40" height="48" align="center" valign="middle" bgcolor="${C.brand}"
          style="width:40px;height:48px;border-radius:8px;background:${C.brand};color:#ffffff;font-family:${SANS};font-size:11px;font-weight:bold">${esc((app.cv_filename.split('.').pop() || 'CV').toUpperCase().slice(0, 4))}</td></tr></table>
      </td>
      <td valign="middle" style="padding:14px 16px;font-family:${SANS}">
        <div style="font-size:14px;font-weight:bold;color:${C.text};word-break:break-all">${esc(app.cv_filename)}</div>
        <div style="font-size:12px;color:${C.muted};margin-top:2px">${fileSize(app.cv_size)}${app.cv_size ? ' · ' : ''}${opts.cvAttached ? '<b style="color:' + C.brand + '">Đã đính kèm trong email này</b>' : 'File lớn – tải trong trang quản trị'}</div>
      </td>
    </tr></table>
  </td></tr>` : ''}

  <tr><td class="px" align="center" style="padding:28px 36px 10px">
    ${button(adminUrl, 'Xem hồ sơ &amp; tải CV &rarr;')}
    <span style="display:inline-block;width:8px"></span>
    ${button(`tel:${esc(app.phone)}`, `Gọi ${esc(phonePretty(app.phone))}`, { bg: '#ffffff', color: C.brand, border: '#cfe6e6' })}
  </td></tr>

  <tr><td class="px" style="padding:12px 36px 30px;font-family:${SANS};font-size:13px;line-height:1.6;color:${C.muted};text-align:center">
    ${app.email ? 'Bấm <b>Trả lời</b> để gửi email trực tiếp cho ứng viên.<br>' : ''}
    Đổi trạng thái hồ sơ (Đang xem xét → Phỏng vấn → …) ngay trong trang quản trị để cả team cùng theo dõi.
  </td></tr>
</table>`;

  const html = shell({
    title: subject,
    preheader: `${app.full_name} ứng tuyển ${app.job_title}${program ? ` – ${program}` : ''} · ${phonePretty(app.phone)}`,
    topLabel: 'Hệ thống tuyển dụng',
    body,
    footerNote: 'Email tự động từ hệ thống tuyển dụng. Thông tin ứng viên là dữ liệu cá nhân – chỉ dùng cho mục đích tuyển dụng, không chuyển tiếp ra ngoài công ty.',
  });
  return { subject, html };
}
