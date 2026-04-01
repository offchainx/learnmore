import { Metadata } from 'next'
import { getDashboardShellProfile } from '@/actions/user/profile'
import { redirect } from 'next/navigation'
import { CommunityClientWrapper } from './client-wrapper'
import { CommunityView } from '@/components/dashboard/views/CommunityView'
import {
  getCachedCommunityCategories,
  getCachedCommunityFeed,
} from '@/lib/cache/sitewide'

export const metadata: Metadata = {
  title: 'Community - LearnMore',
  description: 'Join the discussion with other students.',
}

export default async function CommunityPage() {
  const profile = await getDashboardShellProfile()

  if (!profile) {
    redirect('/login')
  }

  const [categories, postResult] = await Promise.all([
    getCachedCommunityCategories(),
    getCachedCommunityFeed({ page: 1, limit: 20 }),
  ])

  return (
    <CommunityClientWrapper user={profile}>
      <CommunityView initialPosts={postResult.posts} subjects={categories} />
    </CommunityClientWrapper>
  )
}
