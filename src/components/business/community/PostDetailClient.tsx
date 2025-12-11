'use client'

import React, { useState, useTransition } from 'react'
import { format } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle } from 'lucide-react'
import { PostWithAuthorAndComments, toggleLike } from '@/actions/community' // Import toggleLike
import { unified } from 'unified'
import parse from 'rehype-parse'
import rehypeReact from 'rehype-react'
import { Fragment, jsx, jsxs } from 'react/jsx-runtime'

import { CommentItem } from './CommentItem' // Import CommentItem
import { CommentForm } from './CommentForm' // Import CommentForm
import { useRouter } from 'next/navigation' // For refreshing comments

interface PostDetailClientProps {
  post: PostWithAuthorAndComments
}

const TextRenderer = unified()
  .use(parse, { fragment: true })
  .use(rehypeReact, { Fragment, jsx, jsxs, components: {} })

export function PostDetailClient({ post: initialPost }: PostDetailClientProps) {
  const [post, setPost] = useState(initialPost)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleLike = () => {
    if (isPending) return; // Prevent multiple clicks

    startTransition(async () => {
      // Optimistic UI update
      setPost(prevPost => ({
        ...prevPost,
        likeCount: prevPost.likeCount + 1, // Simple increment for now
      }));

      const result = await toggleLike(post.id);

      if (!result.success) {
        // Revert optimistic update on failure
        setPost(initialPost); // Or more sophisticated revert logic
        // Optionally show a toast for error
      }
      // No need to update state if success, as optimistic update is already applied
      // But we could refetch to ensure consistency if needed, e.g., router.refresh()
    });
  };

  const handleCommentPosted = () => {
    // Refresh the page to refetch comments
    router.refresh();
  };


  return (
    <div className="bg-card p-6 rounded-lg shadow-sm">
      {/* Post Header */}
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-12 w-12 border">
          <AvatarImage src={post.author.avatar || undefined} alt={post.author.username || 'User'} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {post.author.username?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-bold">{post.title}</h2>
          <div className="flex items-center text-sm text-muted-foreground">
            <span>By {post.author.username || 'Anonymous'}</span>
            <span className="mx-2">•</span>
            <span>{format(new Date(post.createdAt), 'MMM dd, yyyy HH:mm')}</span>
            {post.subject && (
              <>
                <span className="mx-2">•</span>
                <Badge variant="secondary" className="font-normal px-2 py-0.5 bg-secondary/50 hover:bg-secondary">
                  {post.subject.name}
                </Badge>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="prose dark:prose-invert max-w-none pb-6 mb-6 border-b">
        {TextRenderer.processSync(post.content).result}
      </div>

      {/* Post Actions (Likes and Comments Count) */}
      <div className="flex items-center gap-4 text-muted-foreground border-b pb-6 mb-6">
        <button
          onClick={handleLike}
          disabled={isPending}
          className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Heart className="h-5 w-5" />
          <span>{post.likeCount} Likes</span>
        </button>
        <div className="flex items-center gap-1">
          <MessageCircle className="h-5 w-5" />
          <span>{post.comments.length} Comments</span>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Comments ({post.comments.length})</h3>
        <CommentForm postId={post.id} onCommentPosted={handleCommentPosted} />
        <div className="divide-y divide-border/50">
          {post.comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
          {post.comments.length === 0 && (
            <p className="text-muted-foreground text-sm py-4">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>
    </div>
  )
}