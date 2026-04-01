import Link from 'next/link'
import { ArrowUpRight, Flame, LucideIcon, Sword } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { PageEmptyState } from '@/components/shared/PageEmptyState'
import { cn } from '@/lib/utils'
import {
  pageBadgeClass,
  pageInsetClass,
  pagePanelStrongClass,
  pagePillActiveClass,
  pagePillInactiveClass,
  pageSoftInsetClass,
} from '@/components/shared/pageSurfaces'

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
    <Card className={cn(pagePanelStrongClass, 'rounded-[28px] p-4')}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className={cn(pageSoftInsetClass, 'flex rounded-full p-1')}>
          <button
            type="button"
            onClick={() => onTabChange('challenge')}
            className={cn(
              'rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--page-bg))]',
              activeTab === 'challenge'
                ? pagePillActiveClass
                : pagePillInactiveClass
            )}
          >
            {challengeLabel}
          </button>
          <button
            type="button"
            onClick={() => onTabChange('rival')}
            className={cn(
              'rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--page-bg))]',
              activeTab === 'rival'
                ? pagePillActiveClass
                : pagePillInactiveClass
            )}
          >
            {rivalLabel}
          </button>
        </div>

        {activeTab === 'challenge' ? (
          <span className={pageBadgeClass}>
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
                className={cn(pageInsetClass, 'px-4 py-3')}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${challenge.color}`}
                  >
                    <ChallengeIcon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-semibold leading-none text-text-primary dark:text-white">
                      {challenge.title}
                    </div>
                    <div className="mt-1 truncate text-[13px] text-text-secondary dark:text-text-secondary">
                      {challenge.subtitle}
                    </div>
                    <div className="mt-1 text-[13px] font-medium text-sky-600 dark:text-sky-300">
                      +{challenge.xp} XP
                    </div>
                  </div>
                  <Link
                    href={challenge.href}
                    className={`${buttonVariants({
                      variant: 'secondary',
                      size: 'sm',
                    })} h-9 shrink-0 px-4 text-[13px]`}
                  >
                    {challenge.cta}
                  </Link>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-borderTone/50 dark:bg-surface-selected">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="w-16 text-right text-[12px] text-text-secondary dark:text-text-secondary">
                    {challenge.progress}/{challenge.total}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : rival ? (
        <div className={cn(pageInsetClass, 'px-4 py-4')}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[15px] font-semibold text-text-primary dark:text-white">
              <Sword className="h-5 w-5 text-red-400" />
              {rivalLabel}
            </div>
            <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-medium text-red-700 dark:border-red-400/20 dark:bg-red-500/8 dark:text-red-200/80">
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
              <div className="truncate text-[15px] font-semibold text-text-primary dark:text-white">
                {rival.name}
              </div>
              <div className="mt-1 truncate text-[13px] text-text-secondary dark:text-text-secondary">
                {rivalLeadText(rival.xpGap)}
              </div>
              <div className="mt-1 truncate text-[12px] text-sky-600 dark:text-sky-300">
                {rival.hint}
              </div>
            </div>
          </div>

          <Link
            href={rival.href}
            className={`${buttonVariants({
              variant: 'outline',
              size: 'sm',
            })} mt-4 border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 dark:border-red-500/30 dark:bg-red-500/6 dark:text-red-100 dark:hover:bg-red-500/12 dark:hover:text-white`}
          >
            {rival.cta}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <PageEmptyState
          icon={Sword}
          align="left"
          title={rivalLabel}
          description={rivalEmptyDescription}
          className="px-4 py-4"
          iconClassName="text-red-400"
          actions={
            <Link
              href="/dashboard/practice"
              className={buttonVariants({ variant: 'secondary', size: 'sm' })}
            >
              {rivalEmptyCta}
            </Link>
          }
        />
      )}
    </Card>
  )
}
