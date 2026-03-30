import { Crown } from 'lucide-react'

interface PodiumUser {
  rank: number
  name: string
  xp: number
  avatar: string
  trend: 'up' | 'down' | 'same'
  change: number
  badge: string
}

interface PodiumProps {
  topThree: PodiumUser[]
}

export function Podium({ topThree }: PodiumProps) {
  return (
    <div className="relative pt-8 pb-4">
      {/* Grounding Glow Effect */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none"></div>

      <div className="flex justify-center items-end gap-4 min-h-[220px] px-4 relative z-10">
        {/* Silver - Rank 2 */}
        <div className="flex flex-col items-center group relative z-10 w-1/3 max-w-[130px]">
          <img src={topThree[1].avatar} className="w-16 h-16 rounded-full border-4 border-slate-300 shadow-lg mb-3 object-cover" alt="Rank 2" />
          <div className="w-full h-24 bg-gradient-to-b from-slate-700 to-slate-800 rounded-t-lg border-t border-slate-500/50 flex flex-col items-center pt-2 relative shadow-lg">
            <div className="text-3xl font-black text-white/20">2</div>
            <div className="absolute bottom-3 text-xs font-bold text-slate-300">{topThree[1].name}</div>
          </div>
        </div>

        {/* Gold - Rank 1 */}
        <div className="flex flex-col items-center group relative z-20 w-1/3 max-w-[150px]">
          <Crown className="w-8 h-8 text-yellow-400 absolute -top-10 animate-bounce" />
          <img src={topThree[0].avatar} className="w-20 h-20 rounded-full border-4 border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.4)] mb-4 object-cover" alt="Rank 1" />
          <div className="w-full h-32 bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-t-lg border-t border-yellow-400/50 flex flex-col items-center pt-2 relative overflow-hidden shadow-xl shadow-yellow-900/20">
            {/* Promotion Hint */}
            <div className="absolute top-0 w-full h-1 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
            <div className="text-4xl font-black text-white/30 relative z-10">1</div>
            <div className="absolute bottom-4 text-sm font-bold text-yellow-100 relative z-10">{topThree[0].name}</div>
          </div>
        </div>

        {/* Bronze - Rank 3 */}
        <div className="flex flex-col items-center group relative z-10 w-1/3 max-w-[130px]">
          <img src={topThree[2].avatar} className="w-16 h-16 rounded-full border-4 border-orange-700 shadow-lg mb-3 object-cover" alt="Rank 3" />
          <div className="w-full h-20 bg-gradient-to-b from-orange-800 to-orange-900 rounded-t-lg border-t border-orange-600/50 flex flex-col items-center pt-2 relative shadow-lg">
            <div className="text-3xl font-black text-white/20">3</div>
            <div className="absolute bottom-3 text-xs font-bold text-orange-200">{topThree[2].name}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
