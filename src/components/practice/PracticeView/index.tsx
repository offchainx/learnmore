import React, { useEffect, useState } from 'react';
import type { DbSubject, PracticeSubjectData } from './types';
import { fetchWithTimeout, isAbortLikeError } from '@/lib/http/fetch-with-timeout';
import { useApp } from '@/providers';
import { getSubjectLabel, resolveSubjectKeyFromName, SUBJECT_DEFINITIONS } from '@/lib/subjects';

// Components
import { PracticeSubjectBar } from './SubjectSelector';
import { PracticeModeGrid } from './TrainingModeCards';
import { ChapterProgressSection } from './ChapterMap';
import { PastPaperLibrarySection } from './PastPapersSection';
import { PracticeCoachPanel } from './AnalyticsSidebar';

interface PracticeCenterScreenProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}

function createEmptySubjectData(): PracticeSubjectData {
  return {
    chapters: [],
    pastPapers: [],
    knowledgeHive: [],
    examForecast: null,
  };
}

function normalizeClientSubjects(subjects: DbSubject[]): DbSubject[] {
  const byKey = new Map<string, DbSubject>()

  for (const subject of subjects) {
    const resolvedKey = subject.key || resolveSubjectKeyFromName(subject.name)
    if (!resolvedKey) continue
    if (byKey.has(resolvedKey)) continue
    byKey.set(resolvedKey, { ...subject, key: resolvedKey })
  }

  return SUBJECT_DEFINITIONS
    .map((definition) => byKey.get(definition.key))
    .filter((subject): subject is DbSubject => Boolean(subject))
}

export const PracticeCenterScreen: React.FC<PracticeCenterScreenProps> = ({ t }) => {
  const { lang } = useApp();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [dbSubjects, setDbSubjects] = useState<DbSubject[]>([]);
  const [loadedSubjectId, setLoadedSubjectId] = useState<string>('');
  const [subjectData, setSubjectData] = useState<PracticeSubjectData>(createEmptySubjectData);
  const [isBootstrapLoading, setIsBootstrapLoading] = useState(true);
  const [isSubjectDataLoading, setIsSubjectDataLoading] = useState(false);
  const [subjectDataError, setSubjectDataError] = useState<string | null>(null);

  // 首屏一次性拉取：subjects + 默认科目数据
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function fetchPracticeBootstrap() {
      setIsBootstrapLoading(true);
      setSubjectDataError(null);
      try {
        const response = await fetchWithTimeout('/api/practice/bootstrap', {
          timeoutMs: 8000,
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Bootstrap request failed: ${response.status}`);
        }

        const result = await response.json();
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Invalid bootstrap response');
        }

        if (cancelled) return;

        const subjects = Array.isArray(result.data.subjects) ? (result.data.subjects as DbSubject[]) : [];
        const normalizedSubjects = normalizeClientSubjects(subjects);
        const defaultSubjectId = typeof result.data.defaultSubjectId === 'string' ? result.data.defaultSubjectId : '';
        const safeDefaultSubjectId = normalizedSubjects.some((subject) => subject.id === defaultSubjectId)
          ? defaultSubjectId
          : normalizedSubjects[0]?.id || '';
        const bootstrapSubjectData = result.data.subjectData as PracticeSubjectData | null;

        setDbSubjects(normalizedSubjects);
        setSelectedSubjectId(safeDefaultSubjectId);
        if (safeDefaultSubjectId && bootstrapSubjectData && safeDefaultSubjectId === defaultSubjectId) {
          setSubjectData(bootstrapSubjectData);
          setLoadedSubjectId(safeDefaultSubjectId);
        } else {
          setSubjectData(createEmptySubjectData());
          setLoadedSubjectId('');
        }
      } catch (error) {
        if (cancelled) return;
        console.error('Failed to fetch practice bootstrap:', error);
        setDbSubjects([]);
        setSelectedSubjectId('');
        setLoadedSubjectId('');
        setSubjectData(createEmptySubjectData());
        setSubjectDataError(isAbortLikeError(error) ? '请求超时，请稍后重试' : '加载练习中心数据失败');
      } finally {
        if (!cancelled) {
          setIsBootstrapLoading(false);
        }
      }
    }

    fetchPracticeBootstrap();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  // 切换科目一次性拉取该科目的所有练习数据
  useEffect(() => {
    if (!selectedSubjectId) {
      setSubjectData(createEmptySubjectData());
      setLoadedSubjectId('');
      return;
    }

    if (selectedSubjectId === loadedSubjectId) {
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function fetchSubjectData() {
      setIsSubjectDataLoading(true);
      setSubjectDataError(null);
      setSubjectData(createEmptySubjectData());
      try {
        const response = await fetchWithTimeout(
          `/api/practice/subject-data?subjectId=${encodeURIComponent(selectedSubjectId)}`,
          {
            timeoutMs: 8000,
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(`Subject data request failed: ${response.status}`);
        }

        const result = await response.json();
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Invalid subject data response');
        }

        if (cancelled) {
          return;
        }

        setSubjectData(result.data as PracticeSubjectData);
        setLoadedSubjectId(selectedSubjectId);
      } catch (error) {
        if (cancelled) return;
        console.error('Failed to fetch subject data:', error);
        setSubjectData(createEmptySubjectData());
        setSubjectDataError(isAbortLikeError(error) ? '请求超时，请稍后重试' : '加载科目数据失败');
      } finally {
        if (!cancelled) {
          setIsSubjectDataLoading(false);
        }
      }
    }

    fetchSubjectData();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [selectedSubjectId, loadedSubjectId]);

  // Derived current subject info
  const currentDbSubject = dbSubjects.find(s => s.id === selectedSubjectId);
  const currentSubjectTitle = currentDbSubject
    ? getSubjectLabel(currentDbSubject.key || resolveSubjectKeyFromName(currentDbSubject.name), lang, currentDbSubject.name)
    : 'Practice Center';
  const isLoadingSubjectData = isBootstrapLoading || isSubjectDataLoading;

  return (
    <div className="pb-12 animate-fade-in-up">
       <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{t.questionBank}</h2>
          <p className="text-slate-500 text-sm">Adaptive training center. Choose a mode to begin.</p>
       </div>

       <div className="sticky top-0 z-20 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-sm py-3 -mx-4 px-4 mb-6 border-b border-slate-200 dark:border-slate-800/50">
          <PracticeSubjectBar
            subjects={dbSubjects}
            selectedSubjectId={selectedSubjectId}
            onSelect={setSelectedSubjectId}
          />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
             <PracticeModeGrid selectedSubjectId={selectedSubjectId} />
             <ChapterProgressSection chapters={subjectData.chapters} isLoading={isLoadingSubjectData} />
             <PastPaperLibrarySection
               selectedSubjectId={selectedSubjectId}
               papers={subjectData.pastPapers}
               isLoading={isLoadingSubjectData}
             />
          </div>

          <PracticeCoachPanel
            selectedSubjectId={selectedSubjectId}
            currentSubjectTitle={currentSubjectTitle}
            chapters={subjectData.chapters}
            knowledgeHive={subjectData.knowledgeHive}
            examForecast={subjectData.examForecast}
            isLoading={isLoadingSubjectData}
            errorMessage={subjectDataError}
          />
       </div>
    </div>
  );
};

export { PracticeCenterScreen as QuestionBankView };
