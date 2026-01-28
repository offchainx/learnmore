import React from 'react';
import KnowledgeHive from '@/components/practice/analytics/KnowledgeHive';
import ExamForecast from '@/components/practice/analytics/ExamForecast';
import { WeaknessCard } from '@/components/practice/analytics/WeaknessCard';
import type { DbChapter } from './types';

interface AnalyticsSidebarProps {
  userId: string;
  selectedSubjectId: string;
  currentSubjectTitle: string;
  chapters: DbChapter[];
}

export const AnalyticsSidebar: React.FC<AnalyticsSidebarProps> = ({ 
  userId, 
  selectedSubjectId, 
  currentSubjectTitle,
  chapters 
}) => {
  return (
    <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
       {selectedSubjectId && (
          <KnowledgeHive
             userId={userId}
             subjectId={selectedSubjectId}
             subjectName={currentSubjectTitle}
          />
       )}
       <ExamForecast userId={userId} subjectId={selectedSubjectId} className="mb-6" />
       <WeaknessCard chapters={chapters} />
    </div>
  );
};
