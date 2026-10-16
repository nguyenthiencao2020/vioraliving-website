import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getActiveJobs, type Job } from '@/lib/jobs';
import { CONTACT, SITE_URL, WORK_TYPE_LABELS } from '@/lib/constants';
import { BENEFITS, INCOME, PROGRAMS, resolveSlug } from '@/lib/programs';
import { breadcrumbJsonLd, jobPostingJsonLd, jobSeoTitle, jobUrl } from '@/lib/seo';
import Icon from '../../components/Icon';
import JsonLd from '../../components/JsonLd';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';

export const revalidate = 300;

async function findJob(slug: string): Promise<{ job: Job | undefined; jobs: Job[] }> {
  const jobs = await getActiveJobs();
  return { job: jobs.find(j => j.slug === slug), jobs };
}

export async function generateStaticParams() {
  return (await getActiveJobs()).map(j => ({ slug: j.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { job } = await findJob(slug);
  if (!job) return { title: 'Không tìm thấy vị trí', robots: { index: false } };
  // Tiêu đề Google hiển thị tốt nhất dưới ~60 ký tự
  const title = job.program === 'tan-sinh-vien' ? jobSeoTitle(job) : `${jobSeoTitle(job)} tại Lái Thiêu, TP.HCM`;
  const description =
    `Viora Living Saigon tuyển ${job.title}, ` +
    `${job.work_types.map(w => WORK_TYPE_LABELS[w]).join('/')}, được đào tạo tại Nhật Bản. ` +
    `${job.responsibilities[0] ?? ''} Nộp hồ sơ online.`;
  return {
    title,
    description: description.slice(0, 300),
    alternates: { canonical: `/viec-lam/${job.slug}` },
    openGraph: { title, description, url: jobUrl(job.slug), type: 'website' },
  };
}

export default async function JobPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { job, jobs } = await findJob(slug);
  if (!job) {
    // Link cũ (vd. vị trí Tân sinh viên đang tạm ẩn) → chuyển sang vị trí tương ứng đang tuyển
    const alt = resolveSlug(slug, jobs.map(j => j.slug));
    if (alt) redirect(`/viec-lam/${alt}`);
    notFound();
  }
  const program = PROGRAMS[job.program];
  const others = jobs.filter(j => j.slug !== job.slug);
  const applyHref = `/?vi-tri=${job.slug}#ung-tuyen`;

  return (
    <>
      <JsonLd data={jobPostingJsonLd(job)} />
      <JsonLd data={breadcrumbJsonLd([
        { name: 'Tuyển dụng', url: `${SITE_URL}/` },
        { name: program.tab, url: `${SITE_URL}/?ct=${job.program}#vi-tri` },
        { name: job.title, url: jobUrl(job.slug) },
      ])} />
      <SiteHeader />

      <main>
        <section className="job-hero">
          <div className="container">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Tuyển dụng</Link><span>›</span>
              <Link href={`/?ct=${job.program}#vi-tri`}>{program.tab}</Link><span>›</span>
              <span aria-current="page">{job.title}</span>
            </nav>
            <span className={`audience-chip ${job.program}`}>
              <Icon name={job.program === 'tan-sinh-vien' ? 'graduation' : 'users'} size={16} />{program.audience}
            </span>
            <h1>{jobSeoTitle(job)}</h1>
            <div className="job-hero-meta">
              <span><Icon name="clock" size={18} /> {job.work_types.map(w => WORK_TYPE_LABELS[w]).join(' · ')}</span>
              <span><Icon name="pin" size={18} /> Cơ sở Lái Thiêu, TP.HCM</span>
              <span><Icon name="plane" size={18} /> Đào tạo tại Nhật Bản</span>
            </div>
            <div className="hero-actions">
              <Link className="btn btn-primary btn-lg btn-shine" href={applyHref}>Ứng tuyển vị trí này <Icon name="arrow" size={18} /></Link>
              <a className="btn btn-ghost btn-lg" href={`tel:${CONTACT.phoneTel}`}><Icon name="phone" size={18} /> {CONTACT.phone}</a>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container job-detail">
            <div className="job-detail-main">
              <p className="muted">{program.lead}</p>

              <h2>Mô tả công việc</h2>
              <ul className="check-list">{job.responsibilities.map(r => <li key={r}><Icon name="check" size={16} />{r}</li>)}</ul>

              <h2>Yêu cầu</h2>
              <ul className="check-list">{job.requirements.map(r => <li key={r}><Icon name="check" size={16} />{r}</li>)}</ul>

              <h2>Quyền lợi</h2>
              <div className="jp-banner compact">
                <div>
                  <div className="eyebrow light">Đặc biệt · Sau khi trúng tuyển</div>
                  <h3>Được đào tạo <span>tại Nhật Bản</span></h3>
                  <p>Chi phí ăn ở, đi lại do Viora Living Saigon chi trả.</p>
                </div>
              </div>
              <ul className="check-list gold">{BENEFITS.slice(1).map(b => <li key={b}><Icon name="check" size={16} />{b}</li>)}</ul>

              <h2>Thu nhập & hình thức</h2>
              <div className="income">
                {INCOME.map(i => (
                  <div key={i.label}><small>{i.label}</small><b>{i.value}</b><span>{i.note}</span></div>
                ))}
              </div>

              <h2>Địa điểm</h2>
              <div className="place-grid">
                <div className="card place-card">
                  <small>Nơi làm việc</small>
                  <b>{CONTACT.place}</b>
                  <span>{CONTACT.address}</span>
                </div>
                <div className="card place-card">
                  <small>Nơi phỏng vấn</small>
                  <b>{CONTACT.interviewPlace}</b>
                  <span>{CONTACT.interviewAddress}</span>
                </div>
              </div>
            </div>

            <aside className="job-detail-side">
              <div className="card apply-card">
                <h3>Ứng tuyển {job.title}</h3>
                <p className="muted">Nộp hồ sơ online trong vài phút. Chuẩn bị CV (PDF, Word hoặc ảnh chụp), ghi rõ nơi sinh / nguyên quán.</p>
                <Link className="btn btn-primary btn-shine" href={applyHref}>Nộp hồ sơ <Icon name="arrow" size={18} /></Link>
                <div className="apply-card-alt">
                  <a href={`tel:${CONTACT.phoneTel}`}><Icon name="phone" size={16} /> {CONTACT.phone}</a>
                  <a href={`mailto:${CONTACT.email}`}><Icon name="mail" size={16} /> {CONTACT.email}</a>
                </div>
              </div>

              {others.length > 0 && (
                <div className="card other-jobs">
                  <h3>Vị trí khác</h3>
                  <ul>
                    {others.map(o => (
                      <li key={o.slug}>
                        <Link href={`/viec-lam/${o.slug}`}>
                          <b>{o.title}</b>
                          <small>{PROGRAMS[o.program].tab}</small>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
