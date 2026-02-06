import { CircleCheck, ArrowUpRight } from 'lucide-react'

interface TierRoadmapProps {
  tiers: string[]
  currentTierIndex: number
}

export function TierRoadmap({ tiers, currentTierIndex }: TierRoadmapProps) {
  return (
    <div className="w-full bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 p-6 relative overflow-hidden">
      <div className="flex justify-between items-center relative z-10">
        {tiers.map((tier, i) => {
          const isActive = i === currentTierIndex
          const isPast = i < currentTierIndex
          return (
            <div key={tier} className="flex flex-col items-center gap-2 flex-1 relative group">
              {/* Connecting Line */}
              {i !== tiers.length - 1 && (
                <div className={`absolute top-4 left-1/2 w-full h-1 -z-10 ${i < currentTierIndex ? 'bg-blue-600' : 'bg-slate-800'}`}></div>
              )}

              {/* Node */}
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-xs transition-all duration-300
                ${isActive
                  ? 'bg-blue-600 border-blue-400 text-white scale-125 shadow-[0_0_15px_rgba(37,99,235,0.5)]'
                  : isPast
                    ? 'bg-slate-800 border-blue-600 text-blue-500'
                    : 'bg-slate-900 border-slate-700 text-slate-600'}
              `}>
                {isPast ? <CircleCheck className="w-4 h-4" /> : i + 1}
              </div>

              <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-white' : 'text-slate-500'}`}>
                {tier}
              </span>
            </div>
          )
        })}
      </div>

      {/* Progress Info */}
      <div className="mt-6 flex justify-center">
        <div className="bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700 text-xs font-medium text-slate-300 flex items-center gap-2">
          <span>Current Standing: <span className="text-white font-bold">Top 12%</span></span>
          <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
          <span className="text-blue-400 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> 150 XP to Promotion</span>
        </div>
      </div>
    </div>
  )
}
