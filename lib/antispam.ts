import 'server-only';

// Các lớp chống spam cho form ứng tuyển (bổ sung cho honeypot + rate limit trong apply-server.ts)

/** Người thật cần ít nhất vài giây để điền form; bot gửi gần như tức thì */
export const MIN_FILL_MS = 3000;

const LINK_RE = /(https?:\/\/|www\.|\b[a-z0-9-]{2,}\.(com|net|org|info|xyz|top|ru|cn|io|link|click|site|online|shop|vn)\b)/i;
export const hasLink = (s?: string | null) => !!s && LINK_RE.test(s);

/** Họ tên: chỉ chữ cái (có dấu tiếng Việt), khoảng trắng, dấu chấm, gạch nối, nháy */
export const NAME_RE = /^[\p{L}\s.'-]+$/u;
/** Nơi sinh: chữ, số, khoảng trắng và vài dấu câu thường gặp trong địa chỉ */
export const PLACE_RE = /^[\p{L}\p{N}\s,./()-]+$/u;

// ----- Cloudflare Turnstile (tùy chọn): bật khi có đủ 2 biến môi trường -----
export const turnstileEnabled = () => Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

export async function verifyTurnstile(token: string | undefined, ip: string) {
  if (!turnstileEnabled()) return true;
  if (!token) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY!, response: token, remoteip: ip }),
      cache: 'no-store',
    });
    const data = await res.json();
    if (!data.success) console.warn('turnstile', data['error-codes']);
    return Boolean(data.success);
  } catch (e) {
    console.error('turnstile verify', e);
    return true; // Cloudflare lỗi thì không chặn ứng viên thật; các lớp khác vẫn hoạt động
  }
}
