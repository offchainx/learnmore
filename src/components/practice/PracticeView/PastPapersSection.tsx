import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronRight, FileText, Loader2 } from 'lucide-react';
import type { DbPastPaper } from './types';

interface PastPaperLibrarySectionProps {
  selectedSubjectId: string;
  papers: DbPastPaper[];
  isLoading: boolean;
}

const MOCK_PAPERS: DbPastPaper[] = [
  {
    id: 'mock-paper-1',
    title: '2024 数学模拟卷',
    sourcePaper: '模拟卷',
    sourceYear: 2024,
    questionCount: 40,
    status: 'PREVIEW',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-paper-2',
    title: '2023 年中评估卷',
    sourcePaper: '校内卷',
    sourceYear: 2023,
    questionCount: 35,
    status: 'PREVIEW',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-paper-3',
    title: '历年真题冲刺组',
    sourcePaper: '题库归档',
    sourceYear: 2022,
    questionCount: 25,
    status: 'PREVIEW',
    updatedAt: new Date().toISOString(),
  },
];

export const PastPaperLibrarySection: React.FC<PastPaperLibrarySectionProps> = ({
  selectedSubjectId,
  papers,
  isLoading,
}) => {
  const router = useRouter();
  const hasMockPreview = !isLoading && papers.length === 0;
  const displayPapers = hasMockPreview ? MOCK_PAPERS : papers;

  const handleStart = (paperId: string) => {
    router.push(`/dashboard/practice/past-paper/${paperId}?subjectId=${selectedSubjectId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
            <FileText className="h-3.5 w-3.5" />
            历年真题
          </div>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            用历年真题熟悉题型分布和答题节奏。先从最近年份开始，逐步进入完整实战。
          </p>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 dark:bg-slate-900 dark:text-slate-400">
          {displayPapers.length} 套试卷
        </div>
      </div>

      <div className="grid gap-3">
        {isLoading && (
          <div className="flex items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-slate-50/90 py-10 text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            正在载入真题库...
          </div>
        )}

        {!isLoading &&
          displayPapers.map((paper) => (
            <div
              key={paper.id}
              className="group flex items-center justify-between rounded-[24px] border border-slate-200/80 bg-slate-50/90 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_18px_34px_rgba(14,165,233,0.12)] dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-900"
              onClick={() => {
                if (!hasMockPreview) {
                  handleStart(paper.id);
                }
              }}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-300">
                    {paper.title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {paper.sourceYear ? `${paper.sourceYear} · ` : ''}
                    {paper.sourcePaper ? `${paper.sourcePaper} · ` : ''}
                    {paper.questionCount} 题
                    {hasMockPreview ? ' · 预览' : ''}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant={hasMockPreview ? 'outline' : 'ghost'}
                className="text-slate-400 group-hover:text-blue-500"
                onClick={(event) => {
                  event.stopPropagation();
                  if (!hasMockPreview) {
                    handleStart(paper.id);
                  }
                }}
              >
                {hasMockPreview ? '预览' : '开始'}
                {!hasMockPreview ? <ChevronRight className="ml-1 h-4 w-4" /> : null}
              </Button>
            </div>
          ))}

        {hasMockPreview ? (
          <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/80 px-4 py-3 text-sm text-sky-700 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-200">
            暂无真实真题数据，列表先用 mock 内容填充方便你预览样式。
          </div>
        ) : null}
      </div>
    </div>
  );
};
