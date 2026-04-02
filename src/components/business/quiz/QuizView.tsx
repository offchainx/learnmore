'use client';

import React, { useMemo, useState } from 'react';
import { PracticeMode, QuestionType } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { submitPracticeSession } from '@/actions/practice/session';
import type { Question } from '@/components/business/question';
import { PracticeReviewWorkspace } from '@/components/practice/modes/shared/PracticeReviewWorkspace';
import type { PracticeModeTheme } from '@/components/practice/modes/shared/theme';
import UnifiedPracticeWorkspace, {
  type UnifiedPracticeQuestion,
} from '@/components/practice/session/UnifiedPracticeWorkspace';
import type { TierKey } from '@/lib/permissions/types';
import {
  type PracticeQuestionRecord,
  toQuestionMaterialGroup,
} from '@/lib/practice/question-groups';

interface QuizViewProps {
  userId: string;
  title: string;
  modeLabel: string;
  subtitle: string;
  mode: PracticeMode;
  questions: PracticeQuestionRecord[];
  chapterId?: string;
  subjectId?: string;
  submitLabel?: string;
  refreshLabel?: string;
  exitLabel?: string;
  resultTitle?: string;
  resultSubtitle?: string;
  recommendation?: string;
  theme?: PracticeModeTheme;
  timeLimitSeconds?: number | null;
  rightPanelNote?: string;
  onComplete?: () => void;
  userTier?: TierKey;
  reporterId?: string;
}

function formatQuestion(question: PracticeQuestionRecord): Question {
  return {
    id: question.id,
    type: question.type as QuestionType,
    content: question.content,
    options: question.options as Record<string, string> | null,
    answer: question.answer as string | string[] | null,
    explanation: question.explanation || null,
    group: toQuestionMaterialGroup(question.group),
  };
}

export function QuizView({
  userId,
  title,
  modeLabel,
  subtitle,
  mode,
  questions,
  chapterId,
  subjectId,
  submitLabel = '提交试卷',
  refreshLabel = '刷新题目',
  exitLabel = '退出练习',
  resultTitle = '练习完成',
  resultSubtitle = '下面直接进入这一轮的逐题复盘。',
  recommendation = '先看错题分布，再决定是继续加练还是回到练习中心切换模式。',
  theme = 'amber',
  timeLimitSeconds = null,
  rightPanelNote,
  onComplete,
  userTier = 'STARTER',
  reporterId,
}: QuizViewProps) {
  const router = useRouter();
  const practiceCenterHref = subjectId
    ? `/dashboard/practice?subjectId=${encodeURIComponent(subjectId)}`
    : '/dashboard/practice';
  const reloadPage = () => window.location.reload();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [clientSessionId] = useState(() => crypto.randomUUID());
  const [result, setResult] = useState<{
    score: number;
    correctCount: number;
    totalQuestions: number;
    results: Record<string, boolean>;
    answers: Record<string, string | string[]>;
  } | null>(null);

  const workspaceQuestions = useMemo<UnifiedPracticeQuestion[]>(
    () =>
      questions.map((question) => ({
        id: question.id,
        question: formatQuestion(question),
        difficulty: question.difficulty,
        meta: question.chapterId ? `章节线索：${question.chapterId}` : '按顺序完成整组题目后统一交卷',
      })),
    [questions],
  );

  const handleSubmit = async ({
    answers,
    duration,
  }: {
    answers: Record<string, string | string[]>;
    duration: number;
  }) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const submitResult = await submitPracticeSession({
      userId,
      mode,
      clientSessionId,
      chapterId: chapterId ?? null,
      subjectId: subjectId ?? null,
      title,
      duration,
      answers: questions.map((question) => ({
        questionId: question.id,
        userAnswer: answers[question.id] ?? null,
      })),
    });

    if (submitResult.success) {
      setResult({
        score: Math.round(submitResult.score ?? 0),
        correctCount: submitResult.correctCount ?? 0,
        totalQuestions: submitResult.totalQuestions ?? questions.length,
        results: submitResult.results ?? {},
        answers,
      });
      onComplete?.();
    } else {
      setSubmitError(submitResult.error || '提交失败，请稍后再试。');
    }

    setIsSubmitting(false);
  };

  if (questions.length === 0) {
    return <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-muted-foreground dark:border-slate-800">当前没有可用题目。</div>;
  }

  if (result) {
    return (
      <PracticeReviewWorkspace
        title={resultTitle}
        subtitle={resultSubtitle}
        score={result.score}
        theme={theme}
        stats={[
          { label: '题目总数', value: result.totalQuestions, toneClassName: 'text-slate-100' },
          { label: '正确', value: result.correctCount, toneClassName: 'text-emerald-300' },
          { label: '错误', value: Math.max(0, result.totalQuestions - result.correctCount), toneClassName: 'text-rose-300' },
          { label: '正确率', value: `${result.score}%`, toneClassName: 'text-cyan-200' },
        ]}
        recommendation={recommendation}
        note={submitError}
        items={questions.map((question, index) => ({
          id: question.id,
          order: index + 1,
          userAnswer: result.answers[question.id] ?? null,
          isCorrect: Boolean(result.results[question.id]),
          question: formatQuestion(question),
        }))}
        primaryActionLabel="返回练习中心"
        primaryAction={() => router.push(practiceCenterHref)}
        secondaryActionLabel="再做一轮"
        secondaryAction={reloadPage}
        userTier={userTier}
        reporterId={reporterId ?? userId}
      />
    );
  }

  return (
    <UnifiedPracticeWorkspace
      title={title}
      modeLabel={modeLabel}
      subtitle={subtitle}
      questions={workspaceQuestions}
      onSubmit={handleSubmit}
      onRefresh={reloadPage}
      onExit={() => router.push(practiceCenterHref)}
      submitLabel={submitLabel}
      refreshLabel={refreshLabel}
      exitLabel={exitLabel}
      isSubmitting={isSubmitting}
      timeLimitSeconds={timeLimitSeconds}
      rightPanelNote={rightPanelNote}
      reporterId={reporterId ?? userId}
    />
  );
}
