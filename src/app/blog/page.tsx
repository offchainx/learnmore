import { getBlogPosts } from '@/actions/blog';
import { BlogList } from '@/components/blog/blog-list';

export default async function BlogPage() {
  const { data: posts } = await getBlogPosts();

  return <BlogList initialPosts={posts || []} />;
}
