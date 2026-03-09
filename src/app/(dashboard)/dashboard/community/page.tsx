import { Metadata } from 'next'
import { getDashboardProfile } from '@/actions/user/profile'
import { redirect } from 'next/navigation'
import { CommunityClientWrapper } from './client-wrapper'
import { CommunityView } from '@/components/dashboard/views/CommunityView'

export const metadata: Metadata = {
  title: 'Community - LearnMore',
  description: 'Join the discussion with other students.',
}

export default async function CommunityPage() {
  const profile = await getDashboardProfile()

  if (!profile) {
    redirect('/login')
  }

  return (
    <CommunityClientWrapper user={profile}>
      <CommunityView initialTab="latest" />
    </CommunityClientWrapper>
  )
}
