import {
  ChevronUp,
  ChevronDown,
  Minus,
  Sword,
  ChevronsUp,
  AlertTriangle,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

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
  listData: LeaderboardUser[]
  activeTab: 'global' | 'friends'
  onTabChange: (tab: 'global' | 'friends') => void
  myGapToPrevious?: number | null
}

export function LeaderboardList({
  listData,
  activeTab,
  onTabChange,
  myGapToPrevious = null,
}: LeaderboardListProps) {
  const currentUser = listData.find((u) => u.isMe)

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex rounded-xl border border-slate-800 bg-slate-900 p-1">
          <button
            onClick={() => onTabChange('global')}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-colors ${activeTab === 'global' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}
          >
            全站
          </button>
          <button
            onClick={() => onTabChange('friends')}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-colors ${activeTab === 'friends' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}
          >
            同学
          </button>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="text-slate-400 hover:text-white"
        >
          <Filter className="mr-2 h-4 w-4" /> 筛选
        </Button>
      </div>

      {/* The List Container */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 grid grid-cols-12 gap-4 border-b border-slate-800 bg-slate-950/50 p-4 text-xs font-bold uppercase tracking-wider text-slate-500 backdrop-blur-md">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-7">Student</div>
          <div className="col-span-3 text-right">XP</div>
        </div>

        {/* Rows */}
        <div className="h-[600px] overflow-y-auto">
          {listData.map((user, i) => {
            const isPromotion = user.status === 'promotion'
            const isDemotion = user.status === 'demotion'

            return (
              <div
                key={i}
                className={`relative grid grid-cols-12 items-center gap-4 border-b border-slate-800/50 p-4 transition-all duration-200 last:border-0 ${user.isMe ? 'bg-blue-500/10 hover:bg-blue-500/20' : 'hover:bg-slate-800/50'} ${isPromotion ? 'bg-emerald-500/5' : ''} ${isDemotion ? 'bg-red-500/5' : ''} `}
              >
                {/* Zone Indicators */}
                {isPromotion && (
                  <div className="absolute bottom-0 left-0 top-0 w-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                )}
                {isDemotion && (
                  <div className="absolute bottom-0 left-0 top-0 w-1 bg-red-500"></div>
                )}

                <div className="col-span-2 flex flex-col items-center justify-center">
                  <span
                    className={`text-base font-bold ${user.isMe ? 'text-blue-400' : 'text-slate-300'}`}
                  >
                    {user.rank}
                  </span>
                  <div
                    className={`flex items-center text-[10px] font-bold ${user.trend === 'up' ? 'text-emerald-500' : user.trend === 'down' ? 'text-red-500' : 'text-slate-600'}`}
                  >
                    {user.trend === 'up' && <ChevronUp className="h-3 w-3" />}
                    {user.trend === 'down' && (
                      <ChevronDown className="h-3 w-3" />
                    )}
                    {user.trend === 'same' && <Minus className="h-3 w-3" />}
                  </div>
                </div>

                <div className="col-span-7 flex items-center gap-3">
                  <img
                    src={user.avatar}
                    className={`h-9 w-9 rounded-full border object-cover ${user.isMe ? 'border-blue-500' : 'border-slate-700'}`}
                    alt={user.name}
                  />
                  <div className="min-w-0">
                    <div
                      className={`flex items-center gap-2 truncate text-sm font-bold ${user.isMe ? 'text-white' : 'text-slate-300'}`}
                    >
                      {user.name}
                      {user.isMe && (
                        <span className="rounded bg-blue-600 px-1.5 text-[9px] font-normal text-white">
                          YOU
                        </span>
                      )}
                      {user.isRival && (
                        <span className="flex items-center gap-1 rounded border border-red-800 bg-red-900/50 px-1.5 text-[9px] font-normal text-red-400">
                          <Sword className="h-2 w-2" /> 追赶目标
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      {isPromotion && (
                        <span className="flex items-center gap-0.5 text-emerald-500">
                          <ChevronsUp className="h-3 w-3" /> 晋级区
                        </span>
                      )}
                      {isDemotion && (
                        <span className="flex items-center gap-0.5 text-red-500">
                          <AlertTriangle className="h-3 w-3" /> 降级风险
                        </span>
                      )}
                      {!isPromotion && !isDemotion && <span>稳定区</span>}
                    </div>
                  </div>
                </div>

                <div className="col-span-3 text-right font-mono font-bold text-slate-300">
                  {user.xp.toLocaleString()}
                </div>
              </div>
            )
          })}
        </div>

        {/* Sticky User Footer */}
        {currentUser && (
          <div className="sticky bottom-0 z-20 border-t-2 border-blue-500 bg-slate-900 p-3 shadow-2xl">
            <div className="grid grid-cols-12 items-center gap-4">
              <div className="col-span-2 text-center text-lg font-bold text-white">
                {currentUser.rank}
              </div>
              <div className="col-span-7 flex items-center gap-3">
                <img
                  src={currentUser.avatar}
                  className="h-10 w-10 rounded-full border-2 border-blue-400"
                  alt="Me"
                />
                <div>
                  <div className="text-sm font-bold text-white">你</div>
                  <div className="text-xs font-medium text-blue-400">
                    {myGapToPrevious && currentUser.rank > 1
                      ? `还差 ${myGapToPrevious} XP 追上第 ${currentUser.rank - 1} 名`
                      : '继续完成挑战，保持当前势头'}
                  </div>
                </div>
              </div>
              <div className="col-span-3 text-right font-mono text-lg font-bold text-white">
                {currentUser.xp.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
