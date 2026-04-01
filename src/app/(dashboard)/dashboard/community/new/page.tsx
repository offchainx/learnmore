import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getDashboardShellProfile } from '@/actions/user/profile'
import { CommunityClientWrapper } from '../client-wrapper'
import { NewPostPageClient } from '@/components/community/NewPostPageClient'
import { getCachedCommunityCategories } from '@/lib/cache/sitewide'

export const metadata: Metadata = {
  title: 'New Post - LearnMore',
  description: 'Create a new community post.',
}

export default async function NewPostPage() {
  const profile = await getDashboardShellProfile()

  if (!profile) {
    redirect('/login')
  }

  const categories = await getCachedCommunityCategories()
  const subjects = categories.map((item) => ({
    id: item.id,
    name: item.name,
  }))

  return (
    <CommunityClientWrapper user={profile}>
      <NewPostPageClient subjects={subjects} />
    </CommunityClientWrapper>
  )
}
