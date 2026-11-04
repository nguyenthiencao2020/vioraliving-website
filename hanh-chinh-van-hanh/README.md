# Hành chính – Vận hành · Viora Living Saigon

Thư mục này chứa **văn bản hành chính, nhân sự và tài liệu vận hành** của Viora Living Saigon.
Nó **tách biệt hoàn toàn với website tuyển dụng** (code website nằm ở `app/`, `lib/`, `public/`…):
sửa file trong thư mục này **không làm website deploy lại** và không ảnh hưởng website.

- Sửa mẫu: chỉnh `_cong-cu/tao-mau-van-ban.js` rồi chạy `node hanh-chinh-van-hanh/_cong-cu/tao-mau-van-ban.js`.
- Nhật ký thay đổi của thư mục này: [`NHAT_KY.md`](NHAT_KY.md) (riêng, không ghi chung với `VERSIONS.md` của website).

## Thông tin pháp nhân (theo Giấy chứng nhận đăng ký doanh nghiệp)

| | |
|---|---|
| Tên tiếng Việt | CÔNG TY CỔ PHẦN VIORA LIVING SAIGON |
| Tên tiếng Anh | VIORA LIVING SAIGON CORPORATION |
| Tên viết tắt | VIORA LIVING |
| Mã số doanh nghiệp | 3703493386 (đăng ký lần đầu 03/07/2026) |
| Trụ sở chính | A147F Khu phố Bình Đức 2, Phường Lái Thiêu, TP. Hồ Chí Minh, Việt Nam |
| **Hotline công ty** | **0868 120 165** · contact@vioraliving.com.vn (dùng trên giấy tiêu đề, văn bản công ty) |
| Người đại diện theo pháp luật | Ông Nguyễn Thế Vũ – Giám đốc |
| Số tuyển dụng (HR) | 0708 2999 07 · hr@vioraliving.com.vn (chỉ dùng cho tuyển dụng / liên hệ Phòng Nhân sự) |

## Cấu trúc

| Thư mục | Nội dung |
|---|---|
| `van-ban-chung/` | Giấy tiêu đề trắng, mẫu Công văn, mẫu Quyết định (dùng cho mọi văn bản công ty) |
| `nhan-su/` | Mẫu văn bản nhân sự: Hợp đồng lao động, Thư mời nhận việc, Quyết định thôi việc… |
| `_cong-cu/` | `tao-mau-van-ban.js` tạo lại toàn bộ mẫu Word; `logo-letterhead.png` logo gốc cho giấy tiêu đề |

## Mẫu hiện có

| File | Mô tả |
|---|---|
| `nhan-su/Hop_dong_lao_dong_song_ngu_Viora.docx` | Hợp đồng lao động song ngữ Việt – Anh, giấy tiêu đề Viora, kèm Phụ lục 01 – Mô tả công việc |
| `nhan-su/Thu_moi_nhan_viec_song_ngu_Viora.docx` | Thư mời nhận việc song ngữ Việt – Anh, có phần xác nhận nhận việc của ứng viên |
| `nhan-su/Quyet_dinh_thoi_viec_song_ngu_Viora.docx` | Quyết định chấm dứt hợp đồng lao động (thôi việc) song ngữ: lý do (xin nghỉ / thỏa thuận / hết hạn / khác), bàn giao, thanh toán & chốt BHXH |
| `van-ban-chung/Giay_tieu_de_Viora.docx` | **Giấy tiêu đề trắng** – soạn bất kỳ văn bản nào trên nền logo, thông tin công ty, chân trang hotline |
| `van-ban-chung/Mau_cong_van_Viora.docx` | Mẫu **công văn**: Số …/CV-VLS, Quốc hiệu, V/v, Kính gửi, nội dung, Nơi nhận, Giám đốc ký |
| `van-ban-chung/Mau_quyet_dinh_Viora.docx` | Mẫu **quyết định** chung: Số …/QĐ-VLS, Căn cứ, QUYẾT ĐỊNH, Điều 1–3, Nơi nhận, Giám đốc ký |

Ký hiệu số văn bản đang dùng: `…/HĐLĐ-VLS` (hợp đồng lao động), `…/TMNV-VLS` (thư mời nhận việc), `…/QĐ-VLS` (quyết định), `…/CV-VLS` (công văn).

Cách dùng: tải file về → mở bằng Word → điền các chỗ `[ ... ]` → in, ký, đóng dấu.
Mỗi lần dùng nên **lưu thành bản mới** (vd. `HDLD_NguyenVanA_2026.docx`) ở máy / OneDrive của Phòng Nhân sự,
**không tải hợp đồng đã điền thông tin cá nhân lên GitHub**.
