# Tổng hợp dự án – Trang tuyển dụng Viora Living Saigon

> Cập nhật: 16/10/2026 · Phiên bản đang chạy: **v1.4.2** · Website: https://tuyendung.vioraliving.com.vn
>
> Tài liệu này ghi lại toàn bộ những gì đã làm: hạ tầng, tài khoản, nội dung, tính năng, quy trình vận hành,
> các phiên bản và cách quay lại. Lịch sử phiên bản chi tiết xem thêm [`VERSIONS.md`](../VERSIONS.md).

---

## 1. Tổng quan

Landing page tuyển dụng cho **Viora Living Saigon – Trung tâm chăm sóc người cao tuổi, Cơ sở Lái Thiêu**,
kèm trang quản trị hồ sơ cho Phòng Nhân sự (HR).

- Ứng viên xem vị trí → nộp hồ sơ + CV trên web → nhận **email cảm ơn** tự động.
- HR nhận **email báo hồ sơ mới kèm CV**, xem / lọc / đổi trạng thái hồ sơ tại `/admin`.
- Nội dung theo **poster tuyển dụng bản final của HR (16/10/2026)**.

## 2. Hạ tầng & tài khoản

| Hạng mục | Dịch vụ | Ghi chú |
|---|---|---|
| Mã nguồn | **GitHub** – `nguyenthiencao2020/vioraliving-website` | Nhánh `main` = website thật. Nhánh `release/vX.Y.Z` = bản backup |
| Chạy website | **Vercel** | Vùng máy chủ **Sydney (`syd1`)**, cùng vùng Supabase. Push lên `main` → tự deploy. Preview cho nhánh `claude/*`, `release/*` đã tắt |
| Cơ sở dữ liệu, kho CV, đăng nhập HR | **Supabase** | Vùng **Sydney (ap-southeast-2)**. Bảng `jobs`, `applications`… Kho file `cv` (riêng tư) |
| Email tự động | **Microsoft 365** (tenant của ASIF – đơn vị tài trợ) | Gửi từ `hr@vioraliving.com.vn` qua Microsoft Graph, quyền giới hạn đúng hộp thư này (Exchange RBAC) |
| Tên miền / DNS | **Cloudflare** – tài khoản **"Viora Living Saigon"** (`info@vioraliving.com.vn`) | `tuyendung` → CNAME về Vercel, **DNS only** (đám mây xám) |
| Chống spam | **Cloudflare Turnstile** | Widget tạo trong Cloudflare (mục Turnstile) – không xóa widget / tài khoản chứa nó, nếu không form sẽ báo lỗi xác minh |
| SEO | **Google Search Console** – tài sản Miền `vioraliving.com.vn` | Đã xác minh bằng TXT, đã gửi sitemap (Success) |

### Biến môi trường trên Vercel (Production)
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`,
`IP_HASH_SALT`, `CRON_SECRET`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`,
`MS365_TENANT_ID`, `MS365_CLIENT_ID`, `MS365_CLIENT_SECRET`, `MAIL_FROM`, `HR_NOTIFY_TO`.

> Sửa biến xong phải **Redeploy** mới có hiệu lực. `MS365_CLIENT_SECRET` phải là cột **Value** (không phải Secret ID).
> `HR_NOTIFY_TO` chỉ ghi địa chỉ email, nhiều email cách nhau dấu phẩy.

## 3. Nội dung tuyển dụng (theo poster final)

**Đang tuyển 3 vị trí** – Full-time / Part-time, làm việc theo ca 6 ngày/tuần:

| Vị trí | Số lượng | Link |
|---|---|---|
| Điều dưỡng | 10 | `/viec-lam/dieu-duong` |
| Nhân viên chăm sóc người cao tuổi | 10 | `/viec-lam/nhan-vien-cham-soc` |
| Kỹ thuật viên Vật lý trị liệu, Phục hồi chức năng | 05 | `/viec-lam/vat-ly-tri-lieu` |

- **Mô tả công việc & Yêu cầu**: nguyên văn poster (lưu trong bảng `jobs` của Supabase).
- **Quyền lợi**: đào tạo chuyên môn tại Nhật Bản (Viora chi trả ăn ở, đi lại) · thu nhập cạnh tranh · BHXH, BHYT, BHTN ·
  môi trường chuyên nghiệp, nhân văn · phát triển nghề nghiệp lâu dài · **có chỗ lưu trú tại Trung tâm** cho nhân sự có nhu cầu.
- **4 giá trị**: Tận tâm · Chuyên nghiệp · Toàn diện · Kiến tạo (4 thẻ ảnh).
- **Nơi làm việc**: Viora Living Saigon – Cơ sở Lái Thiêu, Khu phố Bình Đức 2, Phường Lái Thiêu, TP.HCM.
- **Phỏng vấn**: văn phòng 62 Tân Canh, Phường Tân Sơn Hòa, TP.HCM (không phải trụ sở chính).
- **Liên hệ**: hotline **0708 2999 07** · email **hr@vioraliving.com.vn**. Tagline: *Where Aging Becomes Living*.
- **Chương trình Tân sinh viên** (Điều dưỡng, Caregiver, KTV – chỉ Full-time): **tạm ẩn**, không xóa. Bật lại: chạy
  `supabase/rollback/bat_lai_tan_sinh_vien.sql` → trang chủ tự hiện lại 2 tab.

> Giữ thêm ý **"nhận ứng viên chưa có kinh nghiệm – được đào tạo"** (ngoài poster) ở: thẻ nổi đầu trang, 1 dòng Quyền lợi,
> 1 câu Hỏi đáp – **đã chốt giữ nguyên (16/10/2026)**.

Sửa nội dung ở đâu:
- Vị trí, số lượng, mô tả, yêu cầu, ẩn/hiện: Supabase → Table Editor → bảng **`jobs`** (`active = false` để ẩn). Web tự cập nhật sau tối đa 5 phút.
- Quyền lợi, 4 giá trị, giới thiệu chương trình: `lib/programs.ts`.
- SĐT, email, địa chỉ, nơi phỏng vấn: `lib/constants.ts`.
- Hỏi đáp, bố cục trang chủ: `app/page.tsx`.

## 4. Các trang & tính năng

| Đường dẫn | Nội dung |
|---|---|
| `/` | Trang chủ: ảnh đầu trang, 3 thẻ số lượng (số chạy khi cuộn), 3 thẻ vị trí, Quyền lợi (banner Nhật Bản + 6 thẻ), 4 giá trị, Quy trình 4 bước, Form ứng tuyển, Hỏi đáp, Chia sẻ |
| `/viec-lam/<vị trí>` | Trang chi tiết từng vị trí (mô tả, yêu cầu, quyền lợi, nơi làm việc, nơi phỏng vấn, nút ứng tuyển) |
| `/chinh-sach-bao-mat` | Chính sách bảo vệ dữ liệu cá nhân – phiên bản **pdp-2026-10-v3** |
| `/admin` | HR: danh sách hồ sơ, lọc, tìm, đổi trạng thái, ghi chú, tải CV, **tình trạng email + nút "Gửi lại email"** |
| `/admin/qr` | Tạo mã QR cho poster (theo vị trí – form chọn sẵn vị trí) |
| `/admin/login` | HR đăng nhập bằng link gửi qua email (mở link trên **cùng trình duyệt** đã yêu cầu) |

**Giao diện**: phong cách khách sạn 5 sao, màu thương hiệu xanh ngọc #127884 · vàng #D9A02A · kem #FBF8F3.
Ảnh đồng phục trắng viền xanh có logo. Hiệu ứng: số chạy, viền sáng, ảnh phóng chậm, **nền trang chuyển màu mượt theo phần đang xem**.
Tự tắt hiệu ứng khi máy bật "giảm chuyển động".

### Form ứng tuyển
1. Chọn vị trí (+ Full-time/Part-time) → 2. Thông tin (Họ tên*, SĐT*, Email, Nơi sinh*, Trình độ, Biết tin qua)
→ 3. Kinh nghiệm & giới thiệu bản thân* (≥ 20 ký tự) → 4. CV* (PDF, DOC, DOCX, JPG, PNG ≤ 5 MB) → Đồng ý chính sách → Gửi.
Sau khi gửi: màn hình "Cảm ơn {họ tên đầy đủ}!".

### Email tự động (Microsoft 365)
- **Cảm ơn ứng viên** (nếu có email): "Cảm ơn {họ tên đầy đủ}!", vị trí, hình thức, ngày nộp, các bước tiếp theo, phỏng vấn tại 62 Tân Canh.
- **Báo HR** (gửi `HR_NOTIFY_TO`): thông tin ứng viên, phần giới thiệu, **CV đính kèm** (file ≤ 2,8 MB; lớn hơn thì tải trong `/admin`). Bấm *Trả lời* = gửi thẳng cho ứng viên.
- Lỗi gửi → lưu vào hồ sơ, hệ thống tự thử lại mỗi đêm trong 3 ngày; HR xem lỗi và bấm "Gửi lại email" ở trang chi tiết hồ sơ.

### Chống spam
Ô bẫy ẩn · điền quá nhanh (< 3 giây) · giới hạn 5 lần/10 phút theo IP và 3 lần/ngày theo SĐT · chặn nộp trùng
(cùng SĐT + vị trí trong 7 ngày) · kiểm tra họ tên, chặn link · kiểm tra file thật (không chỉ đuôi file) · Cloudflare Turnstile.

### Bảo mật dữ liệu
- Supabase RLS: chỉ tài khoản trong `hr_users` **đã xác nhận email** mới xem được hồ sơ; HR chỉ sửa được trạng thái / ghi chú / người phụ trách.
- Kho CV riêng tư, link tải CV chỉ có hiệu lực 10 phút. Mọi thay đổi trạng thái được ghi lịch sử.
- Tác vụ dọn dẹp hằng đêm (Vercel Cron) xóa hồ sơ nộp dở > 24 giờ và file kèm theo.

### SEO
Mỗi vị trí 1 trang riêng có dữ liệu JobPosting (Google for Jobs) · sitemap tự cập nhật (5 URL) · robots.txt chặn `/admin`, `/api` ·
Search Console đã xác minh và gửi sitemap. Cần 2–7 ngày để có số liệu.

## 5. Cơ sở dữ liệu – các file SQL

Chạy lần lượt trong Supabase → SQL Editor (đều an toàn khi chạy lại):

1. `20261013000000_viora_tuyen_dung.sql` – bảng, phân quyền, kho CV
2. `20261014000000_viora_bao_mat_bo_sung.sql` – bảo mật bổ sung
3. `20261015000000_viora_hai_chuong_trinh.sql` – 2 chương trình, Full/Part-time
4. `20261016000000_viora_nhan_chua_kinh_nghiem.sql` – thêm KTV Tân sinh viên
5. `20261017000000_viora_noi_dung_poster_moi.sql` – nội dung poster mới (v1.1.0)
6. `20261017100000_viora_ban_final_hr.sql` – bản final HR: 3 vị trí, ẩn Tân sinh viên (v1.2.0)

Kiểm tra nhanh: `select program, title, active, quantity from jobs order by program, sort_order;`

## 6. Phiên bản & cách quay lại

| Phiên bản | Nhánh backup | Tóm tắt |
|---|---|---|
| v1.0.0 | `release/v1.0.0` | Bản đầu: 2 chương trình, 6 vị trí |
| v1.1.0 | `release/v1.1.0` | Nội dung poster mới, vẫn 2 chương trình |
| v1.2.0 | `release/v1.2.0` | Bản final HR: 3 vị trí, ẩn Tân sinh viên, bố cục mới |
| v1.3.0 | `release/v1.3.0` | Hiệu ứng động cho các khối mới |
| v1.3.1 | `release/v1.3.1` | Nền chuyển màu mượt theo phần đang xem |
| v1.4.0 | `release/v1.4.0` | 4 giá trị thành thẻ ảnh |
| v1.4.1 | `release/v1.4.1` | Ảnh đầu trang + banner email mới (đồng phục trắng có logo) |
| **v1.4.2** | `release/v1.4.2` | QA đồng nhất nội dung, Chính sách v3 |

**Quay lại website**: Vercel → Deployments → chọn bản cũ → ⋯ → **Promote to Production** (vài giây).
**Quay lại nội dung vị trí**: xem mục *Cách quay lại* trong [`VERSIONS.md`](../VERSIONS.md).
Hồ sơ ứng viên và file CV không bị ảnh hưởng khi rollback.

## 7. Vận hành hằng ngày (HR)

- Vào `/admin` xem hồ sơ mới, đổi trạng thái (Mới nộp → Đang xem xét → Phỏng vấn → Đã mời làm việc → Đã nhận việc; hoặc Từ chối / Ứng viên rút).
- Tuyển đủ 1 vị trí → Supabase bảng `jobs` đặt `active = false` (web + Google tự gỡ tin).
- Mã QR cho poster: `/admin/qr` (dùng tên miền thật).
- Xóa hồ sơ thử: Supabase Storage `cv` xóa file trước → SQL `delete from applications where phone = '…';`

## 8. Việc cần nhớ / còn treo

- [ ] **Gia hạn client secret Microsoft 365** trước ngày hết hạn (xem cột Expires trong Entra) – hết hạn là email ngừng gửi.
- [ ] Xóa các client secret cũ (chép nhầm) trong Entra.
- [ ] Bật **2FA** cho tài khoản Cloudflare `info@`.
- [ ] Cấp quyền **Full Access** hộp thư `hr@` cho tài khoản HR đọc email trên Outlook (lỗi `accessDenied`).
- [ ] Ảnh "Toàn diện" (`public/images/3.png`): logo trên áo bị AI viết sai "VORA LIVING" – sửa nếu muốn.
- [ ] Gắn link "Tuyển dụng" lên website chính `vioraliving.com.vn` và Fanpage (tăng SEO).
- [ ] Pháp chế duyệt Chính sách bảo vệ dữ liệu; xóa hồ sơ quá 12 tháng (hiện làm thủ công).
- [ ] Theo dõi Search Console sau 1 tuần (Pages, Performance, Job postings).

## 9. Xử lý sự cố thường gặp

| Hiện tượng | Nguyên nhân / cách xử lý |
|---|---|
| Web chưa đổi sau khi chạy SQL | Trang lưu tạm 5 phút → đợi hoặc Vercel **Redeploy**, rồi Ctrl+F5 |
| Email không gửi | Mở hồ sơ trong `/admin` → dòng "Email tự động" ghi rõ lỗi → sửa biến trên Vercel → Redeploy → "Gửi lại email" |
| `AADSTS7000215` | `MS365_CLIENT_SECRET` sai (đang là Secret ID / chép thiếu) → tạo secret mới, chép cột **Value** bằng nút Copy |
| `ErrorInvalidRecipients` | `HR_NOTIFY_TO` không phải email → xóa biến, tạo lại đúng `hr@vioraliving.com.vn` |
| Form báo "Kết nối bị gián đoạn" | Mạng chập chờn / mạng công ty chặn `*.supabase.co` → thử 4G |
| Email Vercel "Preview deployment failed" | Đã tắt Preview cho nhánh `claude/*`, `release/*` – bỏ qua nếu còn |
| HR đăng nhập không được | Mở link đăng nhập trên **cùng trình duyệt** đã bấm gửi link; tài khoản phải có trong bảng `hr_users` |

## 10. Tài liệu liên quan

- [`README.md`](../README.md) – cấu trúc code, triển khai lần đầu
- [`VERSIONS.md`](../VERSIONS.md) – lịch sử phiên bản + rollback
- [`docs/HUONG_DAN_SUPABASE.md`](HUONG_DAN_SUPABASE.md) – cài Supabase, các file SQL
- [`docs/HUONG_DAN_EMAIL_MS365.md`](HUONG_DAN_EMAIL_MS365.md) – email tự động qua Microsoft 365
- [`docs/HUONG_DAN_CHONG_SPAM.md`](HUONG_DAN_CHONG_SPAM.md) – chống spam + Turnstile
