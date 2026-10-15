import type { Metadata } from 'next';
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
const HERO_PHOTO: string | null = '/images/hero.webp';

const JOB_ICON: Record<string, IconName> = {
  'tan-sinh-vien-dieu-duong': 'stethoscope',
  'tan-sinh-vien-caregiver': 'hand',
  'dieu-duong': 'stethoscope',
  'nhan-vien-cham-soc': 'hand',
  'vat-ly-tri-lieu': 'sprout',
};

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

function JobCard({ job, index, big }: { job: Job; index: number; big?: boolean }) {
  return (
    <article className={`job-card ${job.program === 'tan-sinh-vien' ? 'tsv' : ''} ${index % 2 ? 'alt' : ''}`} data-reveal style={{ transitionDelay: `${index * 120}ms` }}>
      <div className="job-top">
        {big && job.quantity
          ? <span className="job-qty">{String(job.quantity).padStart(2, '0')}<small>vị trí</small></span>
          : <span className="job-icon"><Icon name={JOB_ICON[job.slug] ?? 'briefcase'} size={28} /></span>}
        <div>
          <h3><Link href={`/viec-lam/${job.slug}`} className="job-link">{job.title}</Link></h3>
          <div className="job-meta">
            {job.work_types.map(w => <span key={w} className="pill-light">{WORK_TYPE_LABELS[w]}</span>)}
            {!big && job.quantity && <span className="pill-light">Số lượng: {String(job.quantity).padStart(2, '0')}</span>}
          </div>
        </div>
      </div>
      <div className="job-body">
        {job.audience && <p className="job-audience"><Icon name="sprout" size={18} />{job.audience}</p>}
        {job.requirements.length > 0 && (
          <ul className="check-list key-req">
            {job.requirements.slice(0, 2).map(r => <li key={r}><Icon name="check" size={16} />{r}</li>)}
          </ul>
        )}
        <details className="job-more">
          <summary>Xem chi tiết công việc</summary>
          {job.responsibilities.length > 0 && (
            <>
              <h4>Mô tả công việc</h4>
              <ul className="check-list">{job.responsibilities.map(r => <li key={r}><Icon name="check" size={16} />{r}</li>)}</ul>
            </>
          )}
          {job.requirements.length > 2 && (
            <>
              <h4>Yêu cầu khác</h4>
              <ul className="check-list">{job.requirements.slice(2).map(r => <li key={r}><Icon name="check" size={16} />{r}</li>)}</ul>
            </>
          )}
        </details>
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
      <p>{p.lead}</p>
    </div>
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
        </>
      ),
    },
  ].filter(Boolean) as { id: string; tab: string; badge: string; content: React.ReactNode }[];

  return (
    <>
      <JsonLd data={organizationJsonLd()} />

      <SiteHeader home />

      <main>
        <section className="hero">
          <div className="hero-bg" aria-hidden>
            <div className="blob blob-1" />
            <div className="blob blob-2" />
          </div>
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="badge-live"><span className="dot" aria-hidden />Viora Living Saigon · Cơ sở Lái Thiêu đang tuyển dụng</div>
              <h1>
                <span className="line">Cùng Viora chăm sóc</span> <span className="line">người cao tuổi</span> <span className="line"><span className="hl">bằng sự tận tâm</span></span>
              </h1>
              <p className="lead">
                Tuyển Điều dưỡng, Nhân viên chăm sóc người cao tuổi, Kỹ thuật viên Vật lý trị liệu
                và <b>Chương trình Tân sinh viên</b>. Được đào tạo tại Nhật Bản.
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
            </div>
          </div>
        </section>

        <section className="facts" aria-label="Thông tin nhanh">
          <div className="container">
            <div className="facts-grid" data-reveal>
              <div className="fact"><Icon name="briefcase" /><div><b>{seatsLabel} vị trí</b><span>2 chương trình</span></div></div>
              <div className="fact"><Icon name="clock" /><div><b>Full-time · Part-time</b><span>theo ca · 6 ngày/tuần</span></div></div>
              <div className="fact"><Icon name="plane" /><div><b>Đào tạo tại Nhật</b><span>Viora chi trả ăn ở, đi lại</span></div></div>
              <div className="fact"><Icon name="pin" /><div><b>Cơ sở Lái Thiêu</b><span>TP. Hồ Chí Minh</span></div></div>
            </div>
          </div>
        </section>

        <section className="section section-alt" id="vi-tri">
          <div className="container">
            <div className="section-head center" data-reveal>
              <div className="eyebrow">Vị trí đang tuyển</div>
              <h2>Chọn chương trình phù hợp với bạn</h2>
              <p className="muted">2 chương trình có cùng quyền lợi, chỉ khác đối tượng tuyển.</p>
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
              <div className="eyebrow">Quyền lợi</div>
              <h2>Quyền lợi khi làm việc tại Viora</h2>
              <p className="muted">Áp dụng cho cả 2 chương trình.</p>
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
              </div>
              <div className="perks" data-reveal>
                <h3 className="perks-title">Quyền lợi</h3>
                <ul>
                  {BENEFITS.slice(1).map(b => <li key={b}><Icon name="check" size={16} />{b}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-alt" id="quy-trinh">
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

        <section className="section section-alt" id="hoi-dap">
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

      <SiteFooter />
      <ContactButtons />
      <MobileApplyBar />
      <Reveal />
    </>
  );
}
