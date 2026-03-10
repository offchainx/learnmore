import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileText, ChevronRight, Loader2 } from 'lucide-react';
import type { DbPastPaper } from './types';

interface PastPaperLibrarySectionProps {
  selectedSubjectId: string;
  papers: DbPastPaper[];
  isLoading: boolean;
}

export const PastPaperLibrarySection: React.FC<PastPaperLibrarySectionProps> = ({
  selectedSubjectId,
  papers,
  isLoading,
}) => {
  const router = useRouter();

  const handleStart = (paperId: string) => {
    router.push(`/dashboard/practice/past-paper/${paperId}?subjectId=${selectedSubjectId}`);
  };

  return (
    <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Past Year Papers</h3>
      <div className="grid gap-3">
          {isLoading && (
            <div className="flex items-center justify-center py-8 text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading past papers...
            </div>
          )}

          {!isLoading && papers.length === 0 && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-500">
              No past papers available for this subject yet.
            </div>
          )}

          {!isLoading && papers.map((paper) => (
            <div
              key={paper.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer group"
              onClick={() => handleStart(paper.id)}
            >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">{paper.title}</div>
                      <div className="text-xs text-slate-500">
                        {paper.sourceYear ? `${paper.sourceYear} • ` : ''}{paper.questionCount} Questions
                      </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-slate-400 group-hover:text-blue-500"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleStart(paper.id);
                  }}
                >
                  Start <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
            </div>
          ))}
      </div>
    </div>
  );
};
