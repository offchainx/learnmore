import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://learnbank.net';

  // Base routes
  const routes = [
    '',
    '/about-us',
    '/pricing',
    '/blog',
    '/how-it-works',
    '/student-care',
    '/study-guides',
    '/subjects',
    '/success-stories',
    '/contact',
    '/help',
    '/terms',
    '/privacy',
    '/refund',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
