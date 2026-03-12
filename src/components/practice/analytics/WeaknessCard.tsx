import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertOctagon, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ChapterWithStats } from '@/lib/practice/types';

interface WeaknessCardProps {
  chapters: ChapterWithStats[];
}

export const WeaknessCard = ({ chapters }: WeaknessCardProps) => {
  const router = useRouter();
  const cardClassName =
    'rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))] p-5 text-white shadow-[0_20px_48px_rgba(2,8,23,0.3)]';

  // 筛选薄弱点逻辑：
  // 1. 至少答题 5 次
  // 2. 正确率 < 70%
  // 3. 按正确率升序排序
  const weaknesses = chapters
    .filter(c => c.stats.totalAttempts >= 5 && c.stats.masteryLevel < 70)
    .sort((a, b) => a.stats.masteryLevel - b.stats.masteryLevel)
    .slice(0, 3); // Top 3

  if (weaknesses.length === 0) {
    return (
      <Card className={cardClassName}>
        <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
           <AlertOctagon className="w-4 h-4 text-green-500" /> 薄弱点快修
        </h3>
        <div className="py-4 text-center text-sm text-slate-400">
          当前没有明显薄弱点，继续保持练习节奏。
        </div>
      </Card>
    );
  }

  return (
     <Card className={cardClassName}>
        <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
           <AlertOctagon className="w-4 h-4 text-red-500" /> 薄弱点快修
        </h3>
        <div className="space-y-3">
           {weaknesses.map((chapter) => (
              <div 
                key={chapter.id} 
                className="group flex cursor-pointer items-center justify-between rounded-2xl border border-white/8 bg-white/5 p-3 transition-all hover:border-red-500/20 hover:bg-white/8"
                onClick={() => router.push(`/dashboard/practice/chapter-drill/${chapter.id}`)}
              >
                 <div className="flex-1 min-w-0 pr-2">
                    <div className="truncate text-sm font-bold text-white transition-colors group-hover:text-red-200">
                      {chapter.title}
                    </div>
                    <div className="mt-1 text-[10px] font-bold uppercase text-red-300">
                      掌握度 {chapter.stats.masteryLevel}%
                    </div>
                 </div>
                 <Button 
                    size="sm" 
                    className="h-8 shrink-0 rounded-xl border border-red-500/20 bg-red-500/10 px-3 text-[10px] font-black uppercase text-red-200 transition-all hover:bg-red-500 hover:text-white"
                 >
                    去补强 <Play className="w-2.5 h-2.5 ml-1 fill-current" />
                 </Button>
              </div>
           ))}
        </div>
     </Card>
  );
};
