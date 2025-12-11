import { notFound } from 'next/navigation'
import { getPostById } from '@/actions/community'
import { PostDetailClient } from '@/components/business/community/PostDetailClient'
import { Metadata } from 'next'

interface PostDetailPageProps {
  params: Promise<{ postId: string }>
}

export async function generateMetadata({ params }: PostDetailPageProps): Promise<Metadata> {
  const { postId } = await params;
  const post = await getPostById(postId);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.content.substring(0, 150),
    openGraph: {
      title: post.title,
      description: post.content.substring(0, 150),
      // Add image if available in post content
      // images: [post.imageUrl], 
    },
  };
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { postId } = await params;
  const post = await getPostById(postId)

  if (!post) {
    notFound()
  }

  return (
    <div className="container py-6 mx-auto">
      <PostDetailClient post={post} />
    </div>
  )
}
