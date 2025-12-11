import React from 'react'
import { formatDistanceToNow } from 'date-fns' // Assuming date-fns is installed
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CommentWithAuthor } from '@/actions/community'

interface CommentItemProps {
  comment: CommentWithAuthor
}

export function CommentItem({ comment }: CommentItemProps) {
  return (
    <div className="flex items-start space-x-4 py-4 border-b last:border-b-0">
      <Avatar className="h-9 w-9 border">
        <AvatarImage src={comment.author.avatar || undefined} alt={comment.author.username || 'User'} />
        <AvatarFallback className="bg-secondary text-secondary-foreground">
          {comment.author.username?.[0]?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">{comment.author.username || 'Anonymous'}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </p>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
      </div>
    </div>
  )
}
