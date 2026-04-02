import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { getDashboardShellProfile } from '@/actions/user/profile'
import { getPostById } from '@/actions/community/post'
import { CommunityClientWrapper } from '../client-wrapper'
import { PostDetailClient } from '@/components/community/PostDetailClient'
import { Card } from '@/components/ui/card'

interface PostDetailPageProps {
  params: Promise<{ postId: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Post Detail',
  }
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const profile = await getDashboardShellProfile()
  if (!profile) {
    redirect('/login')
  }

  const { postId } = await params
  const post = await getPostById(postId)

  if (!post) {
    return (
      <CommunityClientWrapper user={profile}>
        <Card className="rounded-[30px] border border-[#203964] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.14),_transparent_52%),linear-gradient(180deg,_#07152d_0%,_#071121_100%)] p-6 text-white shadow-[0_20px_70px_rgba(3,10,28,0.25)]">
          <h2 className="mb-2 text-xl font-semibold text-white">
            帖子不存在或已删除
          </h2>
          <p className="text-blue-100/64 mb-4 text-sm leading-6">
            这条讨论可能已被移除，或者你访问的链接已经失效。
          </p>
          <Link
            href="/dashboard/community"
            className="text-sm font-medium text-sky-200 hover:text-white"
          >
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
          attachments: post.attachments,
          mentionedHandles: post.mentionedHandles,
          isPrivate: post.isPrivate,
          createdAt: post.createdAt,
          author: post.author,
          comments: post.comments,
          likeCount: post.likeCount,
          userLiked: post.userLiked,
          isSolved: post.isSolved,
        }}
        currentUserId={profile.id}
        currentUserRole={profile.role}
      />
    </CommunityClientWrapper>
  )
}
