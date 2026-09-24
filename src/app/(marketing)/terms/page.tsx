import type { Metadata } from 'next'
import { LaunchLegalPage } from '@/components/marketing/LaunchLegalPage'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms for using the Learnbank.ai website, mobile beta and related learner services.',
}

export default function TermsPage() {
  return <LaunchLegalPage kind="terms" />
}
