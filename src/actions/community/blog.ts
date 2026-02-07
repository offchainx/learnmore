'use server';

import prisma from '@/lib/prisma';

export async function getBlogPosts() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        isPublished: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
    });
    return { success: true, data: posts };
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    return { success: false, error: 'Failed to fetch posts' };
  }
}

export async function getBlogPostBySlug(slug: string) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: {
        slug,
        isPublished: true,
      },
    });
    return { success: true, data: post };
  } catch (error) {
    console.error(`Failed to fetch blog post ${slug}:`, error);
    return { success: false, error: 'Failed to fetch post' };
  }
}
