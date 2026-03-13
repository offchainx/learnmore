import React from 'react';
import KnowledgeHive from '@/components/practice/analytics/KnowledgeHive';
import ExamForecast from '@/components/practice/analytics/ExamForecast';
import { WeaknessCard } from '@/components/practice/analytics/WeaknessCard';
import type { ChapterWithStats, ExamForecast as ExamForecastType, HiveNode } from '@/lib/practice/types';

const PREVIEW_HIVE_NODES: HiveNode[] = [
  { chapterId: 'preview-1', chapterTitle: '基础概念', masteryLevel: 3, correctRate: 88, totalAttempts: 26, status: 'strong', color: '#22c55e' },
  { chapterId: 'preview-2', chapterTitle: '题型辨析', masteryLevel: 2, correctRate: 72, totalAttempts: 18, status: 'fair', color: '#eab308' },
  { chapterId: 'preview-3', chapterTitle: '应用理解', masteryLevel: 1, correctRate: 56, totalAttempts: 14, status: 'weak', color: '#ef4444' },
  { chapterId: 'preview-4', chapterTitle: '综合推理', masteryLevel: 2, correctRate: 68, totalAttempts: 12, status: 'fair', color: '#eab308' },
  { chapterId: 'preview-5', chapterTitle: '审题速度', masteryLevel: 3, correctRate: 85, totalAttempts: 22, status: 'strong', color: '#22c55e' },
  { chapterId: 'preview-6', chapterTitle: '易错修复', masteryLevel: 1, correctRate: 49, totalAttempts: 11, status: 'weak', color: '#ef4444' },
  { chapterId: 'preview-7', chapterTitle: '进阶变式', masteryLevel: 2, correctRate: 64, totalAttempts: 16, status: 'fair', color: '#eab308' },
  { chapterId: 'preview-8', chapterTitle: '限时稳定', masteryLevel: 3, correctRate: 82, totalAttempts: 19, status: 'strong', color: '#22c55e' },
  { chapterId: 'preview-9', chapterTitle: '冲刺专题', masteryLevel: 0, correctRate: 0, totalAttempts: 0, status: 'locked', color: '#6b7280' },
];

const PREVIEW_FORECAST: ExamForecastType = {
  grade: 'A-',
  score: 84,
  trend: 'UP',
  confidence: 76,
  sparklineData: [58, 62, 66, 71, 74, 79, 84],
};

const PREVIEW_WEAKNESSES: ChapterWithStats[] = [
  {
    id: 'preview-w1',
    title: '应用题拆解',
    subjectId: 'preview',
    parentId: null,
    order: 1,
    stats: {
      totalAttempts: 12,
      correctCount: 6,
      masteryLevel: 52,
      questionCount: 36,
      recentAttempts: 6,
      recentCorrectRate: 54,
      monthlyCorrectRate: 58,
    },
  },
  {
    id: 'preview-w2',
    title: '多步骤推理',
    subjectId: 'preview',
    parentId: null,
    order: 2,
    stats: {
      totalAttempts: 10,
      correctCount: 5,
      masteryLevel: 58,
      questionCount: 28,
      recentAttempts: 5,
      recentCorrectRate: 57,
      monthlyCorrectRate: 60,
    },
  },
  {
    id: 'preview-w3',
    title: '高频易错点',
    subjectId: 'preview',
    parentId: null,
    order: 3,
    stats: {
      totalAttempts: 9,
      correctCount: 4,
      masteryLevel: 46,
      questionCount: 24,
      recentAttempts: 4,
      recentCorrectRate: 50,
      monthlyCorrectRate: 53,
    },
  },
  {
    id: 'preview-w4',
    title: '计算稳定性',
    subjectId: 'preview',
    parentId: null,
    order: 4,
    stats: {
      totalAttempts: 11,
      correctCount: 6,
      masteryLevel: 59,
      questionCount: 30,
      recentAttempts: 5,
      recentCorrectRate: 58,
      monthlyCorrectRate: 59,
    },
  },
];

interface PracticeCoachPanelProps {
  selectedSubjectId: string;
  currentSubjectTitle: string;
  chapters: ChapterWithStats[];
  knowledgeHive: HiveNode[];
  examForecast: ExamForecastType | null;
  isLoading: boolean;
  errorMessage: string | null;
}

export const PracticeCoachPanel: React.FC<PracticeCoachPanelProps> = ({
  selectedSubjectId,
  currentSubjectTitle,
  chapters,
  knowledgeHive,
  examForecast,
  isLoading,
  errorMessage,
}) => {
  const showPreviewState = !isLoading && !errorMessage;
  const resolvedKnowledgeHive = knowledgeHive.length > 0 ? knowledgeHive : showPreviewState ? PREVIEW_HIVE_NODES : [];
  const shouldUsePreviewForecast =
    showPreviewState &&
    (!examForecast || examForecast.grade === 'N/A' || examForecast.sparklineData.length === 0);
  const resolvedExamForecast = shouldUsePreviewForecast ? PREVIEW_FORECAST : examForecast;
  const resolvedChapters = chapters.length > 0 ? chapters : showPreviewState ? PREVIEW_WEAKNESSES : [];

  return (
    <div className="space-y-2.5 xl:sticky xl:top-2.5">
      <KnowledgeHive
        subjectName={currentSubjectTitle || undefined}
        nodes={resolvedKnowledgeHive}
        loading={isLoading}
        error={errorMessage}
      />
      <ExamForecast
        forecast={resolvedExamForecast}
        loading={isLoading}
        error={errorMessage}
      />
      <WeaknessCard chapters={resolvedChapters} />
    </div>
  );
};
