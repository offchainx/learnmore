import { Metadata } from 'next'
import { getProfile } from '@/actions/user/profile'
import { getPosts } from '@/actions/community/post'
import { redirect } from 'next/navigation'
import { CommunityClientWrapper } from './client-wrapper'
import { CommunityView } from '@/components/dashboard/views/CommunityView'

export const metadata: Metadata = {
  title: 'Community - LearnMore',
  description: 'Join the discussion with other students.',
}

export default async function CommunityPage() {
  const profile = await getProfile()

  if (!profile) {
    redirect('/login')
  }

  const initialFeed = await getPosts({
    unanswered: false,
    page: 1,
    limit: 20,
  })

  return (
    <CommunityClientWrapper user={profile}>
      <CommunityView
        initialPosts={initialFeed.posts}
        initialTab="latest"
      />
    </CommunityClientWrapper>
  )
}
