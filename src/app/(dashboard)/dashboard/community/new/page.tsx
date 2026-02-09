import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getProfile } from '@/actions/user/profile'
import { CommunityClientWrapper } from '../client-wrapper'
import { NewPostPageClient } from '@/components/community/NewPostPageClient'
import { getCategories } from '@/actions/community/post'

export const metadata: Metadata = {
  title: 'New Post - LearnMore',
  description: 'Create a new community post.',
}

export default async function NewPostPage() {
  const profile = await getProfile()

  if (!profile) {
    redirect('/login')
  }

  const categories = await getCategories()
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
