import { TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function XPBreakdown() {
  return (
    <Card className="p-6 bg-slate-900 border-slate-800">
      <h3 className="font-bold text-white mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-blue-500" /> XP Breakdown
      </h3>
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="48" cy="48" r="40" stroke="#1e293b" strokeWidth="8" fill="transparent" />
            <circle cx="48" cy="48" r="40" stroke="#3b82f6" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset="75" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-white">70%</span>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-slate-300">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div> Study
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <div className="w-3 h-3 rounded-full bg-slate-700"></div> Community
          </div>
        </div>
      </div>
    </Card>
  )
}
