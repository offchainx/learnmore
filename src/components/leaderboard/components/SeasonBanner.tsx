import { Clock, LucideIcon } from 'lucide-react'

interface SeasonBannerProps {
  seasonData: {
    name: string
    theme: string
    bonus: string
    endsIn: string
    color: string
    border: string
    icon: LucideIcon
  }
}

export function SeasonBanner({ seasonData }: SeasonBannerProps) {
  const SeasonIcon = seasonData.icon

  return (
    <div className={`w-full rounded-2xl border p-1 bg-gradient-to-r ${seasonData.color} ${seasonData.border}`}>
      <div className="bg-slate-900/90 backdrop-blur rounded-xl p-4 px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <SeasonIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{seasonData.name}</h3>
              <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded animate-pulse">LIVE</span>
            </div>
            <p className="text-sm text-orange-200 font-medium">{seasonData.bonus}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-black/20 rounded-lg px-4 py-2 border border-white/5">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Season Ends In</div>
            <div className="font-mono text-xl font-bold text-white tabular-nums">{seasonData.endsIn}</div>
          </div>
          <Clock className="w-5 h-5 text-slate-500" />
        </div>
      </div>
    </div>
  )
}
