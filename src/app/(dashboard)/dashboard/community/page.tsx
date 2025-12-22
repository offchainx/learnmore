import { Suspense } from 'react'
import { Metadata } from 'next'
import { getCategories, getPosts } from '@/actions/community'
import { CategorySidebar } from '@/components/business/community/CategorySidebar'
import { PostList } from '@/components/business/community/PostList'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Community - LearnMore',
  description: 'Join the discussion with other students.',
}

// Define props type correctly for Next.js Page
interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CommunityPage({ searchParams }: PageProps) {
  // Await searchParams
  const params = await searchParams

  const subjectId = typeof params.subject === 'string' ? params.subject : undefined
  const type = typeof params.type === 'string' ? params.type : undefined
  const unanswered = params.unanswered === 'true'
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1

  // Parallel fetching
  const [categories, postsData] = await Promise.all([
    getCategories(),
    getPosts({
      subjectId,
      category: type,
      unanswered,
      page,
      limit: 10
    })
  ])

  return (
    <div className="container py-6 mx-auto">
      <div className="flex flex-col items-start gap-6 md:flex-row lg:gap-10">
        <aside className="w-full md:w-[220px] lg:w-[260px] shrink-0 sticky top-20">
          <CategorySidebar categories={categories} />
        </aside>
        
        <main className="flex-1 w-full min-w-0">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Community</h1>
              <p className="text-muted-foreground mt-1">
                Discuss, ask questions, and share knowledge.
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/community/new">
                <Plus className="mr-2 h-4 w-4" />
                New Post
              </Link>
            </Button>
          </div>
          
          <Suspense fallback={<div>Loading posts...</div>}>
             <PostList
               posts={postsData.posts}
               metadata={postsData.metadata}
               baseUrl="/dashboard/community"
               currentSubject={subjectId}
               currentType={type}
               unanswered={unanswered}
             />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
