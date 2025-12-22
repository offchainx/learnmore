import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://learnmore.ai';

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
    '/login',
    '/register',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic routes (Blog Posts)
  try {
    const posts = await prisma.blogPost.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    });

    const blogRoutes = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

    return [...routes, ...blogRoutes];
  } catch (error) {
    console.error('Error generating sitemap dynamic routes:', error);
    return routes;
  }
}
