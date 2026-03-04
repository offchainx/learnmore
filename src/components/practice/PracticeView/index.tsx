import React, { useState, useEffect } from 'react';
import type { DbSubject, DbChapter } from './types';

// Components
import { SubjectSelector } from './SubjectSelector';
import { TrainingModeCards } from './TrainingModeCards';
import { ChapterMap } from './ChapterMap';
import { PastPapersSection } from './PastPapersSection';
import { AnalyticsSidebar } from './AnalyticsSidebar';

interface PracticeViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  userId: string;
}

export const PracticeView: React.FC<PracticeViewProps> = ({ t, userId }) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [dbSubjects, setDbSubjects] = useState<DbSubject[]>([]);
  const [dbChapters, setDbChapters] = useState<DbChapter[]>([]);
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);

  // Load subject data
  useEffect(() => {
    async function fetchDbSubjects() {
      const response = await fetch('/api/courses/subjects', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) return;
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        const subjects = result.data as DbSubject[];
        setDbSubjects(subjects);
        // Find mathematics or select the first one
        const mathSubject = subjects.find((s) =>
          s.name.toLowerCase().includes('math') ||
          s.name.toLowerCase().includes('数学')
        );
        if (mathSubject) {
          setSelectedSubjectId(mathSubject.id);
        } else if (subjects.length > 0) {
          setSelectedSubjectId(subjects[0].id);
        }
      }
    }
    fetchDbSubjects();
  }, []);

  // Fetch chapters when subject changes
  useEffect(() => {
    async function fetchChapters() {
      if (!selectedSubjectId) return;

      setIsLoadingChapters(true);
      try {
        const response = await fetch(
          `/api/practice/subject-chapters?subjectId=${encodeURIComponent(selectedSubjectId)}`,
          {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
          },
        );

        if (!response.ok) {
          setDbChapters([]);
          return;
        }

        const result = await response.json();
        if (result.success && result.data?.chapters) {
          setDbChapters(result.data.chapters);
        } else {
          setDbChapters([]);
        }
      } catch (error) {
        console.error('Failed to fetch chapters:', error);
        setDbChapters([]);
      } finally {
        setIsLoadingChapters(false);
      }
    }

    fetchChapters();
  }, [selectedSubjectId]);

  // Derived current subject info
  const currentDbSubject = dbSubjects.find(s => s.id === selectedSubjectId);
  const currentSubjectTitle = currentDbSubject ? currentDbSubject.name : 'Loading...';

  return (
    <div className="pb-12 animate-fade-in-up">
       <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{t.questionBank}</h2>
          <p className="text-slate-500 text-sm">Adaptive training center. Choose a mode to begin.</p>
       </div>

       <div className="sticky top-0 z-20 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-sm py-3 -mx-4 px-4 mb-6 border-b border-slate-200 dark:border-slate-800/50">
          <SubjectSelector 
            subjects={dbSubjects}
            selectedSubjectId={selectedSubjectId}
            onSelect={setSelectedSubjectId}
          />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
             <TrainingModeCards selectedSubjectId={selectedSubjectId} />
             <ChapterMap chapters={dbChapters} isLoading={isLoadingChapters} />
             <PastPapersSection selectedSubjectId={selectedSubjectId} />
          </div>

          <AnalyticsSidebar 
            userId={userId}
            selectedSubjectId={selectedSubjectId}
            currentSubjectTitle={currentSubjectTitle}
            chapters={dbChapters}
          />
       </div>
    </div>
  );
};

// Backward compatibility alias
export { PracticeView as QuestionBankView };
