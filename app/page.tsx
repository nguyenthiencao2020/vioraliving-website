import Image from 'next/image';
import Link from 'next/link';
import { getActiveJobs, type Job } from '@/lib/jobs';
import { CONTACT, SITE_URL, WORK_TYPE_LABELS } from '@/lib/constants';
import { BENEFITS, INCOME, PROGRAMS } from '@/lib/programs';
import ApplyForm from './ApplyForm';
import Icon, { type IconName } from './components/Icon';
import HeroIllustration from './components/HeroIllustration';
import Reveal from './components/Reveal';
import ShareButtons from './components/ShareButtons';
import MobileApplyBar from './components/MobileApplyBar';
import ContactButtons from './components/ContactButtons';
import ZaloLink from './components/ZaloLink';
import ProgramTabs, { ProgramLink } from './components/ProgramTabs';
import JobApplyButton from './JobApplyButton';

// Đọc lại danh sách vị trí từ Supabase tối đa 5 phút/lần
export const revalidate = 300;

// Ảnh hero trong public/images/. Đặt null để dùng hình minh họa SVG.
const HERO_PHOTO: string | null = '/images/hero.webp';

const JOB_ICON: Record<string, IconName> = {
  'tan-sinh-vien-dieu-duong': 'stethoscope',
  'tan-sinh-vien-caregiver': 'hand',
  'dieu-duong': 'stethoscope',
  'nhan-vien-cham-soc': 'hand',
  'vat-ly-tri-lieu': 'sprout',
};

const WHY_VIORA: { icon: IconName; title: string; text: string; tone: string }[] = [
  { icon: 'plane', title: 'Đào tạo tại Nhật Bản', text: 'Cả 2 chương trình đều được đào tạo chuyên môn về chăm sóc người cao tuổi tại Nhật Bản.', tone: 'teal' },
  { icon: 'shield', title: 'Phúc lợi đầy đủ', text: 'BHXH, BHYT, BHTN và các chế độ phúc lợi đầy đủ. Thu nhập cạnh tranh theo năng lực.', tone: 'clay' },
  { icon: 'graduation', title: 'Lộ trình phát triển', text: 'Cơ hội nâng cao tay nghề và phát triển lên vị trí quản lý khi gắn bó lâu dài.', tone: 'sage' },
  { icon: 'users', title: 'Môi trường thân thiện', text: 'Làm việc trong môi trường chuyên nghiệp, thân thiện, nhiều cơ hội nâng cao tay nghề.', tone: 'teal' },
];

const STEPS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'file', title: 'Chọn vị trí & nộp hồ sơ', text: 'Bấm chọn vị trí, điền thông tin và đính kèm CV.' },
  { icon: 'phone', title: 'HR liên hệ', text: 'Phòng Nhân sự gọi điện xác nhận thông tin.' },
  { icon: 'chat', title: 'Phỏng vấn', text: 'Trao đổi trực tiếp tại cơ sở Lái Thiêu.' },
  { icon: 'checkCircle', title: 'Nhận việc', text: 'Ký hợp đồng và bắt đầu đào tạo.' },
];

const FAQ = [
  { q: '2 chương trình khác nhau thế nào?', a: 'Chính sách và quyền lợi của 2 chương trình như nhau. Chỉ khác đối tượng: Chương trình Tân sinh viên dành cho bạn mới tốt nghiệp (Điều dưỡng ưu tiên mới ra trường, Caregiver ưu tiên tốt nghiệp THPT); Tuyển dụng chung dành cho mọi ứng viên (Điều dưỡng, Nhân viên chăm sóc người cao tuổi, Kỹ thuật viên Vật lý trị liệu).' },
  { q: 'Đào tạo tại Nhật Bản có tốn chi phí không?', a: 'Không. Cả 2 chương trình đều được đào tạo chuyên môn tại Nhật Bản; chi phí ăn ở, đi lại do Viora Living Saigon chi trả.' },
  { q: 'Tôi muốn làm Part-time được không?', a: 'Được. Các vị trí Tuyển dụng chung nhận cả Full-time và Part-time. Part-time có thu nhập theo giờ, thỏa thuận theo năng lực. Bạn chọn hình thức ngay trong form.' },
  { q: 'Không có CV đánh máy thì sao?', a: 'Bạn có thể chụp ảnh hồ sơ viết tay hoặc giấy tờ liên quan bằng điện thoại (JPG, PNG) và tải lên, tối đa 5MB. Nhớ ghi rõ nơi sinh / nguyên quán.' },
  { q: 'Thông tin của tôi có được bảo mật không?', a: 'Hồ sơ được lưu trong kho riêng tư, chỉ Phòng Nhân sự được truy cập và chỉ dùng cho mục đích tuyển dụng.' },
];

function jobPostingJsonLd(job: Job) {
  const html = (title: string, items: string[]) =>
    items.length ? `<p><strong>${title}</strong></p><ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>` : '';
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.program === 'tan-sinh-vien' ? `${job.title} – Chương trình Tân sinh viên` : job.title,
    description:
      `<p>${PROGRAMS[job.program].lead}</p>` +
      html('Mô tả công việc', job.responsibilities) +
      html('Yêu cầu', job.requirements) +
      html('Quyền lợi', BENEFITS),
    datePosted: job.date_posted,
    ...(job.valid_through ? { validThrough: job.valid_through } : {}),
    employmentType: job.work_types,
    ...(job.quantity ? { totalJobOpenings: job.quantity } : {}),
    directApply: true,
    hiringOrganization: { '@type': 'Organization', name: 'Viora Living Saigon', sameAs: SITE_URL, logo: `${SITE_URL}/brand/mark.png` },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress', streetAddress: 'Khu phố Bình Đức 2', addressLocality: 'Phường Lái Thiêu',
        addressRegion: 'TP. Hồ Chí Minh', addressCountry: 'VN',
      },
    },
  };
}

function JobCard({ job, index, big }: { job: Job; index: number; big?: boolean }) {
  return (
    <article className={`job-card ${job.program === 'tan-sinh-vien' ? 'tsv' : ''} ${index % 2 ? 'alt' : ''}`} data-reveal style={{ transitionDelay: `${index * 120}ms` }}>
      <div className="job-top">
        {big && job.quantity
          ? <span className="job-qty">{String(job.quantity).padStart(2, '0')}<small>vị trí</small></span>
          : <span className="job-icon"><Icon name={JOB_ICON[job.slug] ?? 'briefcase'} size={28} /></span>}
        <div>
          <h3>{job.title}</h3>
          <div className="job-meta">
            {job.work_types.map(w => <span key={w} className="pill-light">{WORK_TYPE_LABELS[w]}</span>)}
            {!big && job.quantity && <span className="pill-light">Số lượng: {String(job.quantity).padStart(2, '0')}</span>}
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
          <span className="muted"><Icon name="pin" size={16} /> Cơ sở Lái Thiêu</span>
          <JobApplyButton slug={job.slug} />
        </div>
      </div>
    </article>
  );
}

function ProgramIntro({ id }: { id: keyof typeof PROGRAMS }) {
  const p = PROGRAMS[id];
  return (
    <div className="program-head" data-reveal>
      <span className={`audience-chip ${id}`}><Icon name={id === 'tan-sinh-vien' ? 'graduation' : 'users'} size={16} />{p.audience}</span>
      <h3>{p.title}</h3>
      <p>{p.lead}</p>
    </div>
  );
}

function SamePolicyNote() {
  return (
    <a className="same-policy" href="#chinh-sach">
      <Icon name="shield" size={18} />
      Chính sách, quyền lợi như nhau cho cả 2 chương trình – <b>xem bên dưới</b>
    </a>
  );
}

export default async function Home() {
  const jobs = await getActiveJobs();
  const tsvJobs = jobs.filter(j => j.program === 'tan-sinh-vien');
  const regularJobs = jobs.filter(j => j.program === 'thuong');
  const totalSeats = jobs.reduce((n, j) => n + (j.quantity ?? 0), 0);
  const hasOpenQty = jobs.some(j => !j.quantity);
  const seatsLabel = totalSeats ? `${totalSeats}${hasOpenQty ? '+' : ''}` : String(jobs.length);
  const regularSeats = regularJobs.reduce((n, j) => n + (j.quantity ?? 0), 0) || regularJobs.length;

  const panels = [
    regularJobs.length > 0 && {
      id: 'thuong',
      tab: PROGRAMS.thuong.tab,
      badge: `${PROGRAMS.thuong.audience} · ${regularSeats} vị trí`,
      content: (
        <>
          <ProgramIntro id="thuong" />
          <div className="jobs">
            {regularJobs.map((job, i) => <JobCard key={job.slug} job={job} index={i} big />)}
          </div>
          <SamePolicyNote />
        </>
      ),
    },
    tsvJobs.length > 0 && {
      id: 'tan-sinh-vien',
      tab: PROGRAMS['tan-sinh-vien'].tab,
      badge: PROGRAMS['tan-sinh-vien'].audience,
      content: (
        <>
          <ProgramIntro id="tan-sinh-vien" />
          <div className="jobs">
            {tsvJobs.map((job, i) => <JobCard key={job.slug} job={job} index={i} big />)}
          </div>
          <SamePolicyNote />
        </>
      ),
    },
  ].filter(Boolean) as { id: string; tab: string; badge: string; content: React.ReactNode }[];

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
          <Link href="/" className="brand" aria-label="Viora Living Saigon – Trang chủ">
            <Image src="/brand/mark.png" alt="" width={209} height={192} className="brand-mark" priority />
            <Image src="/brand/wordmark.png" alt="Viora Living Saigon" width={605} height={120} className="brand-word" priority />
          </Link>
          <nav className="nav">
            <a className="nav-link" href="#vi-tri">Vị trí</a>
            <a className="nav-link" href="#quy-trinh">Quy trình</a>
            <a className="nav-link" href="#hoi-dap">Hỏi đáp</a>
            <a className="nav-link nav-phone" href={`tel:${CONTACT.phoneTel}`}><Icon name="phone" size={16} /> {CONTACT.phone}</a>
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
              <div className="badge-live"><span className="dot" aria-hidden />Đang tuyển {seatsLabel} vị trí · Cơ sở Lái Thiêu</div>
              <h1>
                <span className="line">Cùng Viora chăm sóc</span> <span className="line">người cao tuổi</span> <span className="line"><span className="hl">bằng sự tận tâm</span></span>
              </h1>
              <p className="lead">
                Tôn trọng và chuyên nghiệp. Viora Living Saigon tuyển Điều dưỡng, Nhân viên chăm sóc người cao tuổi
                và Kỹ thuật viên Vật lý trị liệu.
                Có <b>Chương trình Tân sinh viên</b> dành cho bạn mới tốt nghiệp.
              </p>
              <div className="hero-programs">
                {regularJobs.length > 0 && (
                  <ProgramLink id="thuong" className="hp-card">
                    <span className="hp-num">{regularSeats}</span>
                    <span><b>{PROGRAMS.thuong.tab}</b><small>Dành cho mọi ứng viên · Điều dưỡng · NV chăm sóc · KTV VLTL</small></span>
                    <Icon name="arrow" size={18} />
                  </ProgramLink>
                )}
                {tsvJobs.length > 0 && (
                  <ProgramLink id="tan-sinh-vien" className="hp-card tsv">
                    <span className="hp-num gold"><Icon name="graduation" size={20} /></span>
                    <span><b>{PROGRAMS['tan-sinh-vien'].tab}</b><small>Dành cho bạn mới tốt nghiệp · Điều dưỡng · Caregiver</small></span>
                    <Icon name="arrow" size={18} />
                  </ProgramLink>
                )}
              </div>
              <p className="hero-jp-note"><i className="jp-dot" aria-hidden />Chính sách như nhau – cả 2 chương trình đều được đào tạo tại Nhật Bản</p>
              <div className="hero-actions">
                <a className="btn btn-primary btn-lg btn-shine" href="#ung-tuyen">Nộp hồ sơ ngay <Icon name="arrow" size={18} /></a>
                <a className="btn btn-ghost btn-lg" href={`tel:${CONTACT.phoneTel}`}><Icon name="phone" size={18} /> {CONTACT.phone}</a>
              </div>
            </div>
            <div className={`hero-visual ${HERO_PHOTO ? 'has-photo' : ''}`}>
              {HERO_PHOTO
                ? (
                  <div className="photo-frame">
                    <Image
                      src={HERO_PHOTO} alt="Điều dưỡng trò chuyện và nắm tay người cao tuổi"
                      width={1536} height={1024} priority className="hero-photo"
                      sizes="(max-width: 900px) 100vw, 540px"
                    />
                  </div>
                )
                : <HeroIllustration />}
              <div className="float-card fc-1">
                <span className="fc-icon teal"><Icon name="plane" size={20} /></span>
                <div><b>Đào tạo</b><small>tại Nhật Bản</small></div>
              </div>
              {jobs.length > 0 && (
                <div className="float-card fc-2">
                  <span className="fc-icon clay"><Icon name="briefcase" size={20} /></span>
                  <div><b>{seatsLabel} vị trí</b><small>đang mở tuyển</small></div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="facts" aria-label="Thông tin nhanh">
          <div className="container">
            <div className="facts-grid" data-reveal>
              <div className="fact"><Icon name="briefcase" /><div><b>{seatsLabel} vị trí</b><span>{jobs.length} chức danh</span></div></div>
              <div className="fact"><Icon name="clock" /><div><b>Full-time · Part-time</b><span>theo ca · 6 ngày/tuần</span></div></div>
              <div className="fact"><Icon name="plane" /><div><b>Đào tạo tại Nhật</b><span>cho cả 2 chương trình</span></div></div>
              <div className="fact"><Icon name="graduation" /><div><b>Tân sinh viên</b><span>chương trình riêng</span></div></div>
            </div>
          </div>
        </section>

        <div className="marquee-wrap" aria-hidden>
          <div className="marquee">
            <div className="marquee-track">
              {[0, 1].map(k => (
                <div className="marquee-group" key={k}>
                  {[...jobs.map(j => `Tuyển ${j.quantity ? String(j.quantity).padStart(2, '0') + ' ' : ''}${j.title}`), 'Đào tạo tại Nhật Bản', 'Chương trình Tân sinh viên', 'Full-time · Part-time', CONTACT.tagline].map((t, i) => (
                    <span key={`${t}-${i}`}><Icon name="sparkle" size={18} />{t}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="section section-alt" id="vi-tri">
          <div className="container">
            <div className="section-head center" data-reveal>
              <div className="eyebrow">Vị trí đang tuyển</div>
              <h2>Chọn chương trình phù hợp với bạn</h2>
              <p className="muted">2 chương trình có chính sách như nhau, chỉ khác đối tượng tuyển. Bấm để xem vị trí của từng chương trình.</p>
            </div>
            {panels.length === 0 ? (
              <p className="muted center">
                Hiện chưa có vị trí đang mở. Bạn có thể gửi CV về <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.
              </p>
            ) : (
              <ProgramTabs
                panels={panels}
                jobPrograms={Object.fromEntries(jobs.map(j => [j.slug, j.program]))}
              />
            )}
          </div>
        </section>

        <section className="section" id="chinh-sach">
          <div className="container">
            <div className="section-head center" data-reveal>
              <div className="eyebrow">Chính sách & quyền lợi</div>
              <h2>Như nhau cho cả 2 chương trình</h2>
              <p className="muted">Dù bạn ứng tuyển Tuyển dụng chung hay Chương trình Tân sinh viên, bạn đều nhận được các chính sách dưới đây.</p>
            </div>
            <div className="jp-banner" data-reveal>
              <div>
                <div className="eyebrow light">Đặc biệt · Sau khi trúng tuyển</div>
                <h3>Được đào tạo<br /><span>tại Nhật Bản</span></h3>
                <p>Chi phí ăn ở, đi lại do Viora Living Saigon chi trả.</p>
              </div>
              <div className="jp-seal">
                <div className="jp-flag" aria-hidden><span /></div>
                <span className="jp-tag">Chuẩn chăm sóc Nhật Bản</span>
              </div>
            </div>
            <div className="income" data-reveal>
              {INCOME.map(i => (
                <div key={i.label}>
                  <small>{i.label}</small>
                  <b>{i.value}</b>
                  <span>{i.note}</span>
                </div>
              ))}
            </div>
            <div className="policy-grid">
              <div className="ph-photo" data-reveal>
                <Image src="/images/program-thuong.webp" alt="Nhân viên chăm sóc nắm tay người cao tuổi" width={802} height={495} sizes="(max-width: 900px) 100vw, 520px" />
                <span className="ph-badge"><span className="jp-dot" aria-hidden />Đào tạo chuyên môn tại Nhật Bản</span>
              </div>
              <div className="perks" data-reveal>
                <h3 className="perks-title">Quyền lợi</h3>
                <ul>
                  {BENEFITS.map(b => <li key={b}><Icon name="check" size={16} />{b}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-alt">
          <div className="container">
            <div className="section-head center" data-reveal>
              <div className="eyebrow">Vì sao chọn Viora</div>
              <h2>Nơi bạn phát triển nghề chăm sóc</h2>
            </div>
            <div className="grid-4">
              {WHY_VIORA.map((b, i) => (
                <div key={b.title} className={`card benefit tone-${b.tone}`} data-reveal style={{ transitionDelay: `${i * 120}ms` }}>
                  <div className="icon-badge"><Icon name={b.icon} size={26} /></div>
                  <h3>{b.title}</h3>
                  <p className="muted">{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="quy-trinh">
          <div className="container">
            <div className="section-head center" data-reveal>
              <div className="eyebrow">Quy trình</div>
              <h2>Ứng tuyển đơn giản trong 4 bước</h2>
            </div>
            <ol className="timeline-steps" data-reveal>
              {STEPS.map((s, i) => (
                <li key={s.title} style={{ ['--d' as string]: `${i * 180}ms` }}>
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
              <aside className="apply-aside" data-reveal>
                <div className="eyebrow light">Ứng tuyển</div>
                <h2>Gửi hồ sơ của bạn</h2>
                <p>Chọn vị trí, điền thông tin và đính kèm CV. Phòng Nhân sự sẽ liên hệ lại qua số điện thoại bạn cung cấp.</p>
                <ul className="aside-list">
                  <li><Icon name="file" size={20} /><span><b>CV cá nhân</b>ghi rõ nơi sinh / nguyên quán · PDF, Word hoặc ảnh chụp</span></li>
                  <li><Icon name="phone" size={20} /><span><b>Ngại điền form?</b>Gọi hoặc nhắn Zalo <a href={`tel:${CONTACT.phoneTel}`}>{CONTACT.phone}</a></span></li>
                  <li><Icon name="mail" size={20} /><span><b>Gửi qua email</b><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> – tiêu đề: [Vị trí ứng tuyển] – Họ tên</span></li>
                  <li><Icon name="shield" size={20} /><span><b>Bảo mật</b>hồ sơ chỉ Phòng Nhân sự xem được</span></li>
                </ul>
                <div className="aside-actions">
                  <a className="btn btn-light btn-sm" href={`tel:${CONTACT.phoneTel}`}><Icon name="phone" size={16} /> Gọi ngay</a>
                  <ZaloLink className="btn btn-zalo btn-sm">Nhắn Zalo</ZaloLink>
                </div>
              </aside>
              <ApplyForm
                jobs={jobs.map(j => ({ slug: j.slug, title: j.title, program: j.program, quantity: j.quantity, work_types: j.work_types }))}
              />
            </div>
          </section>
        )}

        <section className="section" id="hoi-dap">
          <div className="container faq-wrap">
            <div className="section-head center" data-reveal>
              <div className="eyebrow">Hỏi đáp</div>
              <h2>Câu hỏi thường gặp</h2>
            </div>
            <div className="faq">
              {FAQ.map(f => (
                <details key={f.q} data-reveal>
                  <summary>{f.q}</summary>
                  <p className="muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-band">
          <div className="container">
            <div className="cta-inner" data-reveal>
              <div className="cta-copy">
                <h2>Biết ai hợp với công việc này?</h2>
                <p>Chia sẻ tin tuyển dụng cho bạn bè, người thân đang tìm việc ngành chăm sóc.</p>
                <ShareButtons url={SITE_URL} />
              </div>
              <a className="btn btn-light btn-lg btn-shine" href="#ung-tuyen">Ứng tuyển ngay <Icon name="arrow" size={18} /></a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <div className="brand brand-light">
              <Image src="/brand/mark.png" alt="" width={209} height={192} className="brand-mark" />
              <Image src="/brand/wordmark-white.png" alt="Viora Living Saigon" width={605} height={120} className="brand-word" />
            </div>
            <p className="tagline">{CONTACT.tagline}</p>
            <div className="footer-sub"><Icon name="pin" size={16} /> {CONTACT.place}<br />{CONTACT.address}</div>
          </div>
          <div className="footer-links">
            <a href={`tel:${CONTACT.phoneTel}`}><Icon name="phone" size={16} /> {CONTACT.phone}</a>
            <a href={`mailto:${CONTACT.email}`}><Icon name="mail" size={16} /> {CONTACT.email}</a>
            <Link href="/chinh-sach-bao-mat"><Icon name="shield" size={16} /> Chính sách bảo vệ dữ liệu cá nhân</Link>
          </div>
        </div>
      </footer>
      <ContactButtons />
      <MobileApplyBar />
      <Reveal />
    </>
  );
}
