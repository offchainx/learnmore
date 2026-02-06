import { Sword } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function RivalWatch() {
  return (
    <Card className="p-0 overflow-hidden bg-slate-900 border-slate-800 relative group cursor-pointer hover:border-red-500/50 transition-colors">
      <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors"></div>
      <div className="p-5 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Sword className="w-4 h-4 text-red-500" /> Rival Watch
          </h3>
          <span className="text-[10px] font-bold text-red-400 animate-pulse">CATCH UP!</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <img src="https://i.pravatar.cc/150?u=11" className="w-12 h-12 rounded-full border-2 border-red-500/50" alt="Rival" />
            <div className="absolute -bottom-1 -right-1 bg-red-600 text-[10px] text-white px-1.5 rounded border border-red-400">#10</div>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-200">Ryan G.</div>
            <div className="text-xs text-slate-400">is only <span className="text-white font-bold">50 XP</span> ahead.</div>
            <div className="text-xs text-blue-400 mt-1 hover:underline">View Profile &gt;</div>
          </div>
        </div>
      </div>
    </Card>
  )
}
