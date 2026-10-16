# Hướng dẫn tạo CSDL Tuyển dụng Viora trên Supabase

Có 3 file SQL trong `supabase/migrations/`, chạy **theo thứ tự**:
1. `20261013000000_viora_tuyen_dung.sql` – tạo bảng, phân quyền, kho CV, dữ liệu mẫu.
2. `20261014000000_viora_bao_mat_bo_sung.sql` – vá bảo mật (HR phải xác nhận email, chặn tham số rate limit sai, HR chỉ sửa được trạng thái/ghi chú).
3. `20261015000000_viora_hai_chuong_trinh.sql` – 2 chương trình tuyển dụng theo poster: **Tuyển dụng chung** (10 Điều dưỡng, 10 NV chăm sóc, 05 KTV Vật lý trị liệu) và **Chương trình Tân sinh viên** (Điều dưỡng, 02 Caregiver); thêm Full-time/Part-time.
4. `20261016000000_viora_nhan_chua_kinh_nghiem.sql` – thêm KTV Vật lý trị liệu vào Chương trình Tân sinh viên; ghi rõ nhận ứng viên chưa có kinh nghiệm ở cả 6 vị trí.
5. `20261017000000_viora_noi_dung_poster_moi.sql` – nội dung theo poster tuyển dụng mới (v1.1.0). Quay lại v1.0.0: xem `VERSIONS.md`.
6. `20261017100000_viora_ban_final_hr.sql` – bản final HR (v1.2.0): chỉ 3 vị trí, tạm ẩn Chương trình Tân sinh viên.

Cả hai file đều chạy lại được an toàn.

## Bước 1 – Tạo project (khoảng 3 phút)
1. Vào https://supabase.com, đăng nhập bằng **email công ty** (không dùng email cá nhân).
2. Bấm **New organization**, đặt tên `Viora Living`.
3. Bấm **New project** và điền:
   - Name: `viora-website`
   - Database Password: bấm *Generate*, rồi **lưu mật khẩu này vào nơi an toàn**.
   - Region: **Southeast Asia (Singapore)**
   - Plan: Free (để dev). Khi chạy chính thức thì nâng lên Pro.
4. Chờ khoảng 1–2 phút cho project khởi tạo xong.

## Bước 2 – Chạy SQL tạo CSDL + kho CV
1. Ở menu trái, chọn **SQL Editor**, rồi bấm **New query**.
2. Mở file `20261013000000_viora_tuyen_dung.sql`, copy toàn bộ, dán vào và bấm **Run**.
3. Tạo **New query** khác, làm tương tự với file `20261014000000_viora_bao_mat_bo_sung.sql`, rồi file `20261015000000_viora_hai_chuong_trinh.sql`, rồi file `20261016000000_viora_nhan_chua_kinh_nghiem.sql`, rồi file `20261017000000_viora_noi_dung_poster_moi.sql`, rồi file `20261017100000_viora_ban_final_hr.sql`.
   Nếu Supabase cảnh báo *destructive operation* thì bấm **Run this query** (do có lệnh `drop … if exists` để chạy lại an toàn, không xoá dữ liệu).
4. Kết quả đúng là dòng *Success. No rows returned*. Nếu có các dòng NOTICE "skipping" thì vẫn bình thường.

## Bước 3 – Kiểm tra
- **Table Editor** phải có 5 bảng:

  | Bảng | Dùng để |
  |---|---|
  | `jobs` | Vị trí tuyển dụng, có sẵn 5 dòng: 3 vị trí Tuyển dụng chung + 2 vị trí Chương trình Tân sinh viên (`tan-sinh-vien-…`) |
  | `applications` | Hồ sơ ứng tuyển |
  | `application_events` | Lịch sử đổi trạng thái hồ sơ |
  | `hr_users` | Email HR được quyền xem hồ sơ |
  | `rate_limits` | Chống spam |

- **Storage** phải có bucket **`cv`** với biểu tượng ổ khóa (Private), giới hạn 5MB, chỉ nhận file PDF, DOC, DOCX, JPG, PNG.
- **Database → Policies** (hoặc Authentication → Policies): các bảng đều hiện *RLS enabled*.

## Bước 4 – Thêm email HR được xem hồ sơ
Mặc định file SQL đã thêm sẵn `hr@vioraliving.com.vn`. Muốn thêm người khác thì vào **SQL Editor** và chạy:
```sql
insert into public.hr_users (email, full_name, role)
values ('ten.nhanvien@vioraliving.com.vn', 'Tên nhân viên', 'hr');
```
Không cần tạo tài khoản: lần đầu người đó nhập email ở `/admin/login`, website tự tạo tài khoản và gửi link đăng nhập.

Muốn thu hồi quyền: `delete from public.hr_users where email = '...';`

## Bước 4b – Cấu hình đăng nhập cho trang quản trị (`/admin`)
Vào **Authentication**:
1. **Sign In / Providers → Email**: bật Email. **Tắt** *Allow new users to sign up* (chỉ website mới tạo tài khoản HR).
2. **URL Configuration**:
   - *Site URL*: `https://<tên-miền-website>`
   - *Redirect URLs*: thêm `https://<tên-miền-website>/auth/confirm` (và `http://localhost:3000/auth/confirm` nếu chạy thử máy cá nhân).
3. **Mẫu email đăng nhập (Emails → Magic link or OTP)**: không cần sửa. Supabase chỉ cho sửa mẫu khi đã cài SMTP riêng. Với mẫu mặc định, HR **mở email và bấm link trên cùng máy, cùng trình duyệt** đã bấm "Gửi link đăng nhập".
   Khi đã cài SMTP riêng (xem lưu ý bên dưới), có thể đổi link trong mẫu thành
   `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email` để mở được trên máy khác.

> ⚠️ **Giới hạn email của Supabase:** máy chủ email có sẵn của Supabase chỉ gửi được rất ít email mỗi giờ và **chỉ gửi tới email của thành viên trong organization Supabase**. Chọn 1 trong 2:
> - Mời các email HR vào organization (**Organization → Team → Invite**), hoặc
> - Vào **Authentication → Emails → SMTP Settings** và điền SMTP của hộp thư công ty (`@vioraliving.com.vn`). Cách này không giới hạn người nhận, nên dùng khi chạy chính thức.

## Bước 5 – Lấy khóa để gắn vào website (Vercel)
Vào **Project Settings → API** (hoặc *API Keys*) và lấy các giá trị sau:

| Trên Supabase | Biến trên Vercel | Ghi chú |
|---|---|---|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` | |
| `anon` key (hoặc *publishable* key) | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Công khai, dùng để upload CV và đăng nhập HR |
| `service_role` key | `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ **Bí mật.** Chỉ dán vào Vercel, không gửi qua chat hoặc email, không đưa lên GitHub |

## Cơ chế bảo mật (đã cài trong SQL)
- **Ứng viên** không đọc được dữ liệu nào. Website nộp hồ sơ qua API server, dùng service_role.
- **File CV** được upload bằng signed URL có hạn dùng do server cấp. Bucket ở chế độ private, không ai mở được bằng link công khai.
- **HR** (email nằm trong bảng `hr_users` và đã xác nhận qua link đăng nhập) đăng nhập trang `/admin` thì xem và đổi được trạng thái hồ sơ. Mỗi lần đổi trạng thái đều được ghi vào `application_events`.
- **Người lạ** dù có tài khoản đăng nhập cũng không xem được hồ sơ (đã test).
- **Hàm chống spam** `check_rate_limit` và **hàm dọn rác** `cleanup_stale` chỉ server gọi được.

## Trạng thái hồ sơ
`uploading` (đang tải CV) → `new` (mới nộp) → `reviewing` (đang xem xét) → `interview` (phỏng vấn) → `offered` (đã mời làm việc) → `hired` (đã nhận việc)

Hai trạng thái kết thúc khác: `rejected` (từ chối), `withdrawn` (ứng viên rút hồ sơ).

## View dùng sẵn
- `v_applications_overdue`: hồ sơ ở trạng thái *new* hoặc *reviewing* quá 30 ngày.
- `v_application_stats`: số hồ sơ theo từng vị trí và trạng thái.
