import React, { useState } from 'react';
import { ChapterCard } from './ChapterCard';
import type { DbChapter } from '../types';

interface ChapterProgressSectionProps {
  chapters: DbChapter[];
  isLoading: boolean;
}

const CHAPTERS_PER_PAGE = 3;

export const ChapterProgressSection: React.FC<ChapterProgressSectionProps> = ({ chapters, isLoading }) => {
  const [chapterPage, setChapterPage] = useState(0);

  const handleChapterWheel = (e: React.WheelEvent) => {
    // Only intercept if we have enough chapters to scroll
    if (chapters.length <= CHAPTERS_PER_PAGE) return;

    const direction = e.deltaY > 0 ? 1 : -1;
    const maxPage = Math.ceil(chapters.length / CHAPTERS_PER_PAGE) - 1;

    setChapterPage(prev => {
      const next = prev + direction;
      // Clamp between 0 and maxPage
      return Math.max(0, Math.min(next, maxPage));
    });
  };

  const totalPages = Math.ceil(chapters.length / CHAPTERS_PER_PAGE);
  const visibleChapters = chapters.slice(
    chapterPage * CHAPTERS_PER_PAGE,
    (chapterPage + 1) * CHAPTERS_PER_PAGE
  );

  return (
    <div className="space-y-4">
       <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Chapter Map</h3>
          <div className="flex items-center gap-2">
             <div className="flex gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                   <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${i === chapterPage ? 'bg-slate-900 dark:bg-white w-3' : 'bg-slate-300 dark:bg-slate-700'}`}
                   />
                ))}
             </div>
             <span className="text-xs text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                {chapters.length} Modules
             </span>
          </div>
       </div>

       {isLoading ? (
         <div className="space-y-3">
           {[1, 2, 3].map(i => (
             <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800/40 animate-pulse rounded-2xl" />
           ))}
         </div>
       ) : chapters.length === 0 ? (
         <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
           <p className="text-slate-500">No chapters found for this subject.</p>
         </div>
       ) : (
         <div
            className="space-y-3 min-h-[320px]"
            onWheel={handleChapterWheel}
         >
            {visibleChapters.map((chapter, index) => {
                const absoluteIndex = (chapterPage * CHAPTERS_PER_PAGE) + index;
                return (
                   <div
                      key={chapter.id}
                      className="animate-in fade-in slide-in-from-right-4 duration-300 fill-mode-both"
                      style={{ animationDelay: `${index * 50}ms` }}
                   >
                     <ChapterCard chapter={chapter} absoluteIndex={absoluteIndex} />
                   </div>
                );
            })}

            {/* Empty state filler to maintain height if last page has < 3 items */}
            {visibleChapters.length < CHAPTERS_PER_PAGE && Array.from({ length: CHAPTERS_PER_PAGE - visibleChapters.length }).map((_, i) => (
                <div key={`empty-${i}`} className="h-[72px] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/50 flex items-center justify-center">
                    <span className="text-xs text-slate-300 dark:text-slate-700 font-medium">End of list</span>
                </div>
            ))}
         </div>
       )}
    </div>
  );
};
