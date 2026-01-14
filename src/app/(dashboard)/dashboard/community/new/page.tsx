import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/actions/auth'

export const metadata: Metadata = {
  title: 'New Post - LearnMore',
  description: 'Create a new community post.',
}

export default async function NewPostPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Redirect to main community page for now (old PostEditorForm was deleted)
  redirect('/dashboard/community')
}
