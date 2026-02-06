import { ChevronUp, ChevronDown, Minus, Sword, ChevronsUp, AlertTriangle, Filter } from 'lucide-react'
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
}

export function LeaderboardList({ listData, activeTab, onTabChange }: LeaderboardListProps) {
  const currentUser = listData.find(u => u.isMe)

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onTabChange('global')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${activeTab === 'global' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}
          >
            Global
          </button>
          <button
            onClick={() => onTabChange('friends')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${activeTab === 'friends' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}
          >
            Friends
          </button>
        </div>
        <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white"><Filter className="w-4 h-4 mr-2" /> Filters</Button>
      </div>

      {/* The List Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-800 bg-slate-950/50 text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
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
                className={`
                  grid grid-cols-12 gap-4 p-4 items-center transition-all duration-200 border-b border-slate-800/50 last:border-0 relative
                  ${user.isMe ? 'bg-blue-500/10 hover:bg-blue-500/20' : 'hover:bg-slate-800/50'}
                  ${isPromotion ? 'bg-emerald-500/5' : ''}
                  ${isDemotion ? 'bg-red-500/5' : ''}
                `}
              >
                {/* Zone Indicators */}
                {isPromotion && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>}
                {isDemotion && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>}

                <div className="col-span-2 flex flex-col items-center justify-center">
                  <span className={`font-bold text-base ${user.isMe ? 'text-blue-400' : 'text-slate-300'}`}>{user.rank}</span>
                  <div className={`text-[10px] font-bold flex items-center ${user.trend === 'up' ? 'text-emerald-500' : user.trend === 'down' ? 'text-red-500' : 'text-slate-600'}`}>
                    {user.trend === 'up' && <ChevronUp className="w-3 h-3" />}
                    {user.trend === 'down' && <ChevronDown className="w-3 h-3" />}
                    {user.trend === 'same' && <Minus className="w-3 h-3" />}
                  </div>
                </div>

                <div className="col-span-7 flex items-center gap-3">
                  <img src={user.avatar} className={`w-9 h-9 rounded-full object-cover border ${user.isMe ? 'border-blue-500' : 'border-slate-700'}`} alt={user.name} />
                  <div className="min-w-0">
                    <div className={`font-bold text-sm truncate flex items-center gap-2 ${user.isMe ? 'text-white' : 'text-slate-300'}`}>
                      {user.name}
                      {user.isMe && <span className="bg-blue-600 text-[9px] px-1.5 rounded text-white font-normal">YOU</span>}
                      {user.isRival && <span className="bg-red-900/50 text-red-400 text-[9px] px-1.5 rounded border border-red-800 font-normal flex items-center gap-1"><Sword className="w-2 h-2" /> RIVAL</span>}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      {isPromotion && <span className="text-emerald-500 flex items-center gap-0.5"><ChevronsUp className="w-3 h-3" /> Promotion Zone</span>}
                      {isDemotion && <span className="text-red-500 flex items-center gap-0.5"><AlertTriangle className="w-3 h-3" /> Demotion Risk</span>}
                      {!isPromotion && !isDemotion && <span>Safe Zone</span>}
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
          <div className="sticky bottom-0 bg-slate-900 border-t-2 border-blue-500 p-3 shadow-2xl z-20">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-2 text-center font-bold text-white text-lg">{currentUser.rank}</div>
              <div className="col-span-7 flex items-center gap-3">
                <img src={currentUser.avatar} className="w-10 h-10 rounded-full border-2 border-blue-400" alt="Me" />
                <div>
                  <div className="font-bold text-white text-sm">You</div>
                  <div className="text-xs text-blue-400 font-medium">550 XP to Rank {currentUser.rank - 1}</div>
                </div>
              </div>
              <div className="col-span-3 text-right font-bold text-white text-lg font-mono">
                {currentUser.xp.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
