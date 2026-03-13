import React, { useEffect, useMemo, useState } from 'react';
import { Compass } from 'lucide-react';
import { ChapterCard } from './ChapterCard';
import type { DbChapter } from '../types';

interface ChapterProgressSectionProps {
  chapters: DbChapter[];
  isLoading: boolean;
  onPreviewChapter?: (chapter: DbChapter) => void;
}

const CHAPTERS_PER_PAGE = 4;
const MOCK_CHAPTERS: DbChapter[] = [
  {
    id: 'mock-ch-1',
    title: '函数与图像',
    subjectId: 'mock-subject',
    parentId: null,
    order: 1,
    stats: {
      totalAttempts: 14,
      correctCount: 9,
      masteryLevel: 64,
      questionCount: 36,
      recentAttempts: 7,
      recentCorrectRate: 61,
      monthlyCorrectRate: 64,
    },
  },
  {
    id: 'mock-ch-2',
    title: '一次方程',
    subjectId: 'mock-subject',
    parentId: null,
    order: 2,
    stats: {
      totalAttempts: 10,
      correctCount: 8,
      masteryLevel: 80,
      questionCount: 28,
      recentAttempts: 4,
      recentCorrectRate: 80,
      monthlyCorrectRate: 80,
    },
  },
  {
    id: 'mock-ch-3',
    title: '几何证明',
    subjectId: 'mock-subject',
    parentId: null,
    order: 3,
    stats: {
      totalAttempts: 12,
      correctCount: 6,
      masteryLevel: 50,
      questionCount: 24,
      recentAttempts: 6,
      recentCorrectRate: 50,
      monthlyCorrectRate: 50,
    },
  },
  {
    id: 'mock-ch-4',
    title: '概率基础',
    subjectId: 'mock-subject',
    parentId: null,
    order: 4,
    stats: {
      totalAttempts: 8,
      correctCount: 5,
      masteryLevel: 63,
      questionCount: 20,
      recentAttempts: 5,
      recentCorrectRate: 60,
      monthlyCorrectRate: 63,
    },
  },
  {
    id: 'mock-ch-5',
    title: '统计图表',
    subjectId: 'mock-subject',
    parentId: null,
    order: 5,
    stats: {
      totalAttempts: 13,
      correctCount: 7,
      masteryLevel: 57,
      questionCount: 24,
      recentAttempts: 7,
      recentCorrectRate: 55,
      monthlyCorrectRate: 57,
    },
  },
];

export const ChapterProgressSection: React.FC<ChapterProgressSectionProps> = ({ chapters, isLoading, onPreviewChapter }) => {
  const hasMockPreview = !isLoading && chapters.length === 0;
  const displayChapters = hasMockPreview ? MOCK_CHAPTERS : chapters;
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(displayChapters.length / CHAPTERS_PER_PAGE));
  const visibleChapters = useMemo(
    () => displayChapters.slice(page * CHAPTERS_PER_PAGE, (page + 1) * CHAPTERS_PER_PAGE),
    [displayChapters, page],
  );

  useEffect(() => {
    setPage(0);
  }, [displayChapters.length]);

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (totalPages <= 1) return;
    event.preventDefault();
    const direction = event.deltaY > 0 ? 1 : -1;
    setPage((prev) => Math.max(0, Math.min(totalPages - 1, prev + direction)));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
            <Compass className="h-3.5 w-3.5" />
            章节地图
          </div>
          <p className="mt-2 max-w-xl text-[13px] leading-5 text-slate-600 dark:text-slate-300">
            默认展示 4 条，滚动滑鼠滚轮可一次切换下一组章节。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: totalPages }).map((_, index) => (
              <span
                key={index}
                className={`h-1.5 rounded-full transition-all ${index === page ? 'w-4 bg-slate-900 dark:bg-white' : 'w-1.5 bg-slate-300 dark:bg-slate-700'}`}
              />
            ))}
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            {displayChapters.length} 个章节
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[76px] animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/40" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {hasMockPreview ? (
            <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/80 px-4 py-2.5 text-xs leading-5 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
              开始练习后，这里会生成你的章节地图。当前先用 mock 列表预览排布。
            </div>
          ) : null}

          <div className="space-y-3" onWheel={handleWheel}>
            {visibleChapters.map((chapter, index) => (
              <div
                key={chapter.id}
                className="animate-in fade-in slide-in-from-right-4 duration-300 fill-mode-both"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ChapterCard
                  chapter={chapter}
                  absoluteIndex={page * CHAPTERS_PER_PAGE + index}
                  isPreview={hasMockPreview}
                  onPreview={onPreviewChapter}
                />
              </div>
            ))}
            {visibleChapters.length < CHAPTERS_PER_PAGE &&
              Array.from({ length: CHAPTERS_PER_PAGE - visibleChapters.length }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="flex h-[76px] items-center justify-center rounded-2xl border border-dashed border-slate-200/80 bg-slate-50/35 dark:border-slate-800/60 dark:bg-slate-900/20"
                >
                  <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-300 dark:text-slate-700">
                    已到列表底部
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
