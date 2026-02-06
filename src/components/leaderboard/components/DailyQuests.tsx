import { Flame, LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Quest {
  title: string
  xp: number
  progress: number
  total: number
  icon: LucideIcon
  color: string
}

interface DailyQuestsProps {
  quests: Quest[]
}

export function DailyQuests({ quests }: DailyQuestsProps) {
  return (
    <Card className="p-6 bg-slate-900 border-slate-800">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" /> Daily Quests
        </h3>
        <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded">Resets in 4h</span>
      </div>

      <div className="space-y-4">
        {quests.map((q, i) => {
          const QuestIcon = q.icon
          return (
            <div key={i} className="group">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${q.color}`}>
                    <QuestIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{q.title}</div>
                    <div className="text-xs text-slate-500 font-mono">+{q.xp} XP</div>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-xs border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800">
                  {q.progress >= q.total ? 'Claim' : 'Go'}
                </Button>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${q.progress >= q.total ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${(q.progress / q.total) * 100}%` }}
                ></div>
              </div>
              <div className="text-[10px] text-right text-slate-500 mt-1">{q.progress}/{q.total}</div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
