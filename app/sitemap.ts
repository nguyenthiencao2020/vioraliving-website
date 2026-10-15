import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';
import { getActiveJobs } from '@/lib/jobs';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await getActiveJobs();
  return [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
    ...jobs.map(j => ({ url: `${SITE_URL}/viec-lam/${j.slug}`, lastModified: j.date_posted, changeFrequency: 'weekly' as const, priority: 0.8 })),
    { url: `${SITE_URL}/chinh-sach-bao-mat`, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
