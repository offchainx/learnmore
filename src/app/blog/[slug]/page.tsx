import { getBlogPostBySlug } from '@/actions/blog';
import { notFound } from 'next/navigation';
import { BlogDetailClient } from '@/components/blog/blog-detail';
import { Metadata } from 'next';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const { data: post } = await getBlogPostBySlug(slug);
  
  if (!post) {
    return {
      title: 'Post Not Found - Learn More',
    };
  }

  return {
    title: `${post.title} - Learn More Blog`,
    description: post.excerpt || post.content.substring(0, 160),
    openGraph: {
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const { data: post } = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return <BlogDetailClient post={post} />;
}
