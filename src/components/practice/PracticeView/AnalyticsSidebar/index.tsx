import React from 'react';
import KnowledgeHive from '@/components/practice/analytics/KnowledgeHive';
import ExamForecast from '@/components/practice/analytics/ExamForecast';
import { WeaknessCard } from '@/components/practice/analytics/WeaknessCard';
import type { ChapterWithStats, ExamForecast as ExamForecastType, HiveNode } from '@/lib/practice/types';

interface AnalyticsSidebarProps {
  selectedSubjectId: string;
  currentSubjectTitle: string;
  chapters: ChapterWithStats[];
  knowledgeHive: HiveNode[];
  examForecast: ExamForecastType | null;
  isLoading: boolean;
  errorMessage: string | null;
}

export const AnalyticsSidebar: React.FC<AnalyticsSidebarProps> = ({ 
  selectedSubjectId, 
  currentSubjectTitle,
  chapters,
  knowledgeHive,
  examForecast,
  isLoading,
  errorMessage,
}) => {
  return (
    <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
       {selectedSubjectId && (
          <KnowledgeHive
             subjectName={currentSubjectTitle}
             nodes={knowledgeHive}
             loading={isLoading}
             error={errorMessage}
          />
       )}
       <ExamForecast
         forecast={examForecast}
         loading={isLoading}
         error={errorMessage}
         className="mb-6"
       />
       <WeaknessCard chapters={chapters} />
    </div>
  );
};
