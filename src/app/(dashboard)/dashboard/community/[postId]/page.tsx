import { redirect } from 'next/navigation'
import { Metadata } from 'next'

interface PostDetailPageProps {
  params: Promise<{ postId: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Post Detail",
  };
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  await params;

  // Redirect to main community page for now (old PostDetailClient was deleted)
  redirect('/dashboard/community')
}
