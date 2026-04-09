import {
  ChevronDown,
  ChevronUp,
  Crown,
  Filter,
  Minus,
  Sword,
  TriangleAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  pagePanelStrongClass,
  pagePillActiveClass,
  pagePillInactiveClass,
  pageSegmentedButtonCompactClass,
  pageSegmentedControlCompactClass,
  pageSoftInsetClass,
} from '@/components/shared/pageSurfaces'
import {
  pageKickerClass,
  pageMetaTextClass,
  pageNumericValueCompactClass,
  pageSectionTitleClass,
} from '@/components/shared/pageTypography'

type PeriodKey = 'WEEKLY' | 'MONTHLY' | 'ALL_TIME'

interface LeaderboardUser {
  rank: number
  name: string
  xp: number
  avatar: string | null
  trend: 'up' | 'down' | 'same'
  status: 'promotion' | 'demotion' | 'safe'
  isMe?: boolean
  isRival?: boolean
}

interface LeaderboardListProps {
  title: string
  rankLabel: string
  studentLabel: string
  xpLabel: string
  filterLabel: string
  globalLabel: string
  friendsLabel: string
  emptyLabel: string
  loadingLabel: string
  safeZoneLabel: string
  promotionZoneLabel: string
  demotionRiskLabel: string
  youBadge: string
  rivalBadge: string
  meFooterLabel: string
  meGapText: (gap: number, rank: number) => string
  meFallbackText: string
  activeTab: 'global' | 'friends'
  onTabChange: (tab: 'global' | 'friends') => void
  period: PeriodKey
  onPeriodChange: (period: PeriodKey) => void
  periodLabels: Record<PeriodKey, string>
  listData: LeaderboardUser[]
  loading?: boolean
  myGapToPrevious?: number | null
}

export function LeaderboardList({
  title,
  rankLabel,
  studentLabel,
  xpLabel,
  filterLabel,
  globalLabel,
  friendsLabel,
  emptyLabel,
  loadingLabel,
  safeZoneLabel,
  promotionZoneLabel,
  demotionRiskLabel,
  youBadge,
  rivalBadge,
  meFooterLabel,
  meGapText,
  meFallbackText,
  activeTab,
  onTabChange,
  period,
  onPeriodChange,
  periodLabels,
  listData,
  loading = false,
  myGapToPrevious = null,
}: LeaderboardListProps) {
  const currentUser = listData.find((user) => user.isMe)

  const renderInitials = (name: string) =>
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')

  return (
    <div
      className={cn(
        pagePanelStrongClass,
        'flex h-full min-h-[520px] flex-col overflow-hidden rounded-[30px]'
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-borderTone/80 px-5 py-4 dark:border-borderTone">
        <div className="flex items-center gap-3">
          <h3 className={pageSectionTitleClass}>{title}</h3>
          <div className={pageSegmentedControlCompactClass}>
            <button
              type="button"
              onClick={() => onTabChange('global')}
              className={cn(
                pageSegmentedButtonCompactClass,
                'rounded-full text-xs',
                activeTab === 'global'
                  ? `${pagePillActiveClass} shadow-surface`
                  : pagePillInactiveClass
              )}
            >
              {globalLabel}
            </button>
            <button
              type="button"
              onClick={() => onTabChange('friends')}
              className={cn(
                pageSegmentedButtonCompactClass,
                'rounded-full text-xs',
                activeTab === 'friends'
                  ? `${pagePillActiveClass} shadow-surface`
                  : pagePillInactiveClass
              )}
            >
              {friendsLabel}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={pageSegmentedControlCompactClass}>
            {(Object.keys(periodLabels) as PeriodKey[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onPeriodChange(value)}
                className={cn(
                  pageSegmentedButtonCompactClass,
                  'rounded-full text-xs',
                  period === value
                    ? `${pagePillActiveClass} shadow-surface`
                    : pagePillInactiveClass
                )}
              >
                {periodLabels[value]}
              </button>
            ))}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="rounded-full px-3 text-text-secondary hover:text-text-primary dark:text-text-secondary dark:hover:bg-surface-selected dark:hover:text-white"
          >
            <Filter className="mr-1.5 h-4 w-4" />
            {filterLabel}
          </Button>
        </div>
      </div>

      <div
        className={`grid grid-cols-[80px_minmax(0,1fr)_120px] items-center gap-3 border-b border-borderTone/80 px-5 py-3 ${pageKickerClass} dark:border-borderTone`}
      >
        <div className="text-center">{rankLabel}</div>
        <div>{studentLabel}</div>
        <div className="text-right">{xpLabel}</div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-2 px-5 py-4">
            <div className="pb-2 text-sm text-text-secondary dark:text-text-secondary">
              {loadingLabel}
            </div>
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className={cn(
                  pageSoftInsetClass,
                  'grid grid-cols-[80px_minmax(0,1fr)_120px] items-center gap-3 rounded-2xl px-4 py-3'
                )}
              >
                <div className="h-10 w-10 rounded-2xl bg-slate-200/70 dark:bg-surface" />
                <div className="space-y-2">
                  <div className="h-4 w-40 rounded-full bg-slate-200/80 dark:bg-surface" />
                  <div className="h-3 w-28 rounded-full bg-slate-200/60 dark:bg-surface-subtle" />
                </div>
                <div className="ml-auto h-4 w-16 rounded-full bg-slate-200/80 dark:bg-surface" />
              </div>
            ))}
          </div>
        ) : listData.length === 0 ? (
          <div className="px-5 py-8 text-sm text-text-secondary dark:text-text-secondary">
            {emptyLabel}
          </div>
        ) : (
          listData.map((user) => {
            const isPromotion = user.status === 'promotion'
            const isDemotion = user.status === 'demotion'
            const isTopThree = user.rank <= 3

            return (
              <div
                key={`${user.rank}-${user.name}`}
                className={`grid grid-cols-[80px_minmax(0,1fr)_120px] items-center gap-3 border-b border-borderTone/70 px-5 py-3 transition-colors last:border-0 dark:border-borderTone ${
                  user.isMe
                    ? 'bg-blue-100/80 shadow-[inset_4px_0_0_rgba(59,130,246,0.35)] dark:bg-blue-500/10'
                    : 'hover:bg-surface-subtle/80 dark:hover:bg-surface-selected'
                }`}
              >
                <div className="flex flex-col items-center justify-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl border text-sm font-semibold ${
                      isTopThree
                        ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-300/30 dark:bg-amber-400/10 dark:text-amber-100'
                        : user.isMe
                          ? 'border-blue-200 bg-blue-50 text-sky-700 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-sky-100'
                          : 'border-borderTone bg-surface-subtle text-text-secondary dark:border-borderTone dark:bg-surface-subtle dark:text-text-secondary'
                    }`}
                  >
                    {isTopThree ? <Crown className="h-4 w-4" /> : user.rank}
                  </div>
                  <div className="mt-1 flex h-3 items-center text-[10px] font-semibold">
                    {user.trend === 'up' ? (
                      <ChevronUp className="h-3 w-3 text-emerald-400" />
                    ) : null}
                    {user.trend === 'down' ? (
                      <ChevronDown className="h-3 w-3 text-red-400" />
                    ) : null}
                    {user.trend === 'same' ? (
                      <Minus className="h-3 w-3 text-slate-400 dark:text-text-tertiary" />
                    ) : null}
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className={`h-10 w-10 rounded-2xl border object-cover ${
                          user.isMe
                            ? 'border-blue-300/70 dark:border-blue-400/40'
                            : 'border-borderTone dark:border-borderTone'
                        }`}
                      />
                    ) : (
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-2xl border text-[13px] font-semibold ${
                          user.isMe
                            ? 'border-blue-300/70 bg-blue-50 text-sky-700 dark:border-blue-400/40 dark:bg-blue-500/10 dark:text-sky-100'
                            : 'border-borderTone bg-surface-subtle text-text-secondary dark:border-borderTone dark:bg-surface-subtle dark:text-text-secondary'
                        }`}
                      >
                        {renderInitials(user.name)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="truncate text-sm font-semibold text-text-primary dark:text-white">
                          {user.name}
                        </div>
                        {user.isMe ? (
                          <span className="dark:bg-blue-500/18 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-sky-700 dark:text-sky-100">
                            {youBadge}
                          </span>
                        ) : null}
                        {user.isRival ? (
                          <span className="dark:bg-red-500/8 flex shrink-0 items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700 dark:border-red-400/20 dark:text-red-100">
                            <Sword className="h-3 w-3" />
                            {rivalBadge}
                          </span>
                        ) : null}
                      </div>
                      <div
                        className={`mt-1 flex items-center gap-2 ${pageMetaTextClass}`}
                      >
                        {isPromotion ? (
                          <span className="text-emerald-400">
                            {promotionZoneLabel}
                          </span>
                        ) : null}
                        {isDemotion ? (
                          <span className="flex items-center gap-1 text-red-400">
                            <TriangleAlert className="h-3 w-3" />
                            {demotionRiskLabel}
                          </span>
                        ) : null}
                        {!isPromotion && !isDemotion ? (
                          <span>{safeZoneLabel}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`text-right ${pageNumericValueCompactClass}`}>
                  {user.xp.toLocaleString()}
                </div>
              </div>
            )
          })
        )}
      </div>

      {currentUser && !loading ? (
        <div className="dark:bg-blue-500/8 border-t border-blue-200 bg-state-info-bg px-5 py-3 dark:border-blue-400/20">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-text-primary dark:text-white">
                #{currentUser.rank} · {meFooterLabel}
              </div>
              <div className={`mt-1 truncate ${pageMetaTextClass}`}>
                {myGapToPrevious && currentUser.rank > 1
                  ? meGapText(myGapToPrevious, currentUser.rank)
                  : meFallbackText}
              </div>
            </div>
            <div className={pageNumericValueCompactClass}>
              {currentUser.xp.toLocaleString()}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
