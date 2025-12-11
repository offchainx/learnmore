import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/actions/auth'
import { getCategories } from '@/actions/community'
import { PostEditorForm } from '@/components/business/community/PostEditorForm'

export const metadata: Metadata = {
  title: 'New Post - LearnMore',
  description: 'Create a new community post.',
}

export default async function NewPostPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const categories = await getCategories()

  return (
    <div className="container py-6 mx-auto">
      <div className="flex flex-col items-start gap-6 md:flex-row lg:gap-10">
        <main className="flex-1 w-full min-w-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Create New Post</h1>
            <p className="text-muted-foreground mt-1">
              Share your thoughts with the community.
            </p>
          </div>
          <PostEditorForm categories={categories} />
        </main>
      </div>
    </div>
  )
}
