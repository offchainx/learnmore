import type { Metadata } from 'next'
import { LaunchLegalPage } from '@/components/marketing/LaunchLegalPage'

export const metadata: Metadata = {
  title: 'Privacy Policy | Learnbank',
  description: 'How Learnbank handles information for its website, mobile beta and related learner services.',
}

export default function PrivacyPage() {
  return <LaunchLegalPage kind="privacy" />
}
