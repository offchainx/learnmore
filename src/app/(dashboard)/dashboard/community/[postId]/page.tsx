import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { getProfile } from '@/actions/user/profile'
import { getPostById } from '@/actions/community/post'
import { CommunityClientWrapper } from '../client-wrapper'
import { PostDetailClient } from '@/components/community/PostDetailClient'
import { Card } from '@/components/ui/card'

interface PostDetailPageProps {
  params: Promise<{ postId: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Post Detail",
  };
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const profile = await getProfile()
  if (!profile) {
    redirect('/login')
  }

  const { postId } = await params
  const post = await getPostById(postId)

  if (!post) {
    return (
      <CommunityClientWrapper user={profile}>
        <Card className="p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900">
          <h2 className="text-lg font-semibold mb-2">帖子不存在或已删除</h2>
          <p className="text-sm text-slate-500 mb-4">请返回社区列表查看其他内容。</p>
          <Link href="/dashboard/community" className="text-sm text-blue-600 hover:underline">
            返回社区
          </Link>
        </Card>
      </CommunityClientWrapper>
    )
  }

  return (
    <CommunityClientWrapper user={profile}>
      <PostDetailClient
        initialPost={{
          id: post.id,
          title: post.title,
          content: post.content,
          category: post.category,
          tags: post.tags,
          createdAt: post.createdAt,
          author: post.author,
          comments: post.comments,
          likeCount: post.likeCount,
          userLiked: post.userLiked,
        }}
      />
    </CommunityClientWrapper>
  )
}
