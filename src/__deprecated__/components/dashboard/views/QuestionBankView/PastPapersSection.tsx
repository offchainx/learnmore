import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, ChevronRight } from 'lucide-react';

const MOCK_PAPERS = [
  '2023 Paper 1 (Feb/Mar)', 
  '2023 Paper 2 (May/Jun)', 
  '2022 Paper 1 (Oct/Nov)'
];

export const PastPapersSection: React.FC = () => {
  return (
    <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Past Year Papers</h3>
      <div className="grid gap-3">
          {MOCK_PAPERS.map((paper, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">{paper}</div>
                      <div className="text-xs text-slate-500">2 hours • 80 Marks</div>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="text-slate-400 group-hover:text-blue-500">
                  Start <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
            </div>
          ))}
      </div>
    </div>
  );
};
