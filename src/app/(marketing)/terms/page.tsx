import type { Metadata } from 'next'
import { LaunchLegalPage } from '@/components/marketing/LaunchLegalPage'

export const metadata: Metadata = {
  title: 'Terms of Service | Learnbank',
  description: 'Terms for using the Learnbank website, mobile beta and related learner services.',
}

export default function TermsPage() {
  return <LaunchLegalPage kind="terms" />
}
