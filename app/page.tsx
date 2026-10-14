import Link from 'next/link';
import { getActiveJobs, type Job } from '@/lib/jobs';
import { SITE_URL } from '@/lib/constants';
import ApplyForm from './ApplyForm';
import JobApplyButton from './JobApplyButton';

// Đọc lại danh sách vị trí từ Supabase tối đa 5 phút/lần
export const revalidate = 300;

const HR_EMAIL = 'hr@vioraliving.com.vn';

const EMPLOYMENT_LABEL: Record<Job['employment_type'], string> = {
  FULL_TIME: 'Toàn thời gian',
  PART_TIME: 'Bán thời gian',
  CONTRACT: 'Hợp đồng',
  INTERNSHIP: 'Thực tập',
};

function jobPostingJsonLd(job: Job) {
  const html = (title: string, items: string[]) =>
    items.length ? `<p><strong>${title}</strong></p><ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>` : '';
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description:
      (job.audience ? `<p>${job.audience}</p>` : '') +
      html('Mô tả công việc', job.responsibilities) +
      html('Yêu cầu', job.requirements),
    datePosted: job.date_posted,
    ...(job.valid_through ? { validThrough: job.valid_through } : {}),
    employmentType: job.employment_type,
    ...(job.quantity ? { totalJobOpenings: job.quantity } : {}),
    directApply: true,
    hiringOrganization: { '@type': 'Organization', name: 'Viora Living Saigon', sameAs: SITE_URL },
    jobLocation: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: 'Lái Thiêu', addressCountry: 'VN' },
    },
  };
}

export default async function Home() {
  const jobs = await getActiveJobs();

  return (
    <>
      {jobs.map(job => (
        <script
          key={job.slug}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd(job)).replace(/</g, '\\u003c') }}
        />
      ))}

      <header className="site-header">
        <div className="container">
          <Link href="/" className="logo">Viora Living <span>Saigon</span></Link>
          <nav className="nav">
            <a className="nav-link" href="#vi-tri">Vị trí tuyển dụng</a>
            <a className="nav-link" href="#quy-trinh">Quy trình</a>
            <a className="btn btn-primary btn-sm" href="#ung-tuyen">Ứng tuyển</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container">
            <div className="eyebrow">Tuyển dụng {new Date().getFullYear()}</div>
            <h1>Cùng Viora chăm sóc người cao tuổi bằng sự tận tâm</h1>
            <p className="lead">
              Viora Living Saigon – Cơ sở Lái Thiêu đang tìm kiếm Điều dưỡng và Nhân viên chăm sóc
              người cao tuổi (Caregiver). Bạn sẽ được đào tạo bài bản, bao gồm chương trình đào tạo tại Nhật Bản.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="#ung-tuyen">Nộp hồ sơ ngay</a>
              <a className="btn btn-outline" href="#vi-tri">Xem vị trí đang tuyển</a>
            </div>
            <div className="hero-tags">
              {jobs.map(j => (
                <span key={j.slug} className="tag">{j.title}{j.quantity ? ` · ${j.quantity} người` : ''}</span>
              ))}
              <span className="tag">📍 Lái Thiêu</span>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-head">
              <div className="eyebrow">Vì sao chọn Viora</div>
              <h2>Môi trường để bạn phát triển nghề chăm sóc</h2>
            </div>
            <div className="grid-3">
              <div className="card">
                <div className="icon-badge" aria-hidden>✈️</div>
                <h3>Đào tạo tại Nhật Bản</h3>
                <p className="muted">Tham gia chương trình đào tạo kỹ năng chăm sóc người cao tuổi tại Nhật Bản.</p>
              </div>
              <div className="card">
                <div className="icon-badge" aria-hidden>🤝</div>
                <h3>Đồng nghiệp tận tâm</h3>
                <p className="muted">Làm việc cùng đội ngũ điều dưỡng, caregiver và bác sĩ theo quy trình chuyên môn rõ ràng.</p>
              </div>
              <div className="card">
                <div className="icon-badge" aria-hidden>🌱</div>
                <h3>Phù hợp người mới</h3>
                <p className="muted">Chào đón tân cử nhân Điều dưỡng và người chưa có kinh nghiệm, có hướng dẫn từ đầu.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-alt" id="vi-tri">
          <div className="container">
            <div className="section-head">
              <div className="eyebrow">Vị trí đang tuyển</div>
              <h2>Chọn vị trí phù hợp với bạn</h2>
            </div>
            {jobs.length === 0 ? (
              <p className="muted">
                Hiện chưa có vị trí đang mở. Bạn có thể gửi CV về <a href={`mailto:${HR_EMAIL}`}>{HR_EMAIL}</a>.
              </p>
            ) : (
              <div className="jobs">
                {jobs.map(job => (
                  <article key={job.slug} className="card job">
                    <h3>{job.title}</h3>
                    <div className="job-meta">
                      <span className="pill">{EMPLOYMENT_LABEL[job.employment_type]}</span>
                      {job.quantity && <span className="pill pill-accent">Số lượng: {job.quantity}</span>}
                      {job.audience && <span className="pill">{job.audience}</span>}
                    </div>
                    {job.responsibilities.length > 0 && (
                      <>
                        <h4>Mô tả công việc</h4>
                        <ul>{job.responsibilities.map(r => <li key={r}>{r}</li>)}</ul>
                      </>
                    )}
                    {job.requirements.length > 0 && (
                      <>
                        <h4>Yêu cầu</h4>
                        <ul>{job.requirements.map(r => <li key={r}>{r}</li>)}</ul>
                      </>
                    )}
                    <p className="muted" style={{ marginTop: 16, fontSize: '0.9rem' }}>📍 {job.location}</p>
                    <div className="job-actions">
                      <JobApplyButton slug={job.slug} />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="section" id="quy-trinh">
          <div className="container">
            <div className="section-head">
              <div className="eyebrow">Quy trình</div>
              <h2>Ứng tuyển đơn giản trong 4 bước</h2>
            </div>
            <ol className="steps">
              <li><strong>Nộp hồ sơ</strong><span className="muted">Điền form và đính kèm CV ngay trên trang này.</span></li>
              <li><strong>HR liên hệ</strong><span className="muted">Phòng Nhân sự gọi điện xác nhận thông tin.</span></li>
              <li><strong>Phỏng vấn</strong><span className="muted">Trao đổi trực tiếp tại cơ sở Lái Thiêu.</span></li>
              <li><strong>Nhận việc</strong><span className="muted">Ký hợp đồng và bắt đầu đào tạo.</span></li>
            </ol>
          </div>
        </section>

        {jobs.length > 0 && (
          <section className="section section-alt" id="ung-tuyen">
            <div className="container">
              <div className="section-head">
                <div className="eyebrow">Ứng tuyển</div>
                <h2>Gửi hồ sơ của bạn</h2>
                <p className="muted">Các mục có dấu <span className="req">*</span> là bắt buộc.</p>
              </div>
              <ApplyForm jobs={jobs.map(j => ({ slug: j.slug, title: j.title }))} />
            </div>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <strong>Viora Living Saigon</strong>
            <div>Cơ sở Lái Thiêu</div>
          </div>
          <div>
            Phòng Nhân sự: <a href={`mailto:${HR_EMAIL}`}>{HR_EMAIL}</a>
            <div><Link href="/chinh-sach-bao-mat">Chính sách bảo vệ dữ liệu cá nhân</Link></div>
          </div>
        </div>
      </footer>
    </>
  );
}
