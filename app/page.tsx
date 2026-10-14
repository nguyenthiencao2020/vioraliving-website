import Image from 'next/image';
import Link from 'next/link';
import { getActiveJobs, type Job } from '@/lib/jobs';
import { SITE_URL } from '@/lib/constants';
import ApplyForm from './ApplyForm';
import Icon, { type IconName } from './components/Icon';
import HeroIllustration from './components/HeroIllustration';
import JobApplyButton from './JobApplyButton';

// Đọc lại danh sách vị trí từ Supabase tối đa 5 phút/lần
export const revalidate = 300;

const HR_EMAIL = 'hr@vioraliving.com.vn';

// Ảnh hero trong public/images/. Đặt null để dùng hình minh họa SVG.
const HERO_PHOTO: string | null = '/images/hero.webp';

const JOB_ICON: Record<string, IconName> = { 'dieu-duong': 'stethoscope', caregiver: 'hand' };

const BENEFITS: { icon: IconName; title: string; text: string; tone: string }[] = [
  { icon: 'plane', title: 'Đào tạo tại Nhật Bản', text: 'Tham gia chương trình đào tạo kỹ năng chăm sóc người cao tuổi tại Nhật Bản.', tone: 'teal' },
  { icon: 'users', title: 'Đồng nghiệp tận tâm', text: 'Làm việc cùng đội ngũ điều dưỡng, caregiver và bác sĩ theo quy trình chuyên môn rõ ràng.', tone: 'clay' },
  { icon: 'sprout', title: 'Phù hợp người mới', text: 'Chào đón tân cử nhân Điều dưỡng và người chưa có kinh nghiệm, có hướng dẫn từ đầu.', tone: 'sage' },
];

const STEPS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'file', title: 'Nộp hồ sơ', text: 'Điền form và đính kèm CV ngay trên trang này.' },
  { icon: 'phone', title: 'HR liên hệ', text: 'Phòng Nhân sự gọi điện xác nhận thông tin.' },
  { icon: 'chat', title: 'Phỏng vấn', text: 'Trao đổi trực tiếp tại cơ sở Lái Thiêu.' },
  { icon: 'checkCircle', title: 'Nhận việc', text: 'Ký hợp đồng và bắt đầu đào tạo.' },
];

const FAQ = [
  { q: 'Chưa có kinh nghiệm có ứng tuyển được không?', a: 'Được. Viora chào đón tân cử nhân Điều dưỡng và người mới vào nghề chăm sóc; bạn sẽ được hướng dẫn và đào tạo từ đầu.' },
  { q: 'Không có CV đánh máy thì sao?', a: 'Bạn có thể chụp ảnh hồ sơ viết tay hoặc giấy tờ liên quan bằng điện thoại (JPG, PNG) và tải lên, tối đa 5MB.' },
  { q: 'Thông tin của tôi có được bảo mật không?', a: 'Hồ sơ được lưu trong kho riêng tư, chỉ Phòng Nhân sự được truy cập và chỉ dùng cho mục đích tuyển dụng.' },
];

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
          <Link href="/" className="logo">
            <span className="logo-mark" aria-hidden><Icon name="heart" size={18} /></span>
            <span>Viora Living <em>Saigon</em></span>
          </Link>
          <nav className="nav">
            <a className="nav-link" href="#vi-tri">Vị trí</a>
            <a className="nav-link" href="#quy-trinh">Quy trình</a>
            <a className="nav-link" href="#hoi-dap">Hỏi đáp</a>
            <a className="btn btn-primary btn-sm" href="#ung-tuyen">Ứng tuyển</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-bg" aria-hidden>
            <div className="blob blob-1" />
            <div className="blob blob-2" />
          </div>
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="badge-live"><span className="dot" aria-hidden />Đang tuyển {new Date().getFullYear()}</div>
              <h1>
                Cùng Viora chăm sóc người cao tuổi <span className="hl">bằng sự tận tâm</span>
              </h1>
              <p className="lead">
                Viora Living Saigon – Cơ sở Lái Thiêu đang tìm kiếm Điều dưỡng và Nhân viên chăm sóc
                người cao tuổi (Caregiver). Bạn sẽ được đào tạo bài bản, bao gồm chương trình đào tạo tại Nhật Bản.
              </p>
              <div className="hero-actions">
                <a className="btn btn-primary btn-lg" href="#ung-tuyen">Nộp hồ sơ ngay <Icon name="arrow" size={18} /></a>
                <a className="btn btn-ghost btn-lg" href="#vi-tri">Xem vị trí</a>
              </div>
              <ul className="hero-checks">
                <li><Icon name="check" size={18} />Nộp online trong 3 phút</li>
                <li><Icon name="check" size={18} />Nhận CV chụp bằng điện thoại</li>
              </ul>
            </div>
            <div className={`hero-visual ${HERO_PHOTO ? 'has-photo' : ''}`}>
              {HERO_PHOTO
                ? (
                  <Image
                    src={HERO_PHOTO} alt="Điều dưỡng trò chuyện và nắm tay người cao tuổi"
                    width={1536} height={1024} priority className="hero-photo"
                    sizes="(max-width: 900px) 100vw, 540px"
                  />
                )
                : <HeroIllustration />}
              <div className="float-card fc-1">
                <span className="fc-icon teal"><Icon name="plane" size={20} /></span>
                <div><b>Đào tạo</b><small>tại Nhật Bản</small></div>
              </div>
              {jobs.length > 0 && (
                <div className="float-card fc-2">
                  <span className="fc-icon clay"><Icon name="briefcase" size={20} /></span>
                  <div><b>{jobs.length} vị trí</b><small>đang mở tuyển</small></div>
                </div>
              )}
              </div>
          </div>
        </section>

        <section className="facts" aria-label="Thông tin nhanh">
          <div className="container">
            <div className="facts-grid">
              <div className="fact"><Icon name="briefcase" /><div><b>{jobs.length || '—'} vị trí</b><span>đang tuyển</span></div></div>
              <div className="fact"><Icon name="clock" /><div><b>Toàn thời gian</b><span>làm việc theo ca</span></div></div>
              <div className="fact"><Icon name="graduation" /><div><b>Đào tạo bài bản</b><span>có chương trình tại Nhật</span></div></div>
              <div className="fact"><Icon name="pin" /><div><b>Lái Thiêu</b><span>Viora Living Saigon</span></div></div>
          </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-head center">
              <div className="eyebrow">Vì sao chọn Viora</div>
              <h2>Môi trường để bạn phát triển nghề chăm sóc</h2>
            </div>
            <div className="grid-3">
              {BENEFITS.map(b => (
                <div key={b.title} className={`card benefit tone-${b.tone}`}>
                  <div className="icon-badge"><Icon name={b.icon} size={26} /></div>
                  <h3>{b.title}</h3>
                  <p className="muted">{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-alt" id="vi-tri">
          <div className="container">
            <div className="section-head center">
              <div className="eyebrow">Vị trí đang tuyển</div>
              <h2>Chọn vị trí phù hợp với bạn</h2>
            </div>
            {jobs.length === 0 ? (
              <p className="muted center">
                Hiện chưa có vị trí đang mở. Bạn có thể gửi CV về <a href={`mailto:${HR_EMAIL}`}>{HR_EMAIL}</a>.
              </p>
            ) : (
              <div className="jobs">
                {jobs.map((job, i) => (
                  <article key={job.slug} className={`job-card ${i % 2 ? 'alt' : ''}`}>
                    <div className="job-top">
                      <span className="job-icon"><Icon name={JOB_ICON[job.slug] ?? 'briefcase'} size={28} /></span>
                      <div>
                        <h3>{job.title}</h3>
                        <div className="job-meta">
                          <span className="pill-light">{EMPLOYMENT_LABEL[job.employment_type]}</span>
                          {job.quantity && <span className="pill-light">Số lượng: {job.quantity}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="job-body">
                      {job.audience && <p className="job-audience"><Icon name="sprout" size={18} />{job.audience}</p>}
                      {job.responsibilities.length > 0 && (
                        <>
                          <h4>Mô tả công việc</h4>
                          <ul className="check-list">{job.responsibilities.map(r => <li key={r}><Icon name="check" size={16} />{r}</li>)}</ul>
                        </>
                      )}
                      {job.requirements.length > 0 && (
                        <>
                          <h4>Yêu cầu</h4>
                          <ul className="check-list">{job.requirements.map(r => <li key={r}><Icon name="check" size={16} />{r}</li>)}</ul>
                        </>
                      )}
                      <div className="job-foot">
                        <span className="muted"><Icon name="pin" size={16} /> {job.location}</span>
                        <JobApplyButton slug={job.slug} />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="section" id="quy-trinh">
          <div className="container">
            <div className="section-head center">
              <div className="eyebrow">Quy trình</div>
              <h2>Ứng tuyển đơn giản trong 4 bước</h2>
            </div>
            <ol className="timeline-steps">
              {STEPS.map((s, i) => (
                <li key={s.title}>
                  <div className="step-icon"><Icon name={s.icon} size={26} /><span className="step-num">{i + 1}</span></div>
                  <strong>{s.title}</strong>
                  <span className="muted">{s.text}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {jobs.length > 0 && (
          <section className="section section-apply" id="ung-tuyen">
            <div className="container apply-grid">
              <aside className="apply-aside">
                <div className="eyebrow light">Ứng tuyển</div>
                <h2>Gửi hồ sơ của bạn</h2>
                <p>Chỉ mất khoảng 3 phút. Phòng Nhân sự sẽ liên hệ lại qua số điện thoại bạn cung cấp.</p>
                <ul className="aside-list">
                  <li><Icon name="file" size={20} /><span><b>Chuẩn bị CV</b>PDF, Word hoặc ảnh chụp, tối đa 5MB</span></li>
                  <li><Icon name="phone" size={20} /><span><b>Số điện thoại</b>để HR liên hệ hẹn phỏng vấn</span></li>
                  <li><Icon name="shield" size={20} /><span><b>Bảo mật</b>hồ sơ chỉ Phòng Nhân sự xem được</span></li>
                </ul>
                <div className="aside-contact">
                  <Icon name="mail" size={18} /> Cần hỗ trợ? <a href={`mailto:${HR_EMAIL}`}>{HR_EMAIL}</a>
                </div>
              </aside>
              <ApplyForm jobs={jobs.map(j => ({ slug: j.slug, title: j.title }))} />
            </div>
          </section>
        )}

        <section className="section" id="hoi-dap">
          <div className="container faq-wrap">
            <div className="section-head center">
              <div className="eyebrow">Hỏi đáp</div>
              <h2>Câu hỏi thường gặp</h2>
            </div>
            <div className="faq">
              {FAQ.map(f => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p className="muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-band">
          <div className="container">
            <div className="cta-inner">
              <div>
                <h2>Sẵn sàng đồng hành cùng Viora?</h2>
                <p>Nộp hồ sơ hôm nay để bắt đầu hành trình chăm sóc người cao tuổi.</p>
              </div>
              <a className="btn btn-light btn-lg" href="#ung-tuyen">Ứng tuyển ngay <Icon name="arrow" size={18} /></a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <div className="logo light"><span className="logo-mark" aria-hidden><Icon name="heart" size={18} /></span><span>Viora Living <em>Saigon</em></span></div>
            <div className="footer-sub"><Icon name="pin" size={16} /> Cơ sở Lái Thiêu</div>
          </div>
          <div className="footer-links">
            <a href={`mailto:${HR_EMAIL}`}><Icon name="mail" size={16} /> {HR_EMAIL}</a>
            <Link href="/chinh-sach-bao-mat"><Icon name="shield" size={16} /> Chính sách bảo vệ dữ liệu cá nhân</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
