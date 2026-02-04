import { Metadata } from 'next'
import { getProfile } from '@/actions/profile'
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

  return (
    <CommunityClientWrapper user={profile}>
      <CommunityView />
    </CommunityClientWrapper>
  )
}
