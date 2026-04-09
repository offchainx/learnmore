'use client'

import React, { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeroShell } from '@/components/shared/PageHeroShell'
import { PageHeroTitle } from '@/components/shared/PageHeroTitle'
import { SectionBlockHeader } from '@/components/shared/SectionBlockHeader'
import {
  pageCardTitleClass,
  pageDisplayTitleClass,
  pageMetaTextClass,
  pageNumericValueCompactClass,
  pageSectionDescriptionClass,
} from '@/components/shared/pageTypography'
import {
  pageEmptyStateClass,
  pageHeroShellClass,
  pagePanelClass,
  pagePillActiveClass,
  pagePillInactiveClass,
  pageShellFrameClass,
} from '@/components/shared/pageSurfaces'
import {
  pageCardPaddingClass,
  pageGridGapClass,
  pageSectionGapClass,
} from '@/components/shared/pageSpacing'
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
import { cn } from '@/lib/utils'
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

function getInitials(name: string | null) {
  if (!name) return 'U'
  const trimmed = name.trim()
  if (!trimmed) return 'U'

  return trimmed
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2)
}

export const AchievementsView = ({
  user,
  overview,
  badges,
}: AchievementsViewProps) => {
  const [tab, setTab] = useState<'all' | 'unlocked' | 'locked'>('all')

  const filteredBadges = useMemo(() => {
    if (tab === 'unlocked') return badges.filter((b) => b.unlocked)
    if (tab === 'locked') return badges.filter((b) => !b.unlocked)
    return badges
  }, [badges, tab])

  const unlockedCount = badges.filter((b) => b.unlocked).length
  const completionRate =
    badges.length > 0 ? Math.round((unlockedCount / badges.length) * 100) : 0

  return (
    <div className="animate-fade-in-up pb-12">
      <div className={`${pageShellFrameClass} ${pageSectionGapClass} sm:p-2.5`}>
        <PageHeroShell
          className={pageHeroShellClass}
          title={
            <PageHeroTitle title="成就中心" capsuleLabel="Achievement Vault" />
          }
          subtitle={
            user.username
              ? `查看 ${user.username} 的成长记录、徽章解锁进度与下一步可冲刺的目标。`
              : '查看真实成长记录、徽章解锁进度与下一步可冲刺的目标。'
          }
          titleClassName="font-semibold"
          actions={null}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-borderTone bg-surface text-lg font-black text-text-primary dark:border-borderTone dark:bg-surface-subtle dark:text-text-primary">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username ? `${user.username} avatar` : 'user avatar'}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span>{getInitials(user.username)}</span>
              )}
            </div>
            <div className="flex-1">
              <div className={pageDisplayTitleClass}>
                {user.username || '你的账号'}
              </div>
              <p className={`mt-1 ${pageSectionDescriptionClass}`}>
                成就完成度 {completionRate}% · 已解锁 {unlockedCount}/
                {badges.length}
              </p>
            </div>
          </div>
        </PageHeroShell>

        <Card className={cn(pagePanelClass, pageCardPaddingClass)}>
          <div className="flex items-center justify-between gap-3">
            <SectionBlockHeader
              title="成长摘要"
              description="从连胜、题量、正确率和学习时长看本阶段表现。"
              className="flex-1 gap-2"
            />
          </div>
        </Card>

        <dl className={`grid grid-cols-2 md:grid-cols-4 ${pageGridGapClass}`}>
          {[
            {
              label: '连胜',
              value: overview ? `${overview.streak} 天` : '—',
              icon: Flame,
            },
            {
              label: '练习题数',
              value: overview ? `${overview.questions}` : '—',
              icon: Brain,
            },
            {
              label: '正确率',
              value: overview ? `${overview.accuracy}%` : '—',
              icon: Target,
            },
            {
              label: '学习时长',
              value: overview ? `${overview.hours} h` : '—',
              icon: Clock,
            },
          ].map((item) => (
            <div
              key={item.label}
              className={cn(pagePanelClass, pageCardPaddingClass)}
            >
              <dt className="sr-only">{item.label}</dt>
              <item.icon
                aria-hidden="true"
                className="mb-2 h-5 w-5 text-blue-500"
              />
              <dd className={pageNumericValueCompactClass}>{item.value}</dd>
              <div className={`mt-1 ${pageMetaTextClass}`}>{item.label}</div>
            </div>
          ))}
        </dl>

        <Card className={cn(pagePanelClass, pageCardPaddingClass)}>
          <div className="mb-4 flex items-start justify-between gap-4">
            <SectionBlockHeader
              title="徽章墙"
              description="按已解锁和未解锁状态查看当前阶段最值得冲刺的徽章。"
              className="flex-1 gap-2"
            />
            <div className="flex items-center gap-2" role="group" aria-label="徽章筛选">
              {(['all', 'unlocked', 'locked'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTab(value)}
                  aria-pressed={tab === value}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--page-bg))]',
                    tab === value ? pagePillActiveClass : pagePillInactiveClass
                  )}
                >
                  {value === 'all'
                    ? '全部'
                    : value === 'unlocked'
                      ? '已解锁'
                      : '未解锁'}
                </button>
              ))}
            </div>
          </div>

          {filteredBadges.length === 0 ? (
            <div
              className={cn(
                pageEmptyStateClass,
                'text-sm text-text-secondary dark:text-text-secondary'
              )}
            >
              暂无符合条件的徽章。
            </div>
          ) : (
            <div
              className={cn(
                'grid',
                pageGridGapClass,
                filteredBadges.length === 1 && 'max-w-[420px] grid-cols-1',
                filteredBadges.length === 2 &&
                  'max-w-[860px] grid-cols-1 sm:grid-cols-2',
                filteredBadges.length >= 3 &&
                  'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              )}
            >
              {filteredBadges.map((badge) => {
                const Icon = ICON_MAP[badge.icon] || Award
                return (
                  <div
                    key={badge.id}
                    className={cn(
                      'rounded-[22px] p-4 transition-colors',
                      badge.unlocked
                        ? 'dark:bg-emerald-900/12 border border-emerald-200 bg-emerald-50/70 dark:border-emerald-800'
                        : 'border border-slate-200 bg-slate-100/80 text-text-secondary dark:border-slate-700 dark:bg-surface-subtle dark:text-text-secondary'
                    )}
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-full border',
                          badge.unlocked
                            ? 'border-emerald-200 bg-white/90 dark:border-emerald-700 dark:bg-surface'
                            : 'border-slate-200 bg-white/80 dark:border-slate-700 dark:bg-surface-subtle'
                        )}
                      >
                        {badge.unlocked ? (
                          <Icon className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <Lock className="h-5 w-5 text-slate-500 dark:text-text-tertiary" />
                        )}
                      </div>
                      <Badge variant={badge.unlocked ? 'success' : 'neutral'}>
                        {badge.unlocked ? '已解锁' : '未解锁'}
                      </Badge>
                    </div>
                    <h4 className={pageCardTitleClass}>{badge.name}</h4>
                    <p className={`mt-1 ${pageMetaTextClass}`}>
                      {badge.description}
                    </p>
                    {badge.condition ? (
                      <p
                        className={`mt-2 ${pageMetaTextClass} text-text-tertiary dark:text-text-tertiary`}
                      >
                        条件：{badge.condition}
                      </p>
                    ) : null}
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
