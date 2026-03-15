import Link from 'next/link'
import { ArrowUpRight, Award, Flame, Target, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  pageBadgeClass,
  pageInsetClass,
  pagePanelStrongClass,
  pageSoftInsetClass,
} from '@/components/shared/pageSurfaces'
import {
  pageKickerClass,
  pageMetaTextClass,
  pageNumericValueCompactClass,
} from '@/components/shared/pageTypography'

interface XPBreakdownProps {
  level: number
  xp: number
  nextLevelXp: number
  levelProgress: number
  unlockedCount: number
  totalBadges: number
  streak: number
  accuracy: number
  recentBadgeName?: string | null
  nextBadgeName?: string | null
  title: string
  levelLabel: string
  xpLabel: string
  streakLabel: string
  accuracyLabel: string
  unlockedLabel: string
  nextFocusLabel: string
  recentUnlockLabel: string
  viewAllLabel: string
  nextLevelText: (xpToNext: number) => string
  fallbackFocusText: string
  fallbackRecentText: string
}

export function XPBreakdown({
  level,
  xp,
  nextLevelXp,
  levelProgress,
  unlockedCount,
  totalBadges,
  streak,
  accuracy,
  recentBadgeName,
  nextBadgeName,
  title,
  levelLabel,
  xpLabel,
  streakLabel,
  accuracyLabel,
  unlockedLabel,
  nextFocusLabel,
  recentUnlockLabel,
  viewAllLabel,
  nextLevelText,
  fallbackFocusText,
  fallbackRecentText,
}: XPBreakdownProps) {
  const xpToNextLevel = Math.max(nextLevelXp - xp, 0)

  return (
    <Card className={cn(pagePanelStrongClass, 'overflow-hidden rounded-[28px] px-5 py-4')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={`flex items-center gap-2 ${pageKickerClass}`}>
            <TrendingUp className="h-4 w-4 text-sky-500 dark:text-sky-300" />
            {title}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className={`${pageNumericValueCompactClass} leading-none`}>
              {levelLabel} {level}
            </div>
            <div className={pageBadgeClass}>
              {unlockedCount}/{totalBadges}
            </div>
          </div>
          <div className={pageMetaTextClass}>
            {nextLevelText(xpToNextLevel)}
          </div>
        </div>

        <Button
          asChild
          size="sm"
          variant="secondary"
          className="h-9 shrink-0 px-3 text-[13px]"
        >
          <Link href="/dashboard/achievements">
            {viewAllLabel}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      <div className="mt-4">
        <div className={`mb-2 flex items-center justify-between ${pageKickerClass}`}>
          <span>{xpLabel}</span>
          <span>
            {xp}/{nextLevelXp}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-borderTone/50 dark:bg-surface-selected">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500"
            style={{ width: `${levelProgress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className={cn(pageSoftInsetClass, 'px-3 py-2.5')}>
          <div className={`flex items-center gap-1 ${pageKickerClass}`}>
            <Flame className="h-3.5 w-3.5 text-orange-400 dark:text-orange-300" />
            <span className="truncate">{streakLabel}</span>
          </div>
          <div className="mt-1 text-[15px] font-semibold text-text-primary dark:text-white">{streak}d</div>
        </div>
        <div className={cn(pageSoftInsetClass, 'px-3 py-2.5')}>
          <div className={`flex items-center gap-1 ${pageKickerClass}`}>
            <Target className="h-3.5 w-3.5 text-sky-500 dark:text-sky-300" />
            <span className="truncate">{accuracyLabel}</span>
          </div>
          <div className="mt-1 text-[15px] font-semibold text-text-primary dark:text-white">{accuracy}%</div>
        </div>
        <div className={cn(pageSoftInsetClass, 'px-3 py-2.5')}>
          <div className={`flex items-center gap-1 ${pageKickerClass}`}>
            <Award className="h-3.5 w-3.5 text-amber-500 dark:text-amber-300" />
            <span className="truncate">{unlockedLabel}</span>
          </div>
          <div className="mt-1 text-[15px] font-semibold text-text-primary dark:text-white">{unlockedCount}</div>
        </div>
      </div>

      <div className={cn(pageInsetClass, 'mt-4 px-4 py-3')}>
        <div className={pageKickerClass}>
          {nextFocusLabel}
        </div>
        <div className="mt-1 truncate text-[14px] font-semibold text-text-primary dark:text-white">
          {nextBadgeName || fallbackFocusText}
        </div>
        <div className={`mt-1 truncate ${pageKickerClass}`}>
          {recentBadgeName
            ? `${recentUnlockLabel}${recentBadgeName}`
            : fallbackRecentText}
        </div>
      </div>
    </Card>
  )
}
