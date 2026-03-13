import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertOctagon, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ChapterWithStats } from '@/lib/practice/types';

interface WeaknessCardProps {
  chapters: ChapterWithStats[];
}

const WEAKNESS_PER_PAGE = 4;

export const WeaknessCard = ({ chapters }: WeaknessCardProps) => {
  const router = useRouter();
  const cardClassName =
    'rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))] p-4 text-white shadow-[0_18px_40px_rgba(2,8,23,0.28)]';

  // 筛选薄弱点逻辑：
  // 1. 至少答题 5 次
  // 2. 正确率 < 70%
  // 3. 按正确率升序排序
  const weaknesses = chapters
    .filter(c => c.stats.totalAttempts >= 5 && c.stats.masteryLevel < 70)
    .sort((a, b) => a.stats.masteryLevel - b.stats.masteryLevel);
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(weaknesses.length / WEAKNESS_PER_PAGE));
  const visibleWeaknesses = useMemo(
    () => weaknesses.slice(page * WEAKNESS_PER_PAGE, (page + 1) * WEAKNESS_PER_PAGE),
    [weaknesses, page],
  );

  useEffect(() => {
    setPage(0);
  }, [weaknesses.length]);

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (totalPages <= 1) return;
    event.preventDefault();
    const direction = event.deltaY > 0 ? 1 : -1;
    setPage((prev) => Math.max(0, Math.min(totalPages - 1, prev + direction)));
  };

  if (weaknesses.length === 0) {
    return (
      <Card className={cardClassName}>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
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
        <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-white">
           <AlertOctagon className="w-4 h-4 text-red-500" /> 薄弱点快修
        </h3>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-300">
          {weaknesses.length} 条
        </span>
        </div>
        <p className="mb-3 text-[12px] leading-5 text-slate-400">
          默认展示 4 条，滚动滑鼠滚轮可一次切换下一组薄弱点。
        </p>
        <div className="mb-3 flex gap-1">
          {Array.from({ length: totalPages }).map((_, index) => (
            <span
              key={index}
              className={`h-1.5 rounded-full transition-all ${index === page ? 'w-4 bg-white' : 'w-1.5 bg-white/20'}`}
            />
          ))}
        </div>
        <div className="space-y-2.5" onWheel={handleWheel}>
           {visibleWeaknesses.map((chapter) => (
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
           {visibleWeaknesses.length < WEAKNESS_PER_PAGE &&
            Array.from({ length: WEAKNESS_PER_PAGE - visibleWeaknesses.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="flex h-[68px] items-center justify-center rounded-2xl border border-dashed border-white/8 bg-white/[0.03]"
              >
                <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                  已到列表底部
                </span>
              </div>
            ))}
        </div>
     </Card>
  );
};
