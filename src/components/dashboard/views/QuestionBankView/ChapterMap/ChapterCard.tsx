import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Flame, AlertOctagon } from 'lucide-react';
import type { DbChapter } from '../types';

interface ChapterCardProps {
  chapter: DbChapter;
  absoluteIndex: number;
}

export const ChapterCard: React.FC<ChapterCardProps> = ({ chapter, absoluteIndex }) => {
  const router = useRouter();
  const mastery = chapter.stats.masteryLevel;
  const stars = mastery >= 80 ? 3 : mastery >= 50 ? 2 : mastery > 0 ? 1 : 0;
  
  // HOT: 7天内 > 10次答题且正确率 < 70%
  const isHotspot = (chapter.stats.recentAttempts || 0) > 10 && (chapter.stats.recentCorrectRate || 0) < 70;
  
  // WEAK: 30天正确率 < 60%
  const isWeakness = (chapter.stats.monthlyCorrectRate || 0) < 60 && (chapter.stats.totalAttempts > 0);

  return (
    <Card className="p-4 flex items-center justify-between hover:border-blue-500/30 transition-all group rounded-2xl hover:shadow-md dark:hover:shadow-blue-900/10 cursor-default">
      <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-1 w-10">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">CH</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{String(absoluteIndex + 1).padStart(2, '0')}</div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-slate-900 dark:text-white text-base line-clamp-1">{chapter.title}</h4>
                {isHotspot && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-[10px] font-bold text-orange-500 uppercase whitespace-nowrap">
                      <Flame className="w-3 h-3 fill-orange-500" /> Hot
                  </span>
                )}
                {isWeakness && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-500 uppercase whitespace-nowrap">
                      <AlertOctagon className="w-3 h-3" /> Weak
                  </span>
                )}
            </div>

            <div className="flex gap-1">
                {[1, 2, 3].map(star => (
                  <Star
                      key={star}
                      className={`w-4 h-4 ${star <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 dark:text-slate-700'}`}
                  />
                ))}
                <span className="text-[10px] font-bold text-slate-400 ml-2 uppercase tracking-tight">{stars}/3 Mastery</span>
            </div>
          </div>
      </div>

      <Button
          onClick={() => router.push(`/dashboard/practice/chapter-drill/${chapter.id}`)}
          size="sm"
          variant={stars === 3 ? 'outline' : 'primary'}
          className={stars === 3 ? 'rounded-xl text-green-500 border-green-500/30 hover:bg-green-500/10' : 'rounded-xl'}
      >
          {stars === 3 ? 'Review' : 'Start'}
      </Button>
    </Card>
  );
};
