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
import {
  PracticeModePreviewDialog,
  type PracticeModePreviewConfig,
} from './PracticeModePreviewDialog';

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
  const [previewConfig, setPreviewConfig] = useState<PracticeModePreviewConfig | null>(null);
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
        const safeDefaultSubjectId = normalizedSubjects[0]?.id || '';
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

  const openSmartDrillPreview = () => {
    if (!selectedSubjectId) return;
    const estimatedMinutes = Math.max(8, Math.min(16, 6 + weakChapters.length * 2));
    const estimatedQuestions = weakChapters.length > 0 ? 10 : 8;

    setPreviewConfig({
      mode: 'SMART_DRILL',
      title: '先看这一轮 Smart Drill 预览',
      subtitle: `${currentSubjectTitle} 的默认主训练路径`,
      description: '系统会先排一组短轮高价值题，再进入统一答题页连续作答。',
      primaryStatLabel: '预计题量',
      primaryStatValue: `${estimatedQuestions} 题`,
      secondaryStatLabel: '预计时间',
      secondaryStatValue: `${estimatedMinutes} 分钟`,
      tertiaryStatLabel: '当前重点',
      tertiaryStatValue: weakChapters.length > 0 ? `${weakChapters.length} 个薄弱点待收口` : '建立首轮基线',
      reasons: [
        strongestSignal,
        subjectData.chapters.length > 0 ? '会优先覆盖当前波动更大的章节。' : '当前会先用一轮通用题建立基线表现。',
        '进入后题目会完整铺开，一次性做完整轮再统一交卷。',
      ],
      details: [
        { label: '答题布局', value: '左答题卡 / 中题目 / 右状态栏' },
        { label: '反馈方式', value: '整组连续作答，一次性交卷' },
        { label: '结果页', value: '统一复盘摘要' },
      ],
      startHref: `/dashboard/practice/smart-drill?subjectId=${encodeURIComponent(selectedSubjectId)}&autostart=1`,
      startLabel: '开始这一轮 Smart Drill',
    });
  };

  const openErrorWiperPreview = () => {
    if (!selectedSubjectId) return;

    setPreviewConfig({
      mode: 'ERROR_WIPER',
      title: '先看这一轮 Error Wiper 预览',
      subtitle: '集中修复最近不稳定的错题',
      description: '进入后会直接打开统一答题页，把本轮错题整组做完后再统一提交。',
      primaryStatLabel: '预计错题数',
      primaryStatValue: `${Math.max(6, weakChapters.length * 2 || 8)} 题`,
      secondaryStatLabel: '预计时间',
      secondaryStatValue: `${Math.max(8, weakChapters.length + 6)} 分钟`,
      tertiaryStatLabel: '修复目标',
      tertiaryStatValue: weakChapters.length > 0 ? '优先回收近期失分点' : '建立首轮错题修复记录',
      reasons: [
        '会优先拉取最近做错、掌握仍不稳定的题目。',
        '更适合在 Smart Drill 后做针对性修复，而不是第一次接触新题。',
        '统一交卷后会告诉你本轮修复了多少、还剩哪些遗留点。',
      ],
      details: [
        { label: '答题布局', value: '统一三栏作答页' },
        { label: '提交节奏', value: '整组完成后一次性交卷' },
        { label: '结果页', value: '修复数量 + 剩余风险点' },
      ],
      startHref: `/dashboard/practice/error-wiper?subjectId=${encodeURIComponent(selectedSubjectId)}&autostart=1`,
      startLabel: '开始 Error Wiper',
    });
  };

  const openMockArenaPreview = () => {
    if (!selectedSubjectId) return;

    setPreviewConfig({
      mode: 'MOCK_ARENA',
      title: '先看这一场 Mock Arena 预览',
      subtitle: `${currentSubjectTitle} 模拟考试`,
      description: '会用默认配置直接生成一套卷，进入统一答题页后整卷完成再提交。',
      primaryStatLabel: '题量',
      primaryStatValue: '20 题',
      secondaryStatLabel: '时间',
      secondaryStatValue: '30 分钟',
      tertiaryStatLabel: '难度',
      tertiaryStatValue: '标准 MEDIUM',
      reasons: [
        '更适合在日常训练之后检查真实考试节奏和时间分配。',
        '作答时不会展示答案，保持更接近正式考试的状态。',
        '提交后会统一给出得分、正确率和整卷表现。',
      ],
      details: [
        { label: '答题布局', value: '统一三栏作答页' },
        { label: '右侧面板', value: '剩余时间 + 已答题数 + 交卷' },
        { label: '进入方式', value: '直接生成试卷并开始' },
      ],
      startHref: `/dashboard/practice/mock-arena?subjectId=${encodeURIComponent(selectedSubjectId)}&autostart=1`,
      startLabel: '开始 Mock Arena',
    });
  };

  const openChapterPreview = (chapter: (typeof subjectData.chapters)[number]) => {
    setPreviewConfig({
      mode: 'CHAPTER_MAP',
      title: `先看「${chapter.title}」章节预览`,
      subtitle: `${currentSubjectTitle} 章节定向练习`,
      description: '进入后会加载当前章节的一组练习题，并使用统一答题页整组完成。',
      primaryStatLabel: '章节掌握度',
      primaryStatValue: `${chapter.stats.masteryLevel}%`,
      secondaryStatLabel: '题量',
      secondaryStatValue: `${Math.max(chapter.stats.questionCount || 10, 10)} 题`,
      tertiaryStatLabel: '练习目标',
      tertiaryStatValue: chapter.stats.masteryLevel < 70 ? '优先补弱' : '稳定巩固',
      reasons: [
        `当前章节最近正确率 ${chapter.stats.recentCorrectRate ?? chapter.stats.masteryLevel}% 。`,
        chapter.stats.masteryLevel < 70 ? '这一章还不稳，适合先集中补这一块。' : '这章已经有基础，更适合拿来稳住速度和准确率。',
        '进入后会直接打开统一答题页，不再切成多种练习界面。',
      ],
      details: [
        { label: '题目来源', value: '当前章节随机抽题' },
        { label: '答题方式', value: '整组连续作答' },
        { label: '提交结果', value: '章节正确率 + 复盘摘要' },
      ],
      startHref: `/dashboard/practice/chapter-drill/${chapter.id}?autostart=1`,
      startLabel: '开始章节练习',
    });
  };

  const openPastPaperPreview = (paper: (typeof subjectData.pastPapers)[number]) => {
    setPreviewConfig({
      mode: 'PAST_PAPER',
      title: `先看「${paper.title}」真题预览`,
      subtitle: paper.sourceYear ? `${paper.sourceYear} · ${paper.sourcePaper || '历年真题'}` : '历年真题',
      description: '进入后会直接打开统一答题页，整套题一次性完成再交卷。',
      primaryStatLabel: '题量',
      primaryStatValue: `${paper.questionCount} 题`,
      secondaryStatLabel: '来源',
      secondaryStatValue: paper.sourcePaper || '题库归档',
      tertiaryStatLabel: '年份',
      tertiaryStatValue: paper.sourceYear ? `${paper.sourceYear}` : '未标注',
      reasons: [
        '更适合在章节训练之后做整套实战，检查综合表现。',
        '会保留真实卷感，但答题页与其他模式保持统一，减少切换成本。',
        '提交后会统一查看整卷结果和薄弱题分布。',
      ],
      details: [
        { label: '答题布局', value: '统一三栏作答页' },
        { label: '提交方式', value: '整卷完成后一次性交卷' },
        { label: '结果页', value: '整卷得分 + 错题分布' },
      ],
      startHref: `/dashboard/practice/past-paper/${paper.id}?subjectId=${encodeURIComponent(selectedSubjectId)}&autostart=1`,
      startLabel: '开始这套真题',
    });
  };

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
      <PracticeModePreviewDialog
        open={Boolean(previewConfig)}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewConfig(null);
          }
        }}
        config={previewConfig}
      />

      <div className="mx-auto w-full max-w-[1820px] space-y-2 rounded-[32px] border border-[#24324D] bg-[#0B1220] p-2 sm:p-2.5">
        <div className="relative overflow-hidden rounded-[26px] border border-[#24324D] bg-[linear-gradient(135deg,#111A2E_0%,#0F1A2F_55%,#0B1220_100%)] px-4 py-2.5 shadow-[0_18px_44px_rgba(2,8,23,0.32)] sm:px-5 sm:py-3">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#2563EB]/10 blur-3xl" />
          <div className="absolute bottom-0 left-16 h-24 w-24 rounded-full bg-[#22C55E]/10 blur-3xl" />

          <div className="relative min-w-0">
            <h1 className="text-[26px] font-bold tracking-tight text-[#E6EDF7] sm:text-[28px]">
              {headerCopy.title}
            </h1>
            <p className="mt-1 max-w-3xl text-[12px] leading-5 text-[#B2C3DA] sm:text-[13px]">
              {headerCopy.subtitle}
            </p>
          </div>
        </div>

        <div ref={subjectSentinelRef} className="h-px" />
        <div
          className={`sticky top-2.5 z-30 rounded-[22px] border px-3 py-2 transition-all duration-300 ease-out ${
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
            <div className="rounded-[26px] border border-[#24324D] bg-[#0A1426]/90 p-[18px]">
              <PracticeModeGrid
                selectedSubjectId={selectedSubjectId}
                currentSubjectTitle={currentSubjectTitle}
                chapterCount={subjectData.chapters.length}
                pastPaperCount={subjectData.pastPapers.length}
                weakChapterCount={weakChapters.length}
                strongestSignal={strongestSignal}
                onOpenSmartDrillPreview={openSmartDrillPreview}
                onOpenErrorWiperPreview={openErrorWiperPreview}
                onOpenMockArenaPreview={openMockArenaPreview}
              />
            </div>

            <div className="grid gap-2.5 xl:grid-cols-2">
              <div className="rounded-[26px] border border-[#24324D] bg-[#0A1426]/90 p-4">
                <ChapterProgressSection
                  chapters={subjectData.chapters}
                  isLoading={isLoadingSubjectData}
                  onPreviewChapter={openChapterPreview}
                />
              </div>
              <div className="rounded-[26px] border border-[#24324D] bg-[#0A1426]/90 p-4">
                <PastPaperLibrarySection
                  selectedSubjectId={selectedSubjectId}
                  papers={subjectData.pastPapers}
                  isLoading={isLoadingSubjectData}
                  onPreviewPaper={openPastPaperPreview}
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
