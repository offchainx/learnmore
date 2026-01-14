import { Metadata } from 'next'
import { getProfile } from '@/actions/profile'
import { redirect } from 'next/navigation'
import { KnowledgeGraphClientWrapper } from './client-wrapper'

export const metadata: Metadata = {
  title: 'Knowledge Graph - LearnMore',
  description: 'Visualize your learning progress and knowledge connections.',
}

export default async function KnowledgeGraphPage() {
  const profile = await getProfile()

  if (!profile) {
    redirect('/login')
  }

  return <KnowledgeGraphClientWrapper />
}
