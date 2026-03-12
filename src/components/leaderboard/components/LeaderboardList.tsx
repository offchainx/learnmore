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

type PeriodKey = 'WEEKLY' | 'MONTHLY' | 'ALL_TIME'

interface LeaderboardUser {
  rank: number
  name: string
  xp: number
  avatar: string
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

  return (
    <div className="flex h-full min-h-[520px] flex-col overflow-hidden rounded-[30px] border border-[#21395f] bg-[#07111f] shadow-[0_18px_70px_rgba(3,10,28,0.3)]">
      <div className="border-white/8 flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <div className="border-white/8 flex rounded-full border bg-white/[0.04] p-1">
            <button
              onClick={() => onTabChange('global')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeTab === 'global'
                  ? 'bg-white text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {globalLabel}
            </button>
            <button
              onClick={() => onTabChange('friends')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeTab === 'friends'
                  ? 'bg-white text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {friendsLabel}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="border-white/8 flex rounded-full border bg-white/[0.04] p-1">
            {(Object.keys(periodLabels) as PeriodKey[]).map((value) => (
              <button
                key={value}
                onClick={() => onPeriodChange(value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  period === value
                    ? 'bg-blue-500 text-white shadow-[0_8px_20px_rgba(59,130,246,0.28)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {periodLabels[value]}
              </button>
            ))}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="rounded-full px-3 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <Filter className="mr-1.5 h-4 w-4" />
            {filterLabel}
          </Button>
        </div>
      </div>

      <div className="border-white/8 grid grid-cols-[80px_minmax(0,1fr)_120px] items-center gap-3 border-b px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
        <div className="text-center">{rankLabel}</div>
        <div>{studentLabel}</div>
        <div className="text-right">{xpLabel}</div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-2 px-5 py-4">
            <div className="pb-2 text-sm text-slate-400">{loadingLabel}</div>
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="border-white/6 grid grid-cols-[80px_minmax(0,1fr)_120px] items-center gap-3 rounded-2xl border bg-white/[0.02] px-4 py-3"
              >
                <div className="bg-white/6 h-10 w-10 rounded-2xl" />
                <div className="space-y-2">
                  <div className="bg-white/6 h-4 w-40 rounded-full" />
                  <div className="h-3 w-28 rounded-full bg-white/5" />
                </div>
                <div className="bg-white/6 ml-auto h-4 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : listData.length === 0 ? (
          <div className="px-5 py-8 text-sm text-slate-400">{emptyLabel}</div>
        ) : (
          listData.map((user) => {
            const isPromotion = user.status === 'promotion'
            const isDemotion = user.status === 'demotion'
            const isTopThree = user.rank <= 3

            return (
              <div
                key={`${user.rank}-${user.name}`}
                className={`border-white/6 grid grid-cols-[80px_minmax(0,1fr)_120px] items-center gap-3 border-b px-5 py-3 transition-colors last:border-0 ${
                  user.isMe ? 'bg-blue-500/10' : 'hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex flex-col items-center justify-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl border text-sm font-semibold ${
                      isTopThree
                        ? 'border-amber-300/30 bg-amber-400/10 text-amber-100'
                        : user.isMe
                          ? 'border-blue-400/30 bg-blue-500/10 text-blue-100'
                          : 'border-white/8 bg-white/[0.03] text-slate-200'
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
                      <Minus className="h-3 w-3 text-slate-600" />
                    ) : null}
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className={`h-10 w-10 rounded-2xl border object-cover ${
                        user.isMe ? 'border-blue-400/40' : 'border-white/8'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="truncate text-sm font-semibold text-white">
                          {user.name}
                        </div>
                        {user.isMe ? (
                          <span className="bg-blue-500/18 rounded-full px-2 py-0.5 text-[10px] font-medium text-blue-100">
                            {youBadge}
                          </span>
                        ) : null}
                        {user.isRival ? (
                          <span className="bg-red-500/8 flex shrink-0 items-center gap-1 rounded-full border border-red-400/20 px-2 py-0.5 text-[10px] font-medium text-red-100">
                            <Sword className="h-3 w-3" />
                            {rivalBadge}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
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

                <div className="text-right text-sm font-semibold text-slate-100">
                  {user.xp.toLocaleString()}
                </div>
              </div>
            )
          })
        )}
      </div>

      {currentUser && !loading ? (
        <div className="bg-blue-500/8 border-t border-blue-400/20 px-5 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white">
                #{currentUser.rank} · {meFooterLabel}
              </div>
              <div className="text-blue-100/72 mt-1 truncate text-xs">
                {myGapToPrevious && currentUser.rank > 1
                  ? meGapText(myGapToPrevious, currentUser.rank)
                  : meFallbackText}
              </div>
            </div>
            <div className="text-sm font-semibold text-white">
              {currentUser.xp.toLocaleString()}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
