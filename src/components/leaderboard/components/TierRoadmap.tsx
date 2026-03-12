import { CircleCheck, ArrowUpRight } from 'lucide-react'

interface TierRoadmapProps {
  tiers: string[]
  currentTierIndex: number
  standingLabel?: string
  promotionLabel?: string
}

export function TierRoadmap({
  tiers,
  currentTierIndex,
  standingLabel = '当前排名等待载入',
  promotionLabel = '先进入榜单再冲击更高段位',
}: TierRoadmapProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
      <div className="relative z-10 flex items-center justify-between">
        {tiers.map((tier, i) => {
          const isActive = i === currentTierIndex
          const isPast = i < currentTierIndex
          return (
            <div
              key={tier}
              className="group relative flex flex-1 flex-col items-center gap-2"
            >
              {/* Connecting Line */}
              {i !== tiers.length - 1 && (
                <div
                  className={`absolute left-1/2 top-4 -z-10 h-1 w-full ${i < currentTierIndex ? 'bg-blue-600' : 'bg-slate-800'}`}
                ></div>
              )}

              {/* Node */}
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300 ${
                  isActive
                    ? 'scale-125 border-blue-400 bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]'
                    : isPast
                      ? 'border-blue-600 bg-slate-800 text-blue-500'
                      : 'border-slate-700 bg-slate-900 text-slate-600'
                } `}
              >
                {isPast ? <CircleCheck className="h-4 w-4" /> : i + 1}
              </div>

              <span
                className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-white' : 'text-slate-500'}`}
              >
                {tier}
              </span>
            </div>
          )
        })}
      </div>

      {/* Progress Info */}
      <div className="mt-6 flex justify-center">
        <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/80 px-4 py-1.5 text-xs font-medium text-slate-300">
          <span>
            当前站位：
            <span className="font-bold text-white">{standingLabel}</span>
          </span>
          <span className="h-1 w-1 rounded-full bg-slate-500"></span>
          <span className="flex items-center gap-1 text-blue-400">
            <ArrowUpRight className="h-3 w-3" /> {promotionLabel}
          </span>
        </div>
      </div>
    </div>
  )
}
