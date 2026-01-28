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

  // 筛选薄弱点逻辑：
  // 1. 至少答题 5 次
  // 2. 正确率 < 70%
  // 3. 按正确率升序排序
  const weaknesses = chapters
    .filter(c => c.stats.totalAttempts >= 5 && c.stats.masteryLevel < 70)
    .sort((a, b) => a.stats.masteryLevel - b.stats.masteryLevel)
    .slice(0, 3); // Top 3

  if (weaknesses.length === 0) {
    // 如果没有明显的薄弱点，可以不显示，或者显示一个"做得好"的状态
    // 这里为了 UI 布局稳定，显示一个占位或者"暂无薄弱点"
    return (
      <Card className="p-5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/50 rounded-3xl">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
           <AlertOctagon className="w-4 h-4 text-green-500" /> Weakness Quick Fix
        </h3>
        <div className="text-center py-4 text-slate-500 text-sm">
          No weakness detected yet. Keep practicing!
        </div>
      </Card>
    );
  }

  return (
     <Card className="p-5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/50 rounded-3xl">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
           <AlertOctagon className="w-4 h-4 text-red-500" /> Weakness Quick Fix
        </h3>
        <div className="space-y-3">
           {weaknesses.map((chapter) => (
              <div 
                key={chapter.id} 
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group cursor-pointer"
                onClick={() => router.push(`/dashboard/practice/chapter-drill/${chapter.id}`)}
              >
                 <div className="flex-1 min-w-0 pr-2">
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-red-500 transition-colors truncate">
                      {chapter.title}
                    </div>
                    <div className="text-[10px] text-red-500 font-bold uppercase">
                      {chapter.stats.masteryLevel}% Proficiency
                    </div>
                 </div>
                 <Button 
                    size="sm" 
                    className="h-7 px-3 text-[10px] font-black uppercase bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-transparent hover:bg-red-600 hover:text-white rounded-lg transition-all shrink-0"
                 >
                    Fix <Play className="w-2.5 h-2.5 ml-1 fill-current" />
                 </Button>
              </div>
           ))}
        </div>
     </Card>
  );
};
