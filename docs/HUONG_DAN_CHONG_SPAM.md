# Chống spam cho form ứng tuyển

Form ứng tuyển có nhiều lớp chống spam. Các lớp 1–7 **luôn bật**, không cần cấu hình. Lớp 8 (Cloudflare Turnstile) là tùy chọn, nên bật khi bắt đầu thấy hồ sơ rác.

| # | Lớp | Hoạt động thế nào | Bot bị xử lý ra sao |
|---|---|---|---|
| 1 | **Bẫy ẩn (honeypot)** | Ô "Website" ẩn với người thật, bot tự điền | Giả vờ thành công, không lưu gì |
| 2 | **Bẫy thời gian** | Điền xong form dưới 3 giây là bot | Giả vờ thành công, không lưu gì |
| 3 | **Giới hạn số lần gửi** | Mỗi IP tối đa 5 lần / 10 phút; mỗi số điện thoại tối đa 3 lần / ngày | Báo "gửi quá nhiều lần" |
| 4 | **Chống nộp trùng** | Cùng số điện thoại + cùng vị trí trong 7 ngày | Báo "Bạn đã nộp hồ sơ cho vị trí này rồi" |
| 5 | **Kiểm tra nội dung** | Họ tên chỉ có chữ cái; nơi sinh và phần giới thiệu không chứa đường link | Báo lỗi ngay ô đó |
| 6 | **Kiểm tra file CV thật** | Đọc phần đầu file, kiểm tra đúng PDF/Word/ảnh, tối đa 5MB | Xóa file, báo lỗi |
| 7 | **Kiểm tra ở máy chủ** | Mọi dữ liệu được kiểm tra lại trên máy chủ; hồ sơ chỉ ghi được qua API, không ghi thẳng vào CSDL | Báo lỗi |
| 8 | **Cloudflare Turnstile** *(tùy chọn)* | Cloudflare kiểm tra trình duyệt có phải người thật. Đa số người dùng **không thấy gì, không phải bấm chọn ảnh** | Không gửi được form |

Hồ sơ dừng ở bước tải CV (không hoàn tất) sẽ được cron tự xóa sau 24 giờ, cả dòng dữ liệu lẫn file.

## Bật Cloudflare Turnstile (miễn phí, khoảng 5 phút)

1. Vào **https://dash.cloudflare.com** → menu trái **Turnstile** → **Add widget**.
2. Điền:
   - **Widget name**: `Viora tuyển dụng`
   - **Hostnames**: `tuyendung.vioraliving.com.vn`
   - **Widget Mode**: **Managed**
3. Bấm **Create**. Cloudflare đưa ra 2 khóa:
   - **Site Key**: khóa công khai
   - **Secret Key**: ⚠️ khóa bí mật, không gửi qua chat
4. **Vercel → Project → Settings → Environment Variables**, thêm:

   | Biến | Giá trị |
   |---|---|
   | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Site Key |
   | `TURNSTILE_SECRET_KEY` | Secret Key |

5. **Deployments → Redeploy**.
6. Mở trang và nộp thử 1 hồ sơ. Nếu Cloudflare thấy nghi ngờ, một ô xác minh nhỏ hiện ngay trên nút Gửi. Bình thường sẽ không thấy gì.

Muốn tắt Turnstile: xóa 2 biến trên Vercel rồi Redeploy.

## Khi bị tấn công dồn dập
Vào **Vercel → Project → Firewall**:
- Bật **Attack Challenge Mode** tạm thời. Mọi người truy cập phải qua bước kiểm tra, sau khi hết đợt tấn công thì tắt.
- Hoặc thêm **Rate limit rule** cho đường dẫn `/api/apply/init`.

## Xem và dọn hồ sơ rác
- Trang quản trị `/admin`: đổi trạng thái hồ sơ rác sang **Từ chối**.
- Muốn xóa hẳn: Supabase → **Table Editor → applications** → chọn dòng → Delete. File CV ở **Storage → cv** xóa riêng.
