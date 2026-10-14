# Viora Living Saigon – Trang tuyển dụng

Landing page tuyển dụng (Điều dưỡng, Caregiver) + trang quản trị hồ sơ cho HR.
Chỉ dùng **GitHub** (mã nguồn) + **Vercel** (chạy website, cron) + **Supabase** (CSDL, kho CV, đăng nhập HR).

## Cấu trúc

| Đường dẫn | Nội dung |
|---|---|
| `/` | Landing page: giới thiệu, vị trí đang tuyển (đọc từ bảng `jobs`), quy trình, form ứng tuyển + upload CV |
| `/chinh-sach-bao-mat` | Chính sách bảo vệ dữ liệu cá nhân (ứng viên đồng ý khi nộp) |
| `/admin` | HR xem danh sách hồ sơ, lọc, tìm kiếm, tải CV, đổi trạng thái, ghi chú |
| `/admin/login` | HR đăng nhập bằng link gửi qua email (không mật khẩu) |
| `/api/apply/init`, `/api/apply/complete` | Nộp hồ sơ 2 bước: tạo hồ sơ + cấp link upload → kiểm tra file CV |
| `/api/cron/cleanup` | Vercel Cron hằng ngày: xóa hồ sơ upload dở dang > 24h và file CV của chúng |
| `supabase/migrations/` | SQL tạo CSDL (chạy trong Supabase SQL Editor) |
| `docs/HUONG_DAN_SUPABASE.md` | Hướng dẫn cài Supabase từng bước |

Muốn thêm/sửa/đóng vị trí tuyển dụng: sửa bảng `jobs` trong Supabase **Table Editor** (`active = false` để ẩn). Trang chủ tự cập nhật sau tối đa 5 phút.

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

4. *Deployments → Redeploy*. Từ đó mỗi lần push lên nhánh `main` Vercel tự cập nhật website.
5. Gắn tên miền ở *Settings → Domains*, rồi cập nhật `NEXT_PUBLIC_SITE_URL` và URL trong Supabase Authentication cho khớp.

## Chạy trên máy cá nhân

```bash
npm install
cp .env.example .env.local   # điền giá trị
npm run dev                  # http://localhost:3000
npm run typecheck && npm run build
```
