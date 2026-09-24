import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help Center',
  description: 'Find answers to common questions about Learnbank.ai. Browse our FAQ, search for guides, or contact our support team for help.',
  openGraph: {
    title: 'Help Center | Learnbank.ai',
    description: 'Get help with Learnbank.ai — browse FAQ, search guides, and reach our support team.',
  },
}

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
