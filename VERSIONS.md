# Các phiên bản – Trang tuyển dụng Viora Living Saigon

Website thật luôn chạy từ nhánh `main`. Mỗi lần cập nhật được ghi vào bảng dưới kèm **mã commit** – dùng mã này để quay lại.
Nhánh backup `release/vX.Y.Z` **chỉ tạo khi được yêu cầu** (các mốc quan trọng); các bản nhỏ chỉ ghi mã commit.

| Phiên bản | Ngày | Nhánh backup / mã commit | Nội dung chính |
|---|---|---|---|
| **v1.5.3** | 19/10/2026 | (không tạo nhánh) | Tối ưu cuộn trang mượt hơn (đo trên máy yếu: 24 → 53 FPS, hết giật): bỏ hiệu ứng kính mờ ở thanh menu / thẻ số lượng / thanh dưới điện thoại; vệt màu nền vẽ bằng gradient thay cho làm mờ; viền sáng thẻ số lượng chỉ chạy khi rê chuột; chữ lấp lánh chạy 3 lần rồi dừng. Giao diện giữ nguyên. |
| **v1.5.2** | 16/10/2026 | `release/v1.5.2` | Hình thức làm việc ghi bằng tiếng Việt: **Toàn thời gian (ổn định)** · **Bán thời gian / cộng tác theo nhu cầu các bên** (thay "Full-time / Part-time"); bỏ "theo ca 6 ngày/tuần" và bỏ dòng hình thức dưới 3 thẻ số lượng. Không cần chạy SQL. |
| **v1.5.1** | 16/10/2026 | `release/v1.5.1` | Link / mã QR cũ của vị trí Tân sinh viên (đang ẩn) **tự chuyển sang vị trí tương ứng đang tuyển**; trang 404 mang giao diện Viora (nút Xem vị trí đang tuyển, Gọi). Không cần chạy SQL. |
| **v1.5.0** | 16/10/2026 | `release/v1.5.0` | Gửi hồ sơ: **khung tiến trình 3 bước** (Gửi thông tin → Tải CV lên kèm % → Hoàn tất); **tự nén ảnh CV chụp điện thoại** trước khi tải lên; **popup "Cảm ơn {họ tên}!"** giữa màn hình khi nộp xong (dấu tích động, nhắc email xác nhận, nút Đóng / Gửi thêm hồ sơ khác). Không cần chạy SQL. |
| **v1.4.2** | 16/10/2026 | `release/v1.4.2` | QA đồng nhất nội dung: Chính sách bảo mật **v3** (bỏ "năm sinh", "trường tốt nghiệp"; ghi đúng máy chủ **Sydney, Úc**; nêu rõ email kèm CV gửi HR qua Microsoft 365); tên KTV thống nhất dạng "Vật lý trị liệu, Phục hồi chức năng"; email không ghi "Tuyển dụng chung" nữa (email cảm ơn hiện Hình thức). Không cần chạy SQL. |
| **v1.4.1** | 16/10/2026 | `release/v1.4.1` | Ảnh đầu trang + banner email cảm ơn đổi sang ảnh mới: **đồng phục trắng viền xanh ngọc có logo**, đồng bộ với 4 thẻ giá trị. Không cần chạy SQL. |
| **v1.4.0** | 16/10/2026 | `release/v1.4.0` | 4 giá trị Tận tâm · Chuyên nghiệp · Toàn diện · Kiến tạo thành **4 thẻ ảnh** như poster (ảnh HR gửi, đồng phục trắng có logo), lớp phủ xanh thương hiệu, ảnh phóng nhẹ khi rê chuột. Không cần chạy SQL. |
| **v1.3.1** | 16/10/2026 | `release/v1.3.1` | Nền trang **chuyển màu mượt theo phần đang xem** (bạc hà → be → kem…), không còn mép cắt giữa các phần; vệt màu đầu trang mờ dần; thanh menu đổi tông theo nền. Bỏ câu hỏi "Không có CV đánh máy thì sao?". Không cần chạy SQL. |
| **v1.3.0** | 16/10/2026 | `release/v1.3.0` | Thiết kế lại các khối mới với hiệu ứng động: số lượng tuyển **chạy số** khi cuộn tới, viền sáng chạy quanh thẻ; banner Nhật Bản nền chuyển động + ảnh phóng chậm + chữ lấp lánh; thẻ quyền lợi đánh số 01–06, biểu tượng gradient, viền màu khi rê chuột; dải 4 giá trị màu thương hiệu với vòng sáng. Tự tắt hiệu ứng khi máy bật "giảm chuyển động". Không cần chạy SQL. |
| **v1.2.0** | 16/10/2026 | `release/v1.2.0` | **Bản final của HR**: chỉ tuyển 3 vị trí như poster (10 Điều dưỡng, 10 NV chăm sóc người cao tuổi, 05 KTV VLTL – PHCN); **tạm ẩn Chương trình Tân sinh viên** (không xóa); yêu cầu ghi nguyên văn poster; bố cục mới: 3 thẻ số lượng dưới ảnh đầu trang, thẻ vị trí hiện mô tả công việc, banner Nhật có ảnh, lưới quyền lợi có biểu tượng. SQL: `20261017100000_viora_ban_final_hr.sql` |
| **v1.1.0** | 16/10/2026 | `release/v1.1.0` | Cập nhật toàn bộ theo **poster tuyển dụng mới của HR**: KTV đổi tên "Vật lý trị liệu, Phục hồi chức năng"; mô tả công việc + yêu cầu theo poster; quyền lợi mới (môi trường nhân văn, phát triển nghề nghiệp lâu dài, **có chỗ lưu trú tại Trung tâm**); 4 giá trị Tận tâm · Chuyên nghiệp · Toàn diện · Kiến tạo; Hỏi đáp về chỗ ở. SQL: `20261017000000_viora_noi_dung_poster_moi.sql` |
| **v1.0.0** | 16/10/2026 | `release/v1.0.0` | Bản ổn định đầu tiên: 2 chương trình (Tuyển dụng chung, Tân sinh viên), 6 vị trí, nhận người chưa có kinh nghiệm, ảnh phong cách khách sạn 5 sao, form + CV (Supabase), chống spam + Turnstile, email MS365 (cảm ơn ứng viên + báo HR kèm CV), trang HR, SEO, Vercel Sydney. SQL: 4 file đến `20261016000000_…` |

## Cách quay lại (rollback) một phiên bản

Một phiên bản gồm 2 phần: **code website** (GitHub/Vercel) và **nội dung vị trí** (bảng `jobs` trong Supabase).

### 1. Code website – nhanh nhất qua Vercel (không cần sửa code)
Vercel → **Deployments** → tìm bản deploy cũ (cột commit ghi đúng phiên bản) → **⋯ → Promote to Production** (hoặc *Instant Rollback*).
Website quay lại bản đó ngay trong vài giây. Lần push code tiếp theo lên `main` sẽ thay thế.

### 2. Code website – quay hẳn nhánh `main` về phiên bản cũ
Nhờ người quản lý code (hoặc Claude) đưa nội dung nhánh `release/vX.Y.Z` (hoặc mã commit của phiên bản) trở lại `main`
(tạo 1 commit "revert", không xóa lịch sử). Vercel tự deploy lại.

### 3. Nội dung vị trí trong Supabase
- Về **v1.0.0** từ v1.1.0: chạy `supabase/rollback/v1.0.0_jobs.sql`, sau đó chạy lại
  `supabase/migrations/20261016000000_viora_nhan_chua_kinh_nghiem.sql`.
- Bật lại **Chương trình Tân sinh viên** (v1.2.0 → có lại 2 tab): chạy `supabase/rollback/bat_lai_tan_sinh_vien.sql`. Trang chủ tự hiện lại 2 tab.
- Về **v1.1.0** từ v1.2.0: chạy `bat_lai_tan_sinh_vien.sql`, rồi chạy lại `supabase/migrations/20261017000000_viora_noi_dung_poster_moi.sql`.
- Hồ sơ ứng viên (bảng `applications`) và file CV **không bị ảnh hưởng** khi rollback.
