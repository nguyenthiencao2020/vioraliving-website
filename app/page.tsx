import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getActiveJobs, type Job } from '@/lib/jobs';
import { CONTACT, SITE_URL, WORK_TYPE_LABELS } from '@/lib/constants';
import { BENEFIT_ICONS, BENEFITS, INCOME, PROGRAMS, VALUES } from '@/lib/programs';
import ApplyForm from './ApplyForm';
import Icon, { type IconName } from './components/Icon';
import HeroIllustration from './components/HeroIllustration';
import CountUp from './components/CountUp';
import Reveal from './components/Reveal';
import BgShift from './components/BgShift';
import ShareButtons from './components/ShareButtons';
import MobileApplyBar from './components/MobileApplyBar';
import ContactButtons from './components/ContactButtons';
import BackToTop from './components/BackToTop';
import ProgramTabs from './components/ProgramTabs';
import JsonLd from './components/JsonLd';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import { organizationJsonLd } from '@/lib/seo';
import JobApplyButton from './JobApplyButton';

// Đọc lại danh sách vị trí từ Supabase tối đa 5 phút/lần
export const revalidate = 300;

export const metadata: Metadata = { alternates: { canonical: '/' } };

// Ảnh hero trong public/images/. Đặt null để dùng hình minh họa SVG.
const HERO_PHOTO: string | null = '/images/hero-v2.webp';

// Biểu tượng theo nghề (giống nhau ở cả 2 chương trình)
const ROLE_ICON: Record<string, IconName> = {
  'dieu-duong': 'heart',
  'caregiver': 'hand',
  'nhan-vien-cham-soc': 'hand',
  'vat-ly-tri-lieu': 'sprout',
};
const jobIcon = (slug: string) => ROLE_ICON[slug.replace(/^tan-sinh-vien-/, '')] ?? 'briefcase';

const STEPS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'file', title: 'Chọn vị trí & nộp hồ sơ', text: 'Bấm chọn vị trí, điền thông tin và đính kèm CV.' },
  { icon: 'phone', title: 'HR liên hệ', text: 'Phòng Nhân sự gọi điện xác nhận thông tin.' },
  { icon: 'chat', title: 'Phỏng vấn', text: `Tại văn phòng ${CONTACT.interviewAddress}.` },
  { icon: 'checkCircle', title: 'Nhận việc', text: 'Ký hợp đồng và bắt đầu đào tạo.' },
];

const FAQ = [
  { multi: true, q: '2 chương trình khác nhau thế nào?', a: 'Chính sách và quyền lợi của 2 chương trình như nhau. Chỉ khác đối tượng: Chương trình Tân sinh viên dành cho sinh viên, học viên vừa tốt nghiệp (toàn thời gian); Tuyển dụng chung dành cho mọi ứng viên (toàn thời gian hoặc bán thời gian / cộng tác). Cả 2 đều tuyển Điều dưỡng, Nhân viên chăm sóc và Kỹ thuật viên Vật lý trị liệu, Phục hồi chức năng.' },
  { q: 'Tôi chưa có kinh nghiệm có ứng tuyển được không?', a: 'Được. Viora nhận ứng viên mới tốt nghiệp, chưa có kinh nghiệm ở tất cả các vị trí. Bạn sẽ được kèm cặp, đào tạo thực tế ngay tại nơi làm việc và đào tạo chuyên môn tại Nhật Bản.' },
  { q: 'Đào tạo tại Nhật Bản có tốn chi phí không?', a: 'Không. Nhân sự được đào tạo chuyên môn tại Nhật Bản; chi phí ăn ở, đi lại do Viora Living Saigon chi trả.' },
  { q: 'Viora có chỗ ở cho nhân viên không?', a: 'Có. Viora có chỗ lưu trú tại Trung tâm cho nhân sự có nhu cầu – phù hợp với các bạn ở tỉnh. Bạn có thể ghi nhu cầu này trong phần giới thiệu bản thân, Phòng Nhân sự sẽ trao đổi khi phỏng vấn.' },
  { q: 'Phỏng vấn ở đâu?', a: `Giai đoạn này, buổi phỏng vấn diễn ra tại văn phòng ${CONTACT.interviewAddress}. Phòng Nhân sự sẽ gọi điện hẹn lịch cụ thể. Nơi làm việc sau khi trúng tuyển là ${CONTACT.place}, ${CONTACT.address}.` },
  { q: 'Tôi muốn làm bán thời gian / cộng tác được không?', a: 'Được. Ngoài hình thức toàn thời gian ổn định, Viora nhận nhân sự bán thời gian / cộng tác theo nhu cầu của cả hai bên. Thu nhập theo giờ, thỏa thuận theo năng lực. Bạn chọn hình thức ngay trong form.' },
  { q: 'Thông tin của tôi có được bảo mật không?', a: 'Hồ sơ được lưu trong kho riêng tư, chỉ Phòng Nhân sự được truy cập và chỉ dùng cho mục đích tuyển dụng.' },
];

function JobCard({ job, index }: { job: Job; index: number }) {
  const summary = job.responsibilities.length ? job.responsibilities : job.requirements;
  return (
    <article className={`job-card ${job.program === 'tan-sinh-vien' ? 'tsv' : ''}`} data-reveal style={{ transitionDelay: `${index * 120}ms` }}>
      <div className="job-top">
        <span className="job-icon"><Icon name={jobIcon(job.slug)} size={28} /></span>
        <div>
          <h3><Link href={`/viec-lam/${job.slug}`} className="job-link">{job.title}</Link></h3>
          <div className="job-meta">
            {job.work_types.map(w => <span key={w} className="pill-light">{WORK_TYPE_LABELS[w]}</span>)}
          </div>
        </div>
      </div>
      <div className="job-body">
        {summary.length > 0 && (
          <ul className="check-list key-req">
            {summary.slice(0, 2).map(r => <li key={r}><Icon name="check" size={16} />{r}</li>)}
          </ul>
        )}
        <div className="job-foot">
          <Link href={`/viec-lam/${job.slug}`} className="btn btn-ghost">Xem chi tiết</Link>
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
      <p>{p.lead}</p>
    </div>
  );
}

export default async function Home() {
  const jobs = await getActiveJobs();
  const tsvJobs = jobs.filter(j => j.program === 'tan-sinh-vien');
  const regularJobs = jobs.filter(j => j.program === 'thuong');

  const panels = [
    regularJobs.length > 0 && {
      id: 'thuong',
      tab: PROGRAMS.thuong.tab,
      badge: PROGRAMS.thuong.audience,
      content: (
        <>
          <ProgramIntro id="thuong" />
          <div className="jobs">
            {regularJobs.map((job, i) => <JobCard key={job.slug} job={job} index={i} />)}
          </div>
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
            {tsvJobs.map((job, i) => <JobCard key={job.slug} job={job} index={i} />)}
          </div>
        </>
      ),
    },
  ].filter(Boolean) as { id: string; tab: string; badge: string; content: React.ReactNode }[];
  // Chỉ còn 1 chương trình (vd. tạm ẩn Tân sinh viên) → không hiện tab và các câu "2 chương trình"
  const multi = panels.length > 1;
  const titles = [...new Set(jobs.map(j => j.title))];
  const titleList = titles.length > 1 ? `${titles.slice(0, -1).join(', ')} và ${titles[titles.length - 1]}` : titles[0] ?? '';

  return (
    <>
      <JsonLd data={organizationJsonLd()} />

      <SiteHeader home />

      <main>
        <section className="hero" data-bg="#eef7f6">
          <div className="hero-bg" aria-hidden>
            <div className="blob blob-1" />
            <div className="blob blob-2" />
          </div>
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="badge-live"><span className="dot" aria-hidden />Trung tâm chăm sóc người cao tuổi · Cơ sở Lái Thiêu đang tuyển dụng</div>
              <h1>
                <span className="line">Cùng Viora chăm sóc</span> <span className="line">người cao tuổi</span> <span className="line"><span className="hl">bằng sự tận tâm</span></span>
              </h1>
              <p className="lead">
                {multi
                  ? <>Tuyển {titles.filter(t => !t.includes('Caregiver')).join(', ')} và <b>Chương trình Tân sinh viên</b>. Được đào tạo tại Nhật Bản.</>
                  : <>Tuyển {titleList}. Được đào tạo tại Nhật Bản.</>}
              </p>
              <div className="hero-actions">
                <a className="btn btn-primary btn-lg btn-shine" href="#vi-tri">Xem vị trí đang tuyển <Icon name="arrow" size={18} /></a>
                <a className="btn btn-ghost btn-lg" href={`tel:${CONTACT.phoneTel}`}><Icon name="phone" size={18} /> {CONTACT.phone}</a>
              </div>
            </div>
            <div className={`hero-visual ${HERO_PHOTO ? 'has-photo' : ''}`}>
              {HERO_PHOTO
                ? (
                  <div className="photo-frame">
                    <Image
                      src={HERO_PHOTO} alt="Nhân viên Viora trò chuyện, nắm tay người cao tuổi trong phòng khách ấm cúng"
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
              <div className="float-card fc-2">
                <span className="fc-icon clay"><Icon name="graduation" size={20} /></span>
                <div><b>Chưa có kinh nghiệm?</b><small>Viora đào tạo từ đầu</small></div>
              </div>
            </div>
          </div>
        </section>

        <section className="facts" aria-label="Thông tin nhanh">
          <div className="container">
            {multi ? (
              <div className="facts-grid" data-reveal>
              <div className="fact"><Icon name="graduation" /><div><b>Nhận người mới</b><span>chưa có kinh nghiệm</span></div></div>
              <div className="fact"><Icon name="clock" /><div><b>Toàn thời gian · Bán thời gian</b><span>cộng tác theo nhu cầu các bên</span></div></div>
              <div className="fact"><Icon name="plane" /><div><b>Đào tạo tại Nhật</b><span>Viora chi trả ăn ở, đi lại</span></div></div>
              <div className="fact"><Icon name="pin" /><div><b>Cơ sở Lái Thiêu</b><span>TP. Hồ Chí Minh</span></div></div>
              </div>
            ) : (
              <div className="stat-band" data-reveal>
                <div className="stat-cards">
                  {jobs.map(j => (
                    <Link key={j.slug} href={`/viec-lam/${j.slug}`} className="stat-card">
                      <span className="stat-icon"><Icon name={jobIcon(j.slug)} size={26} /></span>
                      {j.quantity ? <b className="stat-num"><CountUp to={j.quantity} /></b> : null}
                      <span className="stat-title">{j.title}<em>Xem chi tiết <Icon name="arrow" size={14} /></em></span>
                    </Link>
                  ))}
                </div>
                <p className="stat-note">
                  <span><Icon name="pin" size={16} /> {CONTACT.place}</span>
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="section section-alt" id="vi-tri" data-bg="#f4efe7">
          <div className="container">
            <div className="section-head center" data-reveal>
              <div className="eyebrow">Vị trí đang tuyển</div>
              <h2>{multi ? 'Chọn chương trình phù hợp với bạn' : 'Chọn vị trí phù hợp với bạn'}</h2>
              <p className="muted">{multi ? '2 chương trình có cùng quyền lợi, chỉ khác đối tượng tuyển.' : 'Xem chi tiết công việc và ứng tuyển trực tuyến trong vài phút.'}</p>
            </div>
            {panels.length === 0 ? (
              <p className="muted center">
                Hiện chưa có vị trí đang mở. Bạn có thể gửi CV về <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.
              </p>
            ) : !multi ? (
              <div className="jobs single" data-reveal>{jobs.map((job, i) => <JobCard key={job.slug} job={job} index={i} />)}</div>
            ) : (
              <ProgramTabs
                panels={panels}
                jobPrograms={Object.fromEntries(jobs.map(j => [j.slug, j.program]))}
              />
            )}
          </div>
        </section>

        <section className="section" id="chinh-sach" data-bg="#fbf8f3">
          <div className="container">
            <div className="section-head center" data-reveal>
              <div className="eyebrow">Quyền lợi</div>
              <h2>Quyền lợi khi làm việc tại Viora</h2>
              {multi && <p className="muted">Áp dụng cho cả 2 chương trình.</p>}
            </div>
            <div className="jp-banner has-photo" data-reveal>
              <span className="aurora a1" aria-hidden /><span className="aurora a2" aria-hidden />
              <div className="jp-copy">
                <div className="eyebrow light">Đặc biệt · Sau khi trúng tuyển</div>
                <h3>Được đào tạo<br /><span className="shine-text">tại Nhật Bản</span></h3>
                <p>Chi phí ăn ở, đi lại do Viora Living Saigon chi trả.</p>
                <span className="jp-tag"><span className="jp-flag mini" aria-hidden><span /></span>Chuẩn chăm sóc Nhật Bản</span>
              </div>
              <div className="jp-photo">
                <span className="jp-photo-badge"><span className="jp-flag mini" aria-hidden><span /></span>Đào tạo tại Nhật</span>
                <Image src="/images/team.webp" alt="Đội ngũ Viora tham gia đào tạo tại Nhật Bản" width={1585} height={992} sizes="(max-width: 900px) 100vw, 560px" />
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
            <div className="benefit-grid">
              {BENEFITS.slice(1).map((t, i) => (
                <div key={t} className="benefit-card" data-reveal style={{ transitionDelay: `${(i % 3) * 80}ms` }}>
                  <span className="benefit-no" aria-hidden>{String(i + 1).padStart(2, '0')}</span>
                  <span className="benefit-icon"><Icon name={BENEFIT_ICONS[i + 1]} size={22} /></span>
                  <p>{t}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="values-band" aria-label="Giá trị của Viora">
          <div className="container">
            <div className="values-tiles">
              {VALUES.map((v, i) => (
                <figure key={v.title} className="value-tile" data-reveal style={{ transitionDelay: `${i * 110}ms`, ['--d' as string]: `${i * 0.6}s` }}>
                  <Image src={v.image} alt={v.alt} fill style={{ objectPosition: v.pos }} sizes="(max-width: 600px) 50vw, (max-width: 900px) 50vw, 300px" />
                  <figcaption>
                    <span className="value-icon"><Icon name={v.icon} size={20} /></span>
                    <span><b>{v.title}</b><small>{v.text}</small></span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-alt" id="quy-trinh" data-bg="#eef6f4">
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
          <section className="section section-apply" id="ung-tuyen" data-bg="#fbf8f3">
            <div className="container apply-grid">
              <aside className="apply-aside" data-reveal>
                <div className="eyebrow light">Ứng tuyển</div>
                <h2>Gửi hồ sơ của bạn</h2>
                <p>Chọn vị trí, điền thông tin và đính kèm CV. Phòng Nhân sự sẽ liên hệ lại qua số điện thoại bạn cung cấp.</p>
                <ul className="aside-list">
                  <li><Icon name="file" size={20} /><span><b>CV cá nhân</b>ghi rõ nơi sinh / nguyên quán · PDF, Word hoặc ảnh chụp</span></li>
                  <li><Icon name="phone" size={20} /><span><b>Ngại điền form?</b>Gọi ngay cho Phòng Nhân sự<a className="aside-strong" href={`tel:${CONTACT.phoneTel}`}>{CONTACT.phone}</a></span></li>
                  <li><Icon name="mail" size={20} /><span><b>Hoặc gửi CV qua email</b><a className="aside-strong" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a><small>Tiêu đề: [Vị trí ứng tuyển] – Họ tên</small></span></li>
                  <li><Icon name="shield" size={20} /><span><b>Bảo mật</b>hồ sơ chỉ Phòng Nhân sự xem được</span></li>
                </ul>
                <div className="aside-actions">
                  <a className="btn btn-light btn-sm" href={`tel:${CONTACT.phoneTel}`}><Icon name="phone" size={16} /> Gọi {CONTACT.phone}</a>
                </div>
              </aside>
              <ApplyForm
                jobs={jobs.map(j => ({ slug: j.slug, title: j.title, program: j.program, quantity: j.quantity, work_types: j.work_types }))}
              />
            </div>
          </section>
        )}

        <section className="section section-alt" id="hoi-dap" data-bg="#f4efe7">
          <div className="container faq-wrap">
            <div className="section-head center" data-reveal>
              <div className="eyebrow">Hỏi đáp</div>
              <h2>Câu hỏi thường gặp</h2>
            </div>
            <div className="faq">
              {FAQ.filter(f => multi || !('multi' in f)).map(f => (
                <details key={f.q} data-reveal>
                  <summary>{f.q}</summary>
                  <p className="muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-band" data-bg="#fbf8f3">
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

      <SiteFooter />
      <ContactButtons />
      <MobileApplyBar />
      <BackToTop />
      <Reveal />
      <BgShift />
    </>
  );
}
