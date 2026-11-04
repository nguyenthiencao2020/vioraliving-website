# Nhật ký – Hành chính · Vận hành

Ghi lại các thay đổi trong thư mục `hanh-chinh-van-hanh/` (tách riêng với `VERSIONS.md` của website).

| Ngày | Nội dung | Ghi chú |
|---|---|---|
| 04/11/2026 | Tạo thư mục `hanh-chinh-van-hanh/`. Thêm mẫu **Hợp đồng lao động** và **Thư mời nhận việc** song ngữ Việt – Anh, giấy tiêu đề Viora, điền thông tin pháp nhân theo Giấy CN ĐKDN (MSDN 3703493386). | Cần pháp chế / HR rà soát trước khi dùng chính thức |
| 04/11/2026 | Thiết kế lại 2 mẫu: giấy tiêu đề gọn (logo + tên công ty, MSDN, địa chỉ, vạch vàng), chân trang 1 dòng (**hotline công ty 0868 120 165**, contact@, số trang); nội dung xếp Việt trên – Anh dưới, tiêu đề Điều có thanh màu, dòng điền có chấm dẫn; thư mời có bảng điều kiện và ô xác nhận nhận việc. | 0868 120 165 = hotline công ty; 0708 2999 07 = số tuyển dụng của HR |
| 04/11/2026 | Giấy tiêu đề dùng **logo gốc** (biểu tượng hoa sen + chữ VIORA LIVING SAIGON), file `_cong-cu/logo-letterhead.png`. | |
| 04/11/2026 | Thêm **Quyết định thôi việc** song ngữ (`nhan-su/`). Thêm thư mục `van-ban-chung/`: **giấy tiêu đề trắng**, **mẫu công văn**, **mẫu quyết định** chung. Script đổi tên `_cong-cu/tao-mau-van-ban.js`. | Quyết định thôi việc cần HR/pháp chế rà soát theo từng trường hợp |
| 04/11/2026 | Thiết kế lại **giấy tiêu đề**: dải nền tràn trang (kem → bạc hà, hoa sen chìm, viền xanh ngọc + chỉ vàng) với logo gốc và thông tin công ty; **chân trang** dải xanh ngọc chữ trắng, số trang trong ô kem. Áp dụng cho mọi mẫu. | Ảnh nền: `_cong-cu/header-bg.png`, `_cong-cu/footer-bg.png` |
| 04/11/2026 | Thêm 15 mẫu: nhân sự (thỏa thuận đào tạo Nhật Bản, cam kết bảo mật, HĐ cộng tác viên, QĐ tiếp nhận, QĐ bổ nhiệm, biên bản bàn giao, thông báo thử việc, phụ lục HĐLĐ, đơn nghỉ phép, đơn nghỉ việc) và thư mục `van-hanh/` (HĐ dịch vụ chăm sóc, phiếu tiếp nhận – đánh giá, biên bản sự cố, giấy xác nhận công tác, thông báo nội bộ). | Thỏa thuận đào tạo, HĐ dịch vụ, HĐ cộng tác viên cần pháp chế rà soát |
| 04/11/2026 | Thiết kế lại **header/footer cho in ấn**: sóng xanh ngọc đậm + chỉ vàng, chữ logo đổi xanh đậm, thông tin công ty màu đậm; chân trang dải xanh đậm, icon vàng, chữ trắng; số trang chuyển lên trên dải màu. Toàn bộ header/footer vẽ sẵn ở 300 dpi bằng `_cong-cu/tao-nen-tieu-de.py`. | Khắc phục màu nhạt, mờ khi in |
| 04/11/2026 | Vẽ lại hoa văn header/footer **mềm mại, mượt hơn**: dải xanh dùng đường cong Bézier liền mạch, chỉ vàng mảnh thon dần; sóng chân trang uốn nhẹ. Sửa cỡ chữ số trang cho đều. | |
| 04/11/2026 | **Chữ đầu/chân trang in nét**: tên công ty, MSDN, địa chỉ, hotline, email, website chuyển từ ảnh sang chữ Word thật; logo dùng bản 600 dpi cắt từ logo gốc (`ref/Logo`). Ảnh nền chỉ còn hoa văn + icon. | Muốn sửa thông tin công ty: sửa `CO` trong `tao-mau-van-ban.js` |
| 04/11/2026 | Logo trên giấy tiêu đề giữ **đúng màu gốc** (xanh ngọc + vàng) từ file `ref/Logo`, không đổi màu. | |
| 04/11/2026 | Logo đầu trang ghép đúng bộ nhận diện: hoa sen sát cạnh chữ VIORA LIVING / SAIGON, bỏ vạch vàng ngăn giữa. | |
| 04/11/2026 | Sửa lỗi **logo không hiện ở header** khi mở bằng Word/trình xem khác (2 ảnh nổi trùng ID): logo ghép thẳng vào ảnh nền đầu trang 600 dpi, header chỉ còn 1 ảnh. | |
| 04/11/2026 | QA ngắt trang: **chữ ký không còn bị đẩy sang trang 2** – khối chữ ký luôn dính với đoạn cuối (keep with next) ở mọi mẫu; QĐ tiếp nhận / bổ nhiệm làm gọn, dư ≥ 2,4 cm; vùng soạn thảo dưới nới thêm 0,5 cm; tiêu đề gọn hơn. | |
