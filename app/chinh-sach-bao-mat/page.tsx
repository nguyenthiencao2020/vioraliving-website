import type { Metadata } from 'next';
import Link from 'next/link';
import { CONSENT_VERSION } from '@/lib/constants';
import Icon from '../components/Icon';

export const metadata: Metadata = {
  title: 'Chính sách bảo vệ dữ liệu cá nhân',
  description: 'Cách Viora Living Saigon thu thập, sử dụng và bảo vệ dữ liệu cá nhân của ứng viên.',
};

const HR_EMAIL = 'hr@vioraliving.com.vn';

// ⚠️ Mỗi khi sửa nội dung trang này, tăng CONSENT_VERSION trong lib/constants.ts
export default function PrivacyPage() {
  return (
    <>
      <header className="site-header">
        <div className="container">
          <Link href="/" className="logo"><span className="logo-mark" aria-hidden><Icon name="heart" size={18} /></span><span>Viora Living <em>Saigon</em></span></Link>
          <nav className="nav"><Link className="btn btn-outline btn-sm" href="/#ung-tuyen">Quay lại ứng tuyển</Link></nav>
        </div>
      </header>
      <main className="section">
        <article className="container prose">
          <h1>Chính sách bảo vệ dữ liệu cá nhân của ứng viên</h1>
          <p className="muted">Phiên bản {CONSENT_VERSION} · Áp dụng cho hồ sơ nộp qua website tuyển dụng của Viora Living Saigon.</p>

          <h2>1. Bên kiểm soát và xử lý dữ liệu</h2>
          <p>
            Viora Living Saigon (“Viora”, “chúng tôi”) chịu trách nhiệm đối với dữ liệu cá nhân bạn cung cấp khi ứng tuyển.
            Liên hệ về dữ liệu cá nhân: <a href={`mailto:${HR_EMAIL}`}>{HR_EMAIL}</a>.
          </p>

          <h2>2. Dữ liệu chúng tôi thu thập</h2>
          <ul>
            <li>Họ tên, số điện thoại, email, năm sinh, nơi sinh / nguyên quán.</li>
            <li>Trình độ học vấn, trường tốt nghiệp, lời nhắn và nội dung CV / hồ sơ bạn gửi kèm.</li>
            <li>Vị trí ứng tuyển, nguồn biết đến tin tuyển dụng, thông tin chiến dịch quảng cáo (UTM) nếu có.</li>
            <li>Mã băm một chiều của địa chỉ IP để chống gửi hồ sơ rác. Chúng tôi không lưu địa chỉ IP gốc.</li>
          </ul>

          <h2>3. Mục đích xử lý</h2>
          <ul>
            <li>Đánh giá hồ sơ, liên hệ, sắp xếp phỏng vấn và thông báo kết quả tuyển dụng.</li>
            <li>Liên hệ lại với bạn khi có vị trí phù hợp khác trong thời gian lưu trữ hồ sơ.</li>
          </ul>
          <p>Chúng tôi không bán dữ liệu của bạn và không sử dụng cho mục đích quảng cáo.</p>

          <h2>4. Nơi lưu trữ và bảo mật</h2>
          <p>
            Dữ liệu được lưu trên hạ tầng của nhà cung cấp dịch vụ đám mây Supabase (máy chủ đặt tại Singapore) và website vận hành trên Vercel.
            CV được lưu trong kho riêng tư, chỉ nhân viên Phòng Nhân sự được cấp quyền mới truy cập được. Mọi thay đổi trạng thái hồ sơ đều được ghi lại.
          </p>

          <h2>5. Thời gian lưu trữ</h2>
          <p>
            Hồ sơ được lưu tối đa 12 tháng kể từ ngày nộp, hoặc đến khi bạn yêu cầu xóa, tùy điều kiện nào đến trước.
            Hồ sơ của ứng viên được tuyển dụng sẽ chuyển sang lưu trữ theo hồ sơ nhân sự.
          </p>

          <h2>6. Quyền của bạn</h2>
          <p>Theo pháp luật Việt Nam về bảo vệ dữ liệu cá nhân, bạn có quyền:</p>
          <ul>
            <li>Được biết, truy cập và yêu cầu chỉnh sửa dữ liệu của mình.</li>
            <li>Rút lại sự đồng ý và yêu cầu xóa dữ liệu. Việc rút lại không ảnh hưởng tới các xử lý đã thực hiện trước đó.</li>
            <li>Khiếu nại, tố cáo theo quy định của pháp luật.</li>
          </ul>
          <p>
            Để thực hiện các quyền trên, vui lòng gửi email tới <a href={`mailto:${HR_EMAIL}`}>{HR_EMAIL}</a> kèm họ tên và số điện thoại đã dùng khi nộp hồ sơ.
          </p>

          <h2>7. Sự đồng ý</h2>
          <p>
            Khi đánh dấu ô đồng ý trên form ứng tuyển, bạn xác nhận đã đọc và đồng ý với chính sách này.
            Chúng tôi lưu thời điểm và phiên bản chính sách bạn đã đồng ý.
          </p>
        </article>
      </main>
    </>
  );
}
