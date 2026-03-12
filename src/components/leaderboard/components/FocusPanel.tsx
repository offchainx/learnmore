import Link from 'next/link'
import { ArrowUpRight, Flame, LucideIcon, Sword } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ChallengeItem {
  title: string
  subtitle: string
  xp: number
  progress: number
  total: number
  href: string
  cta: string
  icon: LucideIcon
  color: string
}

interface RivalTarget {
  name: string
  rank: number
  xpGap: number
  avatar: string
  hint: string
  href: string
  cta: string
}

interface FocusPanelProps {
  activeTab: 'challenge' | 'rival'
  onTabChange: (tab: 'challenge' | 'rival') => void
  challengeLabel: string
  rivalLabel: string
  challengeBadge: string
  challenges: ChallengeItem[]
  rival: RivalTarget | null
  rivalEmptyDescription: string
  rivalEmptyCta: string
  rivalLeadText: (gap: number) => string
}

export function FocusPanel({
  activeTab,
  onTabChange,
  challengeLabel,
  rivalLabel,
  challengeBadge,
  challenges,
  rival,
  rivalEmptyDescription,
  rivalEmptyCta,
  rivalLeadText,
}: FocusPanelProps) {
  return (
    <Card className="rounded-[28px] border border-[#203964] bg-[#07152a] p-4 text-white shadow-[0_16px_60px_rgba(4,10,24,0.3)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="border-white/8 flex rounded-full border bg-white/[0.04] p-1">
          <button
            onClick={() => onTabChange('challenge')}
            className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
              activeTab === 'challenge'
                ? 'bg-white text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {challengeLabel}
          </button>
          <button
            onClick={() => onTabChange('rival')}
            className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
              activeTab === 'rival'
                ? 'bg-white text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {rivalLabel}
          </button>
        </div>

        {activeTab === 'challenge' ? (
          <span className="text-blue-100/64 truncate rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium">
            {challengeBadge}
          </span>
        ) : null}
      </div>

      {activeTab === 'challenge' ? (
        <div className="space-y-3">
          {challenges.map((challenge) => {
            const ChallengeIcon = challenge.icon
            const progressPercent =
              challenge.total > 0
                ? (challenge.progress / challenge.total) * 100
                : 0

            return (
              <div
                key={`${challenge.title}-${challenge.href}`}
                className="border-white/8 rounded-[22px] border bg-white/[0.03] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${challenge.color}`}
                  >
                    <ChallengeIcon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-semibold leading-none">
                      {challenge.title}
                    </div>
                    <div className="text-blue-100/66 mt-1 truncate text-[13px]">
                      {challenge.subtitle}
                    </div>
                    <div className="mt-1 text-[13px] font-medium text-sky-300">
                      +{challenge.xp} XP
                    </div>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-9 shrink-0 border-slate-700 bg-black/30 px-4 text-[13px] text-slate-100 hover:bg-slate-900 hover:text-white"
                  >
                    <Link href={challenge.href}>{challenge.cta}</Link>
                  </Button>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="text-blue-100/56 w-16 text-right text-[12px]">
                    {challenge.progress}/{challenge.total}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : rival ? (
        <div className="border-white/8 rounded-[22px] border bg-white/[0.03] px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[15px] font-semibold">
              <Sword className="h-5 w-5 text-red-400" />
              {rivalLabel}
            </div>
            <span className="bg-red-500/8 rounded-full border border-red-400/20 px-2.5 py-1 text-[10px] font-medium text-red-200/80">
              #{rival.rank}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <img
              src={rival.avatar}
              alt={rival.name}
              className="h-12 w-12 rounded-2xl border border-red-400/30 object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-semibold">
                {rival.name}
              </div>
              <div className="text-blue-100/66 mt-1 truncate text-[13px]">
                {rivalLeadText(rival.xpGap)}
              </div>
              <div className="mt-1 truncate text-[12px] text-blue-300">
                {rival.hint}
              </div>
            </div>
          </div>

          <Button
            asChild
            size="sm"
            variant="outline"
            className="bg-red-500/6 hover:bg-red-500/12 mt-4 border-red-500/30 text-red-100 hover:text-white"
          >
            <Link href={rival.href}>
              {rival.cta}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.02] px-4 py-4">
          <div className="flex items-center gap-2 text-[15px] font-semibold text-white/90">
            <Sword className="h-5 w-5 text-red-400" />
            {rivalLabel}
          </div>
          <p className="text-blue-100/68 mt-3 text-[13px] leading-6">
            {rivalEmptyDescription}
          </p>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="mt-4 border-slate-700 bg-black/30 text-slate-100 hover:bg-slate-900 hover:text-white"
          >
            <Link href="/dashboard/practice">{rivalEmptyCta}</Link>
          </Button>
        </div>
      )}
    </Card>
  )
}
