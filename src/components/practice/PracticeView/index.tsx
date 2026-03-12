import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { DbSubject, PracticeSubjectData } from './types';
import { fetchWithTimeout, isAbortLikeError } from '@/lib/http/fetch-with-timeout';
import { useApp } from '@/providers';
import { getSubjectLabel, resolveSubjectKeyFromName, SUBJECT_DEFINITIONS } from '@/lib/subjects';

import { PracticeSubjectBar } from './SubjectSelector';
import { PracticeModeGrid } from './TrainingModeCards';
import { ChapterProgressSection } from './ChapterMap';
import { PastPaperLibrarySection } from './PastPapersSection';
import { PracticeCoachPanel } from './AnalyticsSidebar';
import { SmartDrillPreviewDialog } from './SmartDrillPreviewDialog';

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
  const byKey = new Map<string, DbSubject>();

  for (const subject of subjects) {
    const resolvedKey = subject.key || resolveSubjectKeyFromName(subject.name);
    if (!resolvedKey) continue;
    if (byKey.has(resolvedKey)) continue;
    byKey.set(resolvedKey, { ...subject, key: resolvedKey });
  }

  return SUBJECT_DEFINITIONS
    .map((definition) => byKey.get(definition.key))
    .filter((subject): subject is DbSubject => Boolean(subject));
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
  const [isSubjectBarPinned, setIsSubjectBarPinned] = useState(false);
  const [isSmartDrillPreviewOpen, setIsSmartDrillPreviewOpen] = useState(false);
  const subjectSentinelRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    const sentinel = subjectSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSubjectBarPinned(!entry.isIntersecting);
      },
      {
        threshold: 1,
        rootMargin: '-8px 0px 0px 0px',
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const currentDbSubject = dbSubjects.find((s) => s.id === selectedSubjectId);
  const currentSubjectTitle = currentDbSubject
    ? getSubjectLabel(currentDbSubject.key || resolveSubjectKeyFromName(currentDbSubject.name), lang, currentDbSubject.name)
    : 'Practice Center';
  const isLoadingSubjectData = isBootstrapLoading || isSubjectDataLoading;
  const weakChapters = useMemo(
    () => subjectData.chapters.filter((chapter) => chapter.stats.totalAttempts >= 3 && chapter.stats.masteryLevel < 70),
    [subjectData.chapters]
  );
  const strongestSignal = weakChapters[0]
    ? lang === 'zh'
      ? `最近最需要收口：${weakChapters[0].title}`
      : lang === 'ms'
        ? `Fokus semasa: ${weakChapters[0].title}`
        : `Current recovery focus: ${weakChapters[0].title}`
    : lang === 'zh'
      ? '先做首轮训练建立掌握基线'
      : lang === 'ms'
        ? 'Mulakan satu pusingan untuk bina garis asas'
        : 'Start one round to build a baseline';

  const headerCopy = {
    zh: {
      title: '练习中心',
      subtitle: '先从三种主要练习模式里选一个开始，再往下查看章节地图、历年真题和分析结果。',
      noSubjectsTitle: '当前还没有可用科目',
      noSubjectsSubtitle: '等科目数据接入后，这里会显示完整的训练入口和分析面板。',
      subjectLabel: '选择科目',
    },
    en: {
      title: 'Practice Center',
      subtitle: 'Start with one of the three core modes, then move into chapter practice, past papers, and analytics.',
      noSubjectsTitle: 'No subjects available yet',
      noSubjectsSubtitle: 'Once subject data is connected, the full training entry points and analytics will appear here.',
      subjectLabel: 'Select Subject',
    },
    ms: {
      title: 'Pusat Latihan',
      subtitle: 'Mulakan dengan salah satu daripada tiga mod utama, kemudian turun ke peta bab, kertas tahun lepas dan analitik.',
      noSubjectsTitle: 'Tiada subjek tersedia lagi',
      noSubjectsSubtitle: 'Apabila data subjek disambungkan, pintu masuk latihan dan panel analitik penuh akan muncul di sini.',
      subjectLabel: 'Pilih Subjek',
    },
  }[lang];

  return (
    <div className="relative px-3 py-1.5 sm:px-4 sm:py-2">
      <SmartDrillPreviewDialog
        open={isSmartDrillPreviewOpen}
        onOpenChange={setIsSmartDrillPreviewOpen}
        subjectId={selectedSubjectId}
        subjectTitle={currentSubjectTitle}
        chapterCount={subjectData.chapters.length}
        weakChapterCount={weakChapters.length}
        strongestSignal={strongestSignal}
      />

      <div className="mx-auto w-full max-w-[1820px] space-y-2 rounded-[32px] border border-[#24324D] bg-[#0B1220] p-2 sm:p-2.5">
        <div className="relative overflow-hidden rounded-[28px] border border-[#24324D] bg-[linear-gradient(135deg,#111A2E_0%,#0F1A2F_55%,#0B1220_100%)] px-4 py-3 shadow-[0_22px_50px_rgba(2,8,23,0.35)] sm:px-5 sm:py-3.5">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#2563EB]/10 blur-3xl" />
          <div className="absolute bottom-0 left-16 h-24 w-24 rounded-full bg-[#22C55E]/10 blur-3xl" />

          <div className="relative min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-[#E6EDF7] sm:text-[30px]">
              {headerCopy.title}
            </h1>
            <p className="mt-1 max-w-3xl text-[13px] leading-5 text-[#B2C3DA] sm:text-sm">
              {headerCopy.subtitle}
            </p>
          </div>
        </div>

        <div ref={subjectSentinelRef} className="h-px" />
        <div
          className={`sticky top-2.5 z-30 rounded-[24px] border px-3 py-2.5 transition-all duration-300 ease-out ${
            isSubjectBarPinned
              ? 'border-[#24324D] bg-[#111A2E]/88 shadow-[0_18px_40px_rgba(2,8,23,0.36)] backdrop-blur-xl'
              : 'border-transparent bg-transparent'
          }`}
        >
          <div className="mb-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#9FB0C9]">
            {headerCopy.subjectLabel}
          </div>
          <PracticeSubjectBar
            subjects={dbSubjects}
            selectedSubjectId={selectedSubjectId}
            onSelect={setSelectedSubjectId}
          />
        </div>

        <div className="grid gap-2.5 xl:grid-cols-3">
          <div className="space-y-2.5 xl:col-span-2">
            <div className="rounded-[28px] border border-[#24324D] bg-[#0A1426]/90 p-5">
              <PracticeModeGrid
                selectedSubjectId={selectedSubjectId}
                currentSubjectTitle={currentSubjectTitle}
                chapterCount={subjectData.chapters.length}
                pastPaperCount={subjectData.pastPapers.length}
                weakChapterCount={weakChapters.length}
                strongestSignal={strongestSignal}
                onOpenSmartDrillPreview={() => setIsSmartDrillPreviewOpen(true)}
              />
            </div>

            <div className="grid gap-2.5 xl:grid-cols-2">
              <div className="rounded-[28px] border border-[#24324D] bg-[#0A1426]/90 p-5">
                <ChapterProgressSection chapters={subjectData.chapters} isLoading={isLoadingSubjectData} />
              </div>
              <div className="rounded-[28px] border border-[#24324D] bg-[#0A1426]/90 p-5">
                <PastPaperLibrarySection
                  selectedSubjectId={selectedSubjectId}
                  papers={subjectData.pastPapers}
                  isLoading={isLoadingSubjectData}
                />
              </div>
            </div>
          </div>

          <div className="xl:col-span-1">
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

        {!isBootstrapLoading && dbSubjects.length === 0 ? (
          <section className="rounded-[30px] border border-dashed border-[#24324D] bg-[#0A1426]/90 p-8 text-center">
            <h3 className="text-xl font-black tracking-tight text-[#E6EDF7]">{headerCopy.noSubjectsTitle}</h3>
            <p className="mt-2 text-sm leading-6 text-[#9FB0C9]">
              {headerCopy.noSubjectsSubtitle}
            </p>
          </section>
        ) : null}
      </div>
    </div>
  );
};

export { PracticeCenterScreen as QuestionBankView };
