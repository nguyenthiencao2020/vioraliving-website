import { CONTACT, SITE_URL } from './constants';
import type { Job } from './jobs';
import { BENEFITS, PROGRAMS } from './programs';

// Dữ liệu có cấu trúc (schema.org) cho Google: tổ chức, việc làm (Google for Jobs), breadcrumb

export const jobUrl = (slug: string) => `${SITE_URL}/viec-lam/${slug}`;

export const jobSeoTitle = (job: Job) =>
  job.program === 'tan-sinh-vien'
    ? `Tuyển ${job.title} – Chương trình Tân sinh viên`
    : `Tuyển ${job.title}`;

const ADDRESS = {
  '@type': 'PostalAddress',
  streetAddress: 'Khu phố Bình Đức 2',
  addressLocality: 'Phường Lái Thiêu',
  addressRegion: 'TP. Hồ Chí Minh',
  addressCountry: 'VN',
};

const ORG = {
  '@type': 'Organization',
  name: 'Viora Living Saigon',
  url: SITE_URL,
  logo: `${SITE_URL}/brand/mark.png`,
};

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        ...ORG,
        '@id': `${SITE_URL}/#org`,
        slogan: CONTACT.tagline,
        address: ADDRESS,
        email: CONTACT.email,
        telephone: '+84708299907',
        contactPoint: [{ '@type': 'ContactPoint', contactType: 'Tuyển dụng', telephone: '+84708299907', email: CONTACT.email, areaServed: 'VN', availableLanguage: 'Vietnamese' }],
      },
      { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: SITE_URL, name: 'Viora Living Saigon – Tuyển dụng', inLanguage: 'vi', publisher: { '@id': `${SITE_URL}/#org` } },
    ],
  };
}

export function jobPostingJsonLd(job: Job) {
  const list = (title: string, items: string[]) =>
    items.length ? `<p><strong>${title}</strong></p><ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>` : '';
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.program === 'tan-sinh-vien' ? `${job.title} (Chương trình Tân sinh viên)` : job.title,
    description:
      `<p>${PROGRAMS[job.program].lead}</p>` +
      list('Mô tả công việc', job.responsibilities) +
      list('Yêu cầu', job.requirements) +
      list('Quyền lợi', BENEFITS),
    identifier: { '@type': 'PropertyValue', name: 'Viora Living Saigon', value: job.slug },
    datePosted: job.date_posted,
    ...(job.valid_through ? { validThrough: `${job.valid_through}T23:59:59+07:00` } : {}),
    employmentType: job.work_types,
    ...(job.quantity ? { totalJobOpenings: job.quantity } : {}),
    industry: 'Chăm sóc người cao tuổi',
    directApply: true,
    url: jobUrl(job.slug),
    hiringOrganization: ORG,
    jobLocation: { '@type': 'Place', address: ADDRESS },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}
