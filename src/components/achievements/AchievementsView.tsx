'use client'

import React, { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Award,
  Brain,
  Clock,
  Flame,
  MessageSquare,
  Star,
  Target,
  Trophy,
  Lock,
} from 'lucide-react'
import type {
  AchievementOverview,
  BadgeWithUnlockStatus,
} from '@/lib/gamification/achievements-types'

interface AchievementsViewProps {
  user: {
    username: string | null
    avatar: string | null
  }
  overview: AchievementOverview | null
  badges: BadgeWithUnlockStatus[]
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Target,
  Brain,
  Flame,
  MessageSquare,
  Award,
  Trophy,
  Star,
}

export const AchievementsView = ({ user, overview, badges }: AchievementsViewProps) => {
  const [tab, setTab] = useState<'all' | 'unlocked' | 'locked'>('all')

  const filteredBadges = useMemo(() => {
    if (tab === 'unlocked') return badges.filter((b) => b.unlocked)
    if (tab === 'locked') return badges.filter((b) => !b.unlocked)
    return badges
  }, [badges, tab])

  const unlockedCount = badges.filter((b) => b.unlocked).length
  const completionRate = badges.length > 0 ? Math.round((unlockedCount / badges.length) * 100) : 0

  return (
    <div className="space-y-6 pb-12 animate-fade-in-up">
      <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <img
            src={user.avatar || 'https://i.pravatar.cc/160?u=achievement-user'}
            alt="avatar"
            className="w-16 h-16 rounded-full object-cover border border-slate-200 dark:border-slate-700"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{user.username || 'Student'}</h2>
            <p className="text-sm text-slate-500">成就完成度 {completionRate}% · 已解锁 {unlockedCount}/{badges.length}</p>
          </div>
          <Badge variant="secondary" className="w-fit">
            <Award className="w-3.5 h-3.5 mr-1" /> Achievement MVP
          </Badge>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '连胜', value: `${overview?.streak ?? 0} 天`, icon: Flame },
          { label: '练习题数', value: `${overview?.questions ?? 0}`, icon: Brain },
          { label: '正确率', value: `${overview?.accuracy ?? 0}%`, icon: Target },
          { label: '学习时长', value: `${overview?.hours ?? '0.0'} h`, icon: Clock },
        ].map((item) => (
          <Card key={item.label} className="p-4 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900">
            <item.icon className="w-5 h-5 text-blue-500 mb-2" />
            <div className="text-xl font-bold text-slate-900 dark:text-white">{item.value}</div>
            <div className="text-xs text-slate-500 mt-1">{item.label}</div>
          </Card>
        ))}
      </div>

      <Card className="p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">徽章墙</h3>
          <div className="flex items-center gap-2">
            {(['all', 'unlocked', 'locked'] as const).map((value) => (
              <button
                key={value}
                onClick={() => setTab(value)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                  tab === value
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-black'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700'
                }`}
              >
                {value === 'all' ? '全部' : value === 'unlocked' ? '已解锁' : '未解锁'}
              </button>
            ))}
          </div>
        </div>

        {filteredBadges.length === 0 ? (
          <div className="text-sm text-slate-500">暂无符合条件的徽章。</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBadges.map((badge) => {
              const Icon = ICON_MAP[badge.icon] || Award
              return (
                <div
                  key={badge.id}
                  className={`rounded-xl border p-4 transition-colors ${
                    badge.unlocked
                      ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-800 dark:bg-emerald-900/10'
                      : 'border-slate-200 bg-slate-50/60 dark:border-slate-700 dark:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {badge.unlocked ? (
                        <Icon className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Lock className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <Badge variant={badge.unlocked ? 'default' : 'secondary'}>
                      {badge.unlocked ? '已解锁' : '未解锁'}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{badge.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{badge.description}</p>
                  {badge.condition ? <p className="text-xs text-slate-400 mt-2">条件：{badge.condition}</p> : null}
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
