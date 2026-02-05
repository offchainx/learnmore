import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help Center | LearnMore',
  description: 'Find answers to common questions about LearnMore. Browse our FAQ, search for guides, or contact our support team for help.',
  openGraph: {
    title: 'Help Center | LearnMore',
    description: 'Get help with LearnMore — browse FAQ, search guides, and reach our support team.',
  },
}

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
