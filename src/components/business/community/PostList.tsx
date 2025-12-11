import { PostItem } from './PostItem'
import type { PostWithAuthor } from '@/actions/community'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PostListProps {
  posts: PostWithAuthor[]
  metadata: {
    page: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  baseUrl: string
  currentCategory?: string
}

export function PostList({ posts, metadata, baseUrl, currentCategory }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-card/50 border-dashed">
        <h3 className="mt-4 text-lg font-semibold">No posts found</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Be the first to start a conversation in this topic!
        </p>
        <Button>Create Post</Button>
      </div>
    )
  }

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams()
    if (currentCategory) params.set('category', currentCategory)
    params.set('page', page.toString())
    return `${baseUrl}?${params.toString()}`
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {posts.map((post) => (
          <PostItem key={post.id} post={post} />
        ))}
      </div>
      
      {/* Pagination Controls */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          Page {metadata.page} of {metadata.totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!metadata.hasPrevPage}
            asChild={metadata.hasPrevPage}
          >
            {metadata.hasPrevPage ? (
              <Link href={createPageUrl(metadata.page - 1)}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Link>
            ) : (
              <span>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </span>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!metadata.hasNextPage}
            asChild={metadata.hasNextPage}
          >
            {metadata.hasNextPage ? (
              <Link href={createPageUrl(metadata.page + 1)}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            ) : (
              <span>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
