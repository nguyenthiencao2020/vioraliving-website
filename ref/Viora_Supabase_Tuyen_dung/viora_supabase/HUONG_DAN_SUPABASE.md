# Hướng dẫn tạo CSDL Tuyển dụng Viora trên Supabase

File SQL đi kèm: `supabase/migrations/20261013000000_viora_tuyen_dung.sql`. File đã được chạy thử 2 lần liên tiếp trên PostgreSQL 16 mà không lỗi, nên chạy lại cũng an toàn.

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
2. Mở file `.sql`, copy toàn bộ, dán vào và bấm **Run**.
3. Kết quả đúng là dòng *Success. No rows returned*. Nếu có các dòng NOTICE "skipping" thì vẫn bình thường.

## Bước 3 – Kiểm tra
- **Table Editor** phải có 6 bảng:

  | Bảng | Dùng để |
  |---|---|
  | `jobs` | Vị trí tuyển dụng, đã có sẵn 2 dòng: Điều dưỡng và Caregiver (2 người) |
  | `applications` | Hồ sơ ứng tuyển |
  | `application_events` | Lịch sử đổi trạng thái hồ sơ |
  | `hr_users` | Email HR được quyền xem hồ sơ |
  | `rate_limits` | Chống spam |

- **Storage** phải có bucket **`cv`** với biểu tượng ổ khóa (Private), giới hạn 5MB, chỉ nhận file PDF, DOC, DOCX, JPG, PNG.
- **Authentication → Policies**: các bảng đều hiện *RLS enabled*.

## Bước 4 – Thêm email HR được xem hồ sơ
Mặc định file SQL đã thêm sẵn `hr@vioraliving.com.vn`. Muốn thêm người khác thì vào **SQL Editor** và chạy:
```sql
insert into public.hr_users (email, full_name, role)
values ('ten.nhanvien@vioraliving.com.vn', 'Tên nhân viên', 'hr');
```

## Bước 5 – Lấy khóa để gắn vào website (Vercel)
Vào **Project Settings → API** và lấy 2 giá trị sau:

| Trên Supabase | Biến trên Vercel | Ghi chú |
|---|---|---|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` | |
| `service_role` key | `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ **Bí mật.** Chỉ dán vào Vercel, không gửi qua chat hoặc email, không đưa lên GitHub |

## Cơ chế bảo mật (đã cài trong SQL)
- **Ứng viên** không đọc được dữ liệu nào. Website nộp hồ sơ qua API server, dùng service_role.
- **File CV** được upload bằng signed URL có hạn dùng do server cấp. Bucket ở chế độ private, không ai mở được bằng link công khai.
- **HR** (email nằm trong bảng `hr_users`) đăng nhập trang quản trị sau này thì xem và đổi được trạng thái hồ sơ. Mỗi lần đổi trạng thái đều được ghi vào `application_events`.
- **Người lạ** dù có tài khoản đăng nhập cũng không xem được hồ sơ (đã test).
- **Hàm chống spam** `check_rate_limit` và **hàm dọn rác** `cleanup_stale` chỉ server gọi được.

## Trạng thái hồ sơ
`uploading` (đang tải CV) → `new` (mới nộp) → `reviewing` (đang xem xét) → `interview` (phỏng vấn) → `offered` (đã mời làm việc) → `hired` (đã nhận việc)

Hai trạng thái kết thúc khác: `rejected` (từ chối), `withdrawn` (ứng viên rút hồ sơ).

## View dùng sẵn
- `v_applications_overdue`: hồ sơ ở trạng thái *new* hoặc *reviewing* quá 30 ngày.
- `v_application_stats`: số hồ sơ theo từng vị trí và trạng thái.
