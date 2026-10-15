import 'server-only';

// Gửi email qua Microsoft 365 bằng Microsoft Graph API (ứng dụng đăng ký trong Microsoft Entra,
// quyền Mail.Send giới hạn cho hộp thư MAIL_FROM). Hướng dẫn: docs/HUONG_DAN_EMAIL_MS365.md

// trim + bỏ ngoặc kép: giá trị dán vào Vercel hay dính dấu cách / xuống dòng / "…" thừa
const env = (k: string) => process.env[k]?.trim().replace(/^["']|["']$/g, '') || undefined;
const TENANT = env('MS365_TENANT_ID');
const CLIENT_ID = env('MS365_CLIENT_ID');
const CLIENT_SECRET = env('MS365_CLIENT_SECRET');
export const MAIL_FROM = env('MAIL_FROM');

export const isMailConfigured = () => Boolean(TENANT && CLIENT_ID && CLIENT_SECRET && MAIL_FROM);

let cached: { token: string; expiresAt: number } | null = null;

async function getToken() {
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;
  const res = await fetch(`https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID!,
      client_secret: CLIENT_SECRET!,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials',
    }),
    cache: 'no-store',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`MS365 token: ${data.error_description || data.error || res.status}`);
  cached = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cached.token;
}

export type MailAttachment = { name: string; contentType: string; content: Uint8Array };

export async function sendMail(opts: { to: string[]; subject: string; html: string; replyTo?: string; attachments?: MailAttachment[] }) {
  if (!isMailConfigured()) throw new Error('Chưa cấu hình MS365 (MS365_TENANT_ID, MS365_CLIENT_ID, MS365_CLIENT_SECRET, MAIL_FROM)');
  const res = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(MAIL_FROM!)}/sendMail`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await getToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: {
        subject: opts.subject,
        body: { contentType: 'HTML', content: opts.html },
        toRecipients: opts.to.map(address => ({ emailAddress: { address } })),
        ...(opts.replyTo ? { replyTo: [{ emailAddress: { address: opts.replyTo } }] } : {}),
        ...(opts.attachments?.length ? {
          attachments: opts.attachments.map(a => ({
            '@odata.type': '#microsoft.graph.fileAttachment',
            name: a.name, contentType: a.contentType,
            contentBytes: Buffer.from(a.content).toString('base64'),
          })),
        } : {}),
      },
      saveToSentItems: true,
    }),
    cache: 'no-store',
  });
  if (res.status !== 202) {
    const text = await res.text().catch(() => '');
    throw new Error(`MS365 sendMail ${res.status}: ${text.slice(0, 300)}`);
  }
}
