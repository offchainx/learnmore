'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PracticeReviewWorkspace } from '@/components/practice/modes/shared/PracticeReviewWorkspace';
import UnifiedPracticeWorkspace, {
  type UnifiedPracticeQuestion,
} from '@/components/practice/session/UnifiedPracticeWorkspace';
import { Question } from '@/components/business/question';
import type { TierKey } from '@/lib/permissions/types';

export interface ErrorBookEntry {
  id: string;
  questionId: string;
  masteryLevel: number;
  question: Question;
}

interface ErrorWiperSessionProps {
  initialSession: ErrorBookEntry[];
  autoStart?: boolean;
  subjectId?: string;
  userTier?: TierKey;
  onSessionComplete: (results: { wiped: number; remaining: number }) => void;
  onSubmitSession: (input: {
    attempts: Array<{ questionId: string; isCorrect: boolean }>;
    duration: number;
    clientSessionId: string;
  }) => Promise<{
    success: boolean;
    levels?: Record<string, number>;
    wipedQuestionIds?: string[];
    error?: string;
  }>;
}

function isCorrectAnswer(question: Question, userAnswer: string | string[] | undefined) {
  if (!userAnswer || question.answer === null || question.answer === undefined) return false;

  if (question.type === 'SINGLE_CHOICE' || question.type === 'TRUE_FALSE' || question.type === 'MCQ') {
    return String(userAnswer).trim().toLowerCase() === String(question.answer).trim().toLowerCase();
  }

  if (question.type === 'MULTIPLE_CHOICE') {
    const actual = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
    const expected = Array.isArray(question.answer) ? question.answer : [question.answer];
    if (actual.length !== expected.length) return false;
    const sortedActual = [...actual].map(String).sort();
    const sortedExpected = [...expected].map(String).sort();
    return sortedActual.every((value, index) => value === sortedExpected[index]);
  }

  if (question.type === 'FILL_BLANK') {
    if (Array.isArray(question.answer)) {
      return question.answer.map((item) => String(item).trim()).includes(String(userAnswer).trim());
    }
    return String(userAnswer).trim() === String(question.answer).trim();
  }

  return false;
}

export const ErrorWiperSession: React.FC<ErrorWiperSessionProps> = ({
  initialSession,
  autoStart = false,
  subjectId,
  userTier = 'STARTER',
  onSessionComplete,
  onSubmitSession,
}) => {
  const router = useRouter();
  const practiceCenterHref = subjectId
    ? `/dashboard/practice?subjectId=${encodeURIComponent(subjectId)}`
    : '/dashboard/practice';
  const reloadPage = () => window.location.reload();
  const [hasStarted, setHasStarted] = useState(autoStart);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summary, setSummary] = useState<{ wiped: number; remaining: number; states: boolean[] } | null>(null);
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, string | string[]>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [clientSessionId] = useState(() => crypto.randomUUID());

  const workspaceQuestions = useMemo<UnifiedPracticeQuestion[]>(
    () =>
      initialSession.map((entry, index) => ({
        id: entry.id,
        question: entry.question,
        meta: `错题 ${index + 1} · 当前修复进度 ${entry.masteryLevel} / 3`,
      })),
    [initialSession],
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

    const nextStates = initialSession.map((entry) =>
      isCorrectAnswer(entry.question, answers[entry.questionId] ?? answers[entry.id]),
    );
    setSubmittedAnswers(answers);

    const submitResult = await onSubmitSession({
      attempts: initialSession.map((entry, index) => ({
        questionId: entry.questionId,
        isCorrect: nextStates[index],
      })),
      duration,
      clientSessionId,
    });

    if (!submitResult.success) {
      setSubmitError(submitResult.error || '提交错题修复失败，请稍后重试。');
      setIsSubmitting(false);
      return;
    }

    const wiped = submitResult.wipedQuestionIds?.length ?? 0;
    const remaining = Math.max(0, initialSession.length - wiped);
    setSummary({ wiped, remaining, states: nextStates });
    setIsSubmitting(false);
  };

  if (summary) {
    return (
      <PracticeReviewWorkspace
        title="Error Wiper 完成"
        subtitle="这一轮错题修复已经完成，下面直接进入逐题复盘。"
        score={initialSession.length > 0 ? Math.round((summary.wiped / initialSession.length) * 100) : 0}
        theme="rose"
        stats={[
          { label: '错题总数', value: initialSession.length, toneClassName: 'text-rose-200' },
          { label: '本轮答对', value: summary.states.filter(Boolean).length, toneClassName: 'text-emerald-300' },
          { label: '成功擦除', value: summary.wiped, toneClassName: 'text-cyan-200' },
          { label: '剩余待修复', value: summary.remaining, toneClassName: 'text-amber-300' },
        ]}
        recommendation={
          summary.remaining > 0
            ? '还有一部分错题没有彻底擦除，建议再来一轮 Error Wiper，或者切回 Smart Drill 检查整体稳定性。'
            : '这轮已经把当前错题基本收干净，可以回到练习中心切到 Smart Drill 或 Mock Arena 继续。'
        }
        note={submitError}
        items={initialSession.map((entry, index) => ({
          id: entry.id,
          order: index + 1,
          userAnswer: submittedAnswers[entry.questionId] ?? submittedAnswers[entry.id] ?? null,
          isCorrect: summary.states[index] ?? false,
          question: entry.question,
          emphasisNote: `当前修复进度 ${entry.masteryLevel} / 3`,
        }))}
        primaryActionLabel="返回练习中心"
        primaryAction={() => onSessionComplete({ wiped: summary.wiped, remaining: summary.remaining })}
        secondaryActionLabel="再来一轮"
        secondaryAction={reloadPage}
        userTier={userTier}
      />
    );
  }

  if (!hasStarted) {
    return (
      <div className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_16px_36px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950/80">
        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-rose-500">Error Wiper Preview</div>
        <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white">开始一轮错题修复</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          本轮会把最近不稳定的错题完整铺开，统一在三栏答题页里做完后再一次性交卷。
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">待修复</div>
            <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{initialSession.length} 题</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">预计时间</div>
            <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{Math.max(8, initialSession.length)} 分钟</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">修复规则</div>
            <div className="mt-2 text-lg font-black text-slate-900 dark:text-white">答对推进 1 级</div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-rose-500 px-5 font-black text-white transition hover:bg-rose-400"
            onClick={() => setHasStarted(true)}
          >
            开始 Error Wiper
          </button>
          <button
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
            onClick={() => router.push(practiceCenterHref)}
          >
            返回练习中心
          </button>
        </div>
      </div>
    );
  }

  return (
    <UnifiedPracticeWorkspace
      title="Error Wiper"
      modeLabel="Error Wiper"
      subtitle="错题会完整铺开，整组完成后一次性交卷。"
      questions={workspaceQuestions}
      onSubmit={handleSubmit}
      onRefresh={reloadPage}
      onExit={() => router.push(practiceCenterHref)}
      submitLabel="提交错题修复"
      refreshLabel="刷新错题组"
      exitLabel="退出 Error Wiper"
      isSubmitting={isSubmitting}
      rightPanelNote="Error Wiper 更强调修复效率。建议先做完整组，再看这轮到底擦除了多少题。"
    />
  );
};
