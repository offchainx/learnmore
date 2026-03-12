import Link from 'next/link'
import { ArrowUpRight, Award, Flame, TrendingUp, Target } from 'lucide-react'
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
}: XPBreakdownProps) {
  const xpToNextLevel = Math.max(nextLevelXp - xp, 0)

  return (
    <Card className="overflow-hidden border border-[#243f73] bg-[radial-gradient(circle_at_top,_rgba(52,123,255,0.18),_transparent_52%),linear-gradient(180deg,_#061630_0%,_#071327_100%)] p-6 text-white shadow-[0_24px_90px_rgba(4,10,24,0.42)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-200/70">
            <TrendingUp className="h-4 w-4 text-blue-300" />
            个人成长总览
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight">
            Lv {level}
          </h3>
          <p className="mt-1 text-sm text-blue-100/70">
            离下一级还差 {xpToNextLevel} XP
          </p>
        </div>
        <div className="rounded-full border border-blue-300/20 bg-white/5 px-3 py-1 text-xs font-medium text-blue-100/80">
          {unlockedCount}/{totalBadges} 徽章
        </div>
      </div>

      <div className="mb-5 flex items-center gap-4">
        <div className="relative h-24 w-24 shrink-0">
          <svg className="h-full w-full -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="#143057"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="#60a5fa"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (251.2 * levelProgress) / 100}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold">
              {Math.round(levelProgress)}%
            </span>
            <span className="text-[11px] text-blue-100/60">升级进度</span>
          </div>
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <div className="mb-2 flex items-center justify-between text-xs text-blue-100/65">
              <span>当前 XP</span>
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
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="border-white/8 rounded-2xl border bg-white/5 px-3 py-2">
              <div className="flex items-center gap-1 text-blue-100/55">
                <Flame className="h-3.5 w-3.5 text-orange-300" />
                连胜
              </div>
              <div className="mt-1 text-sm font-semibold">{streak} 天</div>
            </div>
            <div className="border-white/8 rounded-2xl border bg-white/5 px-3 py-2">
              <div className="flex items-center gap-1 text-blue-100/55">
                <Target className="h-3.5 w-3.5 text-sky-300" />
                正确率
              </div>
              <div className="mt-1 text-sm font-semibold">{accuracy}%</div>
            </div>
            <div className="border-white/8 rounded-2xl border bg-white/5 px-3 py-2">
              <div className="flex items-center gap-1 text-blue-100/55">
                <Award className="h-3.5 w-3.5 text-amber-300" />
                已解锁
              </div>
              <div className="mt-1 text-sm font-semibold">
                {unlockedCount} 枚
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-white/8 rounded-3xl border bg-black/15 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-medium text-blue-100/55">
              下一步重点
            </div>
            <div className="mt-1 text-sm font-semibold">
              {nextBadgeName
                ? `冲刺徽章：${nextBadgeName}`
                : '继续积累 XP，向下一等级推进'}
            </div>
            <div className="mt-1 text-xs text-blue-100/60">
              {recentBadgeName
                ? `最近解锁：${recentBadgeName}`
                : '完成练习、社区互动和连胜都能加速成长。'}
            </div>
          </div>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="border-blue-300/20 bg-white/5 text-blue-50 hover:bg-white/10"
          >
            <Link href="/dashboard/achievements">
              查看全部成就
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}
