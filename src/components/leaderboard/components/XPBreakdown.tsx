import Link from 'next/link'
import { ArrowUpRight, Award, Flame, Target, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
    <Card className="overflow-hidden rounded-[28px] border border-[#213d71] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.14),_transparent_56%),linear-gradient(180deg,_#07152d_0%,_#071121_100%)] px-5 py-4 text-white shadow-[0_18px_66px_rgba(3,10,28,0.3)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-blue-200/66 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em]">
            <TrendingUp className="h-4 w-4 text-blue-300" />
            {title}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="text-[22px] font-semibold leading-none">
              {levelLabel} {level}
            </div>
            <div className="bg-white/6 text-blue-100/78 rounded-full border border-blue-300/20 px-2.5 py-1 text-[11px] font-medium">
              {unlockedCount}/{totalBadges}
            </div>
          </div>
          <div className="text-blue-100/68 mt-2 text-[13px]">
            {nextLevelText(xpToNextLevel)}
          </div>
        </div>

        <Button
          asChild
          size="sm"
          variant="outline"
          className="h-9 shrink-0 border-blue-300/20 bg-white/5 px-3 text-[13px] text-blue-50 hover:bg-white/10"
        >
          <Link href="/dashboard/achievements">
            {viewAllLabel}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      <div className="mt-4">
        <div className="text-blue-100/62 mb-2 flex items-center justify-between text-[11px]">
          <span>{xpLabel}</span>
          <span>
            {xp}/{nextLevelXp}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#102848]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500"
            style={{ width: `${levelProgress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="border-white/8 rounded-2xl border bg-white/[0.04] px-3 py-2.5">
          <div className="text-blue-100/56 flex items-center gap-1 text-[11px]">
            <Flame className="h-3.5 w-3.5 text-orange-300" />
            <span className="truncate">{streakLabel}</span>
          </div>
          <div className="mt-1 text-[15px] font-semibold">{streak}d</div>
        </div>
        <div className="border-white/8 rounded-2xl border bg-white/[0.04] px-3 py-2.5">
          <div className="text-blue-100/56 flex items-center gap-1 text-[11px]">
            <Target className="h-3.5 w-3.5 text-sky-300" />
            <span className="truncate">{accuracyLabel}</span>
          </div>
          <div className="mt-1 text-[15px] font-semibold">{accuracy}%</div>
        </div>
        <div className="border-white/8 rounded-2xl border bg-white/[0.04] px-3 py-2.5">
          <div className="text-blue-100/56 flex items-center gap-1 text-[11px]">
            <Award className="h-3.5 w-3.5 text-amber-300" />
            <span className="truncate">{unlockedLabel}</span>
          </div>
          <div className="mt-1 text-[15px] font-semibold">{unlockedCount}</div>
        </div>
      </div>

      <div className="border-white/8 mt-4 rounded-[22px] border bg-black/15 px-4 py-3">
        <div className="text-blue-100/56 text-[11px] font-medium">
          {nextFocusLabel}
        </div>
        <div className="mt-1 truncate text-[14px] font-semibold">
          {nextBadgeName || fallbackFocusText}
        </div>
        <div className="text-blue-100/58 mt-1 truncate text-[11px]">
          {recentBadgeName
            ? `${recentUnlockLabel}${recentBadgeName}`
            : fallbackRecentText}
        </div>
      </div>
    </Card>
  )
}
