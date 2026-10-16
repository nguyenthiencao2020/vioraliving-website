# Viora Living Saigon – Trang tuyển dụng

Landing page tuyển dụng (Điều dưỡng, Caregiver) + trang quản trị hồ sơ cho HR.
Dùng **GitHub** (mã nguồn) + **Vercel** (chạy website, cron) + **Supabase** (CSDL, kho CV, đăng nhập HR).
Email tự động (cảm ơn ứng viên, báo HR) gửi qua **Microsoft 365** của công ty, từ hộp thư `hr@vioraliving.com.vn`.

## Cấu trúc

| Đường dẫn | Nội dung |
|---|---|
| `/` | Landing page: giới thiệu, vị trí đang tuyển (đọc từ bảng `jobs`), quy trình, form ứng tuyển + upload CV |
| `/chinh-sach-bao-mat` | Chính sách bảo vệ dữ liệu cá nhân (ứng viên đồng ý khi nộp) |
| `/admin` | HR xem danh sách hồ sơ, lọc, tìm kiếm, tải CV, đổi trạng thái, ghi chú |
| `/admin/login` | HR đăng nhập bằng link gửi qua email (không mật khẩu) |
| `/admin/qr` | Tạo mã QR cho poster: theo chương trình hoặc từng vị trí (form chọn sẵn vị trí) |
| `/api/apply/init`, `/api/apply/complete` | Nộp hồ sơ 2 bước: tạo hồ sơ + cấp link upload → kiểm tra file CV |
| `/api/cron/cleanup` | Vercel Cron hằng ngày: xóa hồ sơ upload dở dang > 24h và file CV của chúng, gửi lại email lỗi |
| `lib/mail/` | Gửi email qua Microsoft 365 (Graph API) + mẫu email |
| `supabase/migrations/` | SQL tạo CSDL (chạy trong Supabase SQL Editor) |
| `docs/HUONG_DAN_SUPABASE.md` | Hướng dẫn cài Supabase từng bước |
| `docs/HUONG_DAN_EMAIL_MS365.md` | Hướng dẫn bật email tự động qua Microsoft 365 |
| `docs/HUONG_DAN_CHONG_SPAM.md` | Các lớp chống spam của form + bật Cloudflare Turnstile |

Muốn thêm/sửa/đóng vị trí tuyển dụng: sửa bảng `jobs` trong Supabase **Table Editor** (`active = false` để ẩn). Trang chủ tự cập nhật sau tối đa 5 phút.
- `program`: `thuong` (Tuyển dụng chung) hoặc `tan-sinh-vien` (Chương trình Tân sinh viên)
- `work_types`: `{FULL_TIME}` hoặc `{FULL_TIME,PART_TIME}`
- Quyền lợi, thu nhập của từng chương trình: sửa trong `lib/programs.ts`. Số điện thoại, địa chỉ: `lib/constants.ts`.

Lịch sử phiên bản và cách quay lại bản cũ: xem [`VERSIONS.md`](VERSIONS.md).

## Triển khai lần đầu

1. **Supabase**: làm theo [`docs/HUONG_DAN_SUPABASE.md`](docs/HUONG_DAN_SUPABASE.md).
2. **Vercel**: *Add New → Project* → chọn repo GitHub này (Vercel tự nhận Next.js).
3. Trong *Settings → Environment Variables*, thêm các biến trong [`.env.example`](.env.example):

   | Biến | Lấy ở đâu |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API (anon / publishable) |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (service_role) – **bí mật** |
   | `NEXT_PUBLIC_SITE_URL` | Tên miền website, vd `https://tuyendung.vioraliving.com.vn` |
   | `IP_HASH_SALT` | Chuỗi ngẫu nhiên dài, tự tạo |
   | `CRON_SECRET` | Chuỗi ngẫu nhiên dài, tự tạo (Vercel tự dùng khi gọi cron) |
   | `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Chống spam Cloudflare Turnstile – xem [`docs/HUONG_DAN_CHONG_SPAM.md`](docs/HUONG_DAN_CHONG_SPAM.md) (không bắt buộc) |
   | `MS365_*`, `MAIL_FROM`, `HR_NOTIFY_TO` | Email tự động – xem [`docs/HUONG_DAN_EMAIL_MS365.md`](docs/HUONG_DAN_EMAIL_MS365.md) (không bắt buộc) |

4. *Deployments → Redeploy*. Từ đó mỗi lần push lên nhánh `main` Vercel tự cập nhật website.
5. Gắn tên miền `tuyendung.vioraliving.com.vn`:
   - Vercel *Settings → Domains* → thêm `tuyendung.vioraliving.com.vn` → chép bản ghi CNAME Vercel đưa ra.
   - Cloudflare *DNS → Add record*: `CNAME` · Name `tuyendung` · Target = giá trị Vercel · **DNS only** (đám mây xám).
   - Đổi `NEXT_PUBLIC_SITE_URL` thành `https://tuyendung.vioraliving.com.vn` rồi Redeploy.
   - Supabase *Authentication → URL Configuration*: Site URL = tên miền trên, Redirect URLs thêm `https://tuyendung.vioraliving.com.vn/auth/confirm`.
   - Tạo mã QR cho poster (`/admin/qr`) **sau** khi đã đổi tên miền.

## Chạy trên máy cá nhân

```bash
npm install
cp .env.example .env.local   # điền giá trị
npm run dev                  # http://localhost:3000
npm run typecheck && npm run build
```
