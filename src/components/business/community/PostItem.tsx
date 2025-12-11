import Link from 'next/link'
import { MessageSquare, Heart } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { PostWithAuthor } from '@/actions/community'

interface PostItemProps {
  post: PostWithAuthor
}

export function PostItem({ post }: PostItemProps) {
  // Simple time formatting
  const formattedDate = new Date(post.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <Link href={`/dashboard/community/${post.id}`} className="block group">
      <Card className="transition-all duration-200 hover:shadow-md border border-border/40 bg-card/50 hover:bg-card hover:border-border/80">
        <CardHeader className="flex flex-row items-start gap-4 p-5 pb-3">
          <Avatar className="h-10 w-10 border border-border/50">
            <AvatarImage src={post.author.avatar || undefined} alt={post.author.username || 'User'} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {post.author.username?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground hover:underline cursor-pointer">
                {post.author.username || 'Anonymous'}
              </span>
              <span>•</span>
              <span>{formattedDate}</span>
            </div>
            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors truncate">
              {post.title}
            </h3>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {post.content}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {post.subject && (
                <Badge variant="secondary" className="font-normal px-2 py-0.5 bg-secondary/50 hover:bg-secondary">
                  {post.subject.name}
                </Badge>
              )}
              
              <div className="flex items-center gap-1.5 transition-colors group-hover:text-muted-foreground/80">
                <Heart className="h-3.5 w-3.5" />
                <span>{post.likeCount}</span>
              </div>
              
              <div className="flex items-center gap-1.5 transition-colors group-hover:text-muted-foreground/80">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{post._count.comments}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
