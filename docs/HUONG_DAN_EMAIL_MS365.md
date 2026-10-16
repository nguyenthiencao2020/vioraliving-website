# Hướng dẫn bật email tự động qua Microsoft 365

Khi có người nộp hồ sơ trên website, hệ thống tự gửi **từ hộp thư `hr@vioraliving.com.vn`**:

| Email | Gửi cho | Nội dung |
|---|---|---|
| Cảm ơn ứng viên | Ứng viên (nếu có điền email) | Banner, xác nhận đã nhận hồ sơ, các bước tiếp theo. Ứng viên bấm *Trả lời* sẽ về `hr@` |
| Báo hồ sơ mới | Các email trong `HR_NOTIFY_TO` | Thông tin ứng viên + **CV đính kèm** (nếu file ≤ 2,8 MB; file lớn hơn thì tải trong `/admin`) + nút **Xem hồ sơ & CV** |

Website gửi email qua **Microsoft Graph API** bằng một "ứng dụng" đăng ký trong Microsoft 365 của công ty. Không dùng mật khẩu hộp thư và không cần dịch vụ email bên ngoài.

> Người làm cần quyền **Global Administrator** (hoặc Application Administrator + Exchange Administrator) của Microsoft 365 công ty. Tổng thời gian khoảng 20 phút.

---

## Bước 1 – Kiểm tra hộp thư gửi
`hr@vioraliving.com.vn` phải là hộp thư thật trong Microsoft 365: tài khoản có license, hoặc **Shared mailbox** (miễn phí). Xem ở **Microsoft 365 admin center → Teams & groups → Shared mailboxes** hoặc **Users → Active users**.

## Bước 2 – Đăng ký ứng dụng trong Microsoft Entra
1. Vào https://entra.microsoft.com → **Applications → App registrations → New registration**.
2. Name: `Viora Website Mailer`. *Supported account types*: **Single tenant**. Không cần Redirect URI. Bấm **Register**.
3. Ở trang **Overview**, chép lại 3 giá trị:
   - **Application (client) ID** → biến `MS365_CLIENT_ID`
   - **Directory (tenant) ID** → biến `MS365_TENANT_ID`
   - Bấm vào link *Managed application in local directory* và chép **Object ID** của Enterprise application (dùng ở Bước 3).
4. **Certificates & secrets → Client secrets → New client secret**. Description `vercel`, Expires **24 months**. Chép ngay cột **Value** → biến `MS365_CLIENT_SECRET` (chỉ hiện 1 lần).
   📅 Đặt lịch nhắc gia hạn trước ngày hết hạn. Khi secret hết hạn, email sẽ ngừng gửi.

> ⚠️ **Không** thêm quyền *Mail.Send* trong mục *API permissions* của Entra. Quyền đó cho phép gửi thư dưới tên **bất kỳ ai** trong công ty. Bước 3 sẽ cấp quyền chỉ cho riêng hộp thư `hr@`.

## Bước 3 – Chỉ cho phép ứng dụng gửi thư từ `hr@`
Mở **PowerShell** trên máy Windows (chạy *Run as administrator*) và chạy lần lượt từng lệnh. Thay `<CLIENT_ID>` và `<OBJECT_ID>` bằng giá trị đã chép ở Bước 2:

```powershell
Install-Module ExchangeOnlineManagement -Scope CurrentUser   # chỉ cần lần đầu
Connect-ExchangeOnline                                       # đăng nhập tài khoản admin

New-ServicePrincipal -AppId <CLIENT_ID> -ObjectId <OBJECT_ID> -DisplayName "Viora Website Mailer"

New-ManagementScope -Name "Viora HR Mailbox" `
  -RecipientRestrictionFilter "PrimarySmtpAddress -eq 'hr@vioraliving.com.vn'"

New-ManagementRoleAssignment -App <CLIENT_ID> -Role "Application Mail.Send" `
  -CustomResourceScope "Viora HR Mailbox"

# Kiểm tra: dòng Mail.Send phải có InScope = True
Test-ServicePrincipalAuthorization -Identity <CLIENT_ID> -Resource hr@vioraliving.com.vn
```

Quyền mới có thể mất **30 phút đến 2 giờ** mới có hiệu lực.

## Bước 4 – Thêm biến môi trường trên Vercel
**Vercel → Project → Settings → Environment Variables**:

| Biến | Giá trị |
|---|---|
| `MS365_TENANT_ID` | Directory (tenant) ID |
| `MS365_CLIENT_ID` | Application (client) ID |
| `MS365_CLIENT_SECRET` | Client secret Value ⚠️ bí mật |
| `MAIL_FROM` | `hr@vioraliving.com.vn` |
| `HR_NOTIFY_TO` | Email nhận báo hồ sơ mới, vd `hr@vioraliving.com.vn,truongphong@vioraliving.com.vn`. Để trống nếu không muốn nhận |

Sau đó vào **Deployments → Redeploy**.

Nếu chưa điền 4 biến đầu, website vẫn nhận hồ sơ bình thường, chỉ không gửi email.

## Bước 5 – Thử
1. Mở website, nộp thử một hồ sơ, điền **email cá nhân của bạn**.
2. Sau vài giây sẽ nhận được email cảm ơn. Nhớ kiểm tra cả mục Spam/Quảng cáo.
3. Vào Supabase → **Table Editor → applications** và xem hồ sơ vừa nộp:
   - `candidate_notified_at` / `hr_notified_at` có thời gian nghĩa là đã gửi.
   - `notify_error` có nội dung nghĩa là gửi lỗi. Xem bảng lỗi thường gặp bên dưới. Cron chạy hằng ngày sẽ tự gửi lại các email lỗi trong 3 ngày gần nhất.

## Lỗi thường gặp

| `notify_error` chứa | Nguyên nhân / cách sửa |
|---|---|
| `invalid_client` / `AADSTS7000215` | Client secret sai hoặc đã hết hạn → tạo secret mới (Bước 2.4), cập nhật Vercel, Redeploy |
| `AADSTS700016` | Sai `MS365_CLIENT_ID` hoặc `MS365_TENANT_ID` |
| `sendMail 403` / `ErrorAccessDenied` | Chưa làm Bước 3, hoặc quyền chưa có hiệu lực (đợi tối đa 2 giờ) |
| `sendMail 404` / `MailboxNotEnabledForRESTAPI` | `MAIL_FROM` không phải hộp thư hợp lệ trong Microsoft 365 |

## Để email không vào Spam
Trong **Microsoft Defender → Email & collaboration → Policies → DKIM**, bật DKIM cho tên miền `vioraliving.com.vn`. Đồng thời kiểm tra bản ghi SPF/DMARC của tên miền đã có `include:spf.protection.outlook.com`.

## Sửa nội dung email
Nội dung nằm trong `lib/mail/templates.ts`:
- `candidateConfirmation`: email cảm ơn ứng viên
- `hrNotification`: email báo HR

Ảnh banner là `public/brand/email-banner-v3.jpg`, kích thước 1120×480.
