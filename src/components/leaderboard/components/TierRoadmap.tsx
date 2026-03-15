import { cn } from '@/lib/utils'
import { pageBadgeClass, pagePanelStrongClass } from '@/components/shared/pageSurfaces'
import {
  pageKickerClass,
  pageSectionDescriptionClass,
} from '@/components/shared/pageTypography'

const tierStyles = [
  {
    chip: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-[#7a5a3a]/50 dark:bg-[#24160e] dark:text-[#d9b38c]',
    dot: 'bg-amber-500 dark:bg-[#b47c42]',
  },
  {
    chip: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-borderTone dark:bg-surface-subtle dark:text-text-secondary',
    dot: 'bg-slate-400 dark:bg-text-secondary',
  },
  {
    chip: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/45 dark:bg-amber-500/12 dark:text-amber-100',
    dot: 'bg-amber-500 dark:bg-amber-300',
  },
  {
    chip: 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-400/45 dark:bg-cyan-500/10 dark:text-cyan-100',
    dot: 'bg-cyan-500 dark:bg-cyan-300',
  },
  {
    chip: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-400/45 dark:bg-sky-500/12 dark:text-sky-100',
    dot: 'bg-sky-500 dark:bg-sky-300',
  },
  {
    chip: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-purple-400/45 dark:bg-purple-500/10 dark:text-purple-100',
    dot: 'bg-violet-500 dark:bg-purple-300',
  },
] as const

interface TierRoadmapProps {
  tiers: string[]
  currentTierIndex: number
  title: string
  currentTierLabel: string
  standingLabel: string
  promotionLabel: string
}

export function TierRoadmap({
  tiers,
  currentTierIndex,
  title,
  currentTierLabel,
  standingLabel,
  promotionLabel,
}: TierRoadmapProps) {
  return (
    <div className={cn(pagePanelStrongClass, 'overflow-hidden rounded-[28px] px-5 py-4')}>
      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-center">
        <div>
          <div className={pageKickerClass}>
            {title}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={cn(pageBadgeClass, 'text-sm font-semibold')}>
              {currentTierLabel}
            </span>
            <span className="text-sm text-text-secondary dark:text-text-secondary">{standingLabel}</span>
          </div>
          <p className={`mt-2 ${pageSectionDescriptionClass}`}>
            {promotionLabel}
          </p>
        </div>

        <div className="grid grid-cols-6 gap-2">
          {tiers.map((tier, index) => {
            const style = tierStyles[index] ?? tierStyles[0]
            const isCurrent = index === currentTierIndex
            const isUnlocked = index < currentTierIndex

            return (
              <div key={tier} className="relative">
                <div
                  className={`rounded-[20px] border px-3 py-3 text-center text-xs font-semibold transition-all ${
                    isCurrent
                      ? `${style.chip} shadow-[0_0_22px_rgba(96,165,250,0.12)] ring-1 ring-blue-100 dark:ring-white/10`
                      : isUnlocked
                        ? 'border-borderTone bg-surface text-text-secondary dark:border-borderTone dark:bg-surface dark:text-text-secondary'
                        : 'border-borderTone bg-surface-subtle text-text-tertiary dark:border-borderTone dark:bg-surface-subtle dark:text-text-tertiary'
                  }`}
                >
                  <div className="mx-auto flex h-2 w-2 items-center justify-center rounded-full bg-slate-200 dark:bg-surface-selected">
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${isCurrent || isUnlocked ? style.dot : 'bg-slate-400 dark:bg-text-tertiary'}`}
                    />
                  </div>
                  <div className="mt-2 truncate">{tier}</div>
                </div>
                {index < tiers.length - 1 ? (
                  <div className="absolute left-[calc(100%-4px)] top-1/2 hidden h-[2px] w-2 -translate-y-1/2 bg-borderTone dark:bg-surface-selected lg:block" />
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
