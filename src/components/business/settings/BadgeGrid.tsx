'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Award } from 'lucide-react'
import Image from 'next/image'

// Define the type locally since we might not have it exported from Prisma client in the frontend cleanly without importing client
// But typically we pass the data down.
interface BadgeType {
    id: string
    name: string
    description: string
    icon: string
    code: string
}

interface UserBadgeType {
    awardedAt: Date | string
    badge: BadgeType
}

interface BadgeGridProps {
    badges: UserBadgeType[]
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  if (!badges || badges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground text-sm">
            No badges earned yet. Keep learning to unlock achievements!
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Achievements ({badges.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map((userBadge) => (
            <div 
              key={userBadge.badge.id} 
              className="flex flex-col items-center p-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center mb-3 text-2xl">
                {/* For now, just use an emoji or the icon string if it's an emoji/url */}
                {/* Assuming icon might be an emoji or url. If URL, use img. If emoji, use text. */}
                {userBadge.badge.icon.startsWith('http') ? (
                    <Image src={userBadge.badge.icon} alt={userBadge.badge.name} width={32} height={32} className="h-8 w-8" />
                ) : (
                    <span>{userBadge.badge.icon || '🏅'}</span>
                )}
              </div>
              <h3 className="font-semibold text-sm text-center mb-1">{userBadge.badge.name}</h3>
              <p className="text-xs text-muted-foreground text-center line-clamp-2" title={userBadge.badge.description}>
                {userBadge.badge.description}
              </p>
              <span className="text-[10px] text-slate-400 mt-2">
                {new Date(userBadge.awardedAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
