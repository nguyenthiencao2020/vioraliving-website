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
| `nhan-su/` | Mẫu văn bản nhân sự: hợp đồng, thư mời, quyết định, đơn từ, biên bản bàn giao… |
| `van-hanh/` | Mẫu vận hành viện dưỡng lão: hợp đồng dịch vụ với gia đình, phiếu tiếp nhận, biên bản sự cố, giấy xác nhận, thông báo nội bộ |
| `_cong-cu/` | `tao-mau-van-ban.js` tạo lại toàn bộ mẫu Word; `logo-letterhead.png` logo gốc, `header-bg.png` / `footer-bg.png` đầu – chân trang (vẽ bằng `tao-nen-tieu-de.py`) |

## Mẫu hiện có

| File | Mô tả |
|---|---|
| `nhan-su/Hop_dong_lao_dong_song_ngu_Viora.docx` | Hợp đồng lao động song ngữ Việt – Anh, giấy tiêu đề Viora, kèm Phụ lục 01 – Mô tả công việc |
| `nhan-su/Thu_moi_nhan_viec_song_ngu_Viora.docx` | Thư mời nhận việc song ngữ Việt – Anh, có phần xác nhận nhận việc của ứng viên |
| `nhan-su/Quyet_dinh_thoi_viec_song_ngu_Viora.docx` | Quyết định chấm dứt hợp đồng lao động (thôi việc) song ngữ: lý do (xin nghỉ / thỏa thuận / hết hạn / khác), bàn giao, thanh toán & chốt BHXH |
| `nhan-su/Thoa_thuan_dao_tao_Nhat_Ban_song_ngu_Viora.docx` | Thỏa thuận đào tạo tại Nhật Bản song ngữ: chi phí, cam kết làm việc, bồi hoàn (`…/TTĐT-VLS`) |
| `nhan-su/Cam_ket_bao_mat_thong_tin_song_ngu_Viora.docx` | Cam kết bảo mật thông tin người cao tuổi & công ty, song ngữ |
| `nhan-su/Hop_dong_dich_vu_cong_tac_song_ngu_Viora.docx` | Hợp đồng dịch vụ cộng tác viên (bán thời gian / theo ca), song ngữ (`…/HĐCT-VLS`) |
| `nhan-su/Quyet_dinh_tiep_nhan_nhan_su_Viora.docx` | Quyết định tiếp nhận nhân sự |
| `nhan-su/Quyet_dinh_bo_nhiem_Viora.docx` | Quyết định bổ nhiệm |
| `nhan-su/Bien_ban_ban_giao_Viora.docx` | Biên bản bàn giao công việc, tài sản, hồ sơ (`…/BB-VLS`) |
| `nhan-su/Thong_bao_ket_qua_thu_viec_Viora.docx` | Thông báo kết quả thử việc (`…/TB-VLS`) |
| `nhan-su/Phu_luc_hop_dong_lao_dong_Viora.docx` | Phụ lục hợp đồng lao động – thay đổi lương, chức danh… (`…/PLHĐ-VLS`) |
| `nhan-su/Don_xin_nghi_phep_Viora.docx` · `Don_xin_nghi_viec_Viora.docx` | Đơn xin nghỉ phép / đơn xin nghỉ việc |
| `van-hanh/Hop_dong_dich_vu_cham_soc_Viora.docx` | Hợp đồng dịch vụ chăm sóc người cao tuổi với gia đình + Phụ lục bảng giá (`…/HĐDV-VLS`) |
| `van-hanh/Phieu_tiep_nhan_danh_gia_ban_dau_Viora.docx` | Phiếu tiếp nhận – đánh giá ban đầu người cao tuổi |
| `van-hanh/Bien_ban_su_co_Viora.docx` | Biên bản ghi nhận sự cố (té ngã, sức khỏe, tài sản…) (`…/BBSC-VLS`) |
| `van-hanh/Giay_xac_nhan_cong_tac_song_ngu_Viora.docx` | Giấy xác nhận công tác song ngữ (`…/XN-VLS`) |
| `van-hanh/Thong_bao_noi_bo_Viora.docx` | Thông báo nội bộ |
| `van-ban-chung/Giay_tieu_de_Viora.docx` | **Giấy tiêu đề trắng** – soạn bất kỳ văn bản nào trên nền logo, thông tin công ty, chân trang hotline |
| `van-ban-chung/Mau_cong_van_Viora.docx` | Mẫu **công văn**: Số …/CV-VLS, Quốc hiệu, V/v, Kính gửi, nội dung, Nơi nhận, Giám đốc ký |
| `van-ban-chung/Mau_quyet_dinh_Viora.docx` | Mẫu **quyết định** chung: Số …/QĐ-VLS, Căn cứ, QUYẾT ĐỊNH, Điều 1–3, Nơi nhận, Giám đốc ký |

Ký hiệu số văn bản đang dùng: `…/HĐLĐ-VLS` (hợp đồng lao động), `…/TMNV-VLS` (thư mời nhận việc), `…/QĐ-VLS` (quyết định), `…/CV-VLS` (công văn), `…/TTĐT-VLS`, `…/HĐCT-VLS`, `…/BB-VLS`, `…/TB-VLS`, `…/PLHĐ-VLS`, `…/HĐDV-VLS`, `…/BBSC-VLS`, `…/XN-VLS`.

Cách dùng: tải file về → mở bằng Word → điền các chỗ `[ ... ]` → in, ký, đóng dấu.
Mỗi lần dùng nên **lưu thành bản mới** (vd. `HDLD_NguyenVanA_2026.docx`) ở máy / OneDrive của Phòng Nhân sự,
**không tải hợp đồng đã điền thông tin cá nhân lên GitHub**.
