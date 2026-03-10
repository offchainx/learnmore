'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  BrainCircuit,
  CircleCheck,
  CircleX,
  Clock3,
  Eraser,
  Flame,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Question, QuestionCard } from '@/components/business/question';

export interface ErrorBookEntry {
  id: string;
  questionId: string;
  masteryLevel: number; // 0-3
  question: Question;
}

interface ErrorWiperSessionProps {
  initialSession: ErrorBookEntry[];
  onSessionComplete: (results: { wiped: number; remaining: number }) => void;
  onUpdateProgress: (questionId: string, isCorrect: boolean) => Promise<void>;
}

type ErrorWiperPhase = 'setup' | 'active' | 'summary';

const MasteryDots = ({ level }: { level: number }) => (
  <div className="flex gap-1.5">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className={`w-2.5 h-2.5 rounded-full transition-all duration-500 shadow-sm ${
          i <= level 
            ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' 
            : 'bg-slate-800 border border-slate-700'
        }`}
      />
    ))}
  </div>
);

function isAnswerCorrect(question: Question, userAnswer: string | string[] | null): boolean {
  if (userAnswer === null || userAnswer === undefined || question.answer === null || question.answer === undefined) {
    return false;
  }

  if (question.type === 'SINGLE_CHOICE' || question.type === 'TRUE_FALSE' || question.type === 'MCQ') {
    return String(userAnswer) === String(question.answer);
  }

  if (question.type === 'MULTIPLE_CHOICE') {
    const expected = Array.isArray(question.answer) ? question.answer.map(String) : [String(question.answer)];
    const actual = Array.isArray(userAnswer) ? userAnswer.map(String) : [String(userAnswer)];
    if (expected.length !== actual.length) return false;
    const sortedExpected = [...expected].sort();
    const sortedActual = [...actual].sort();
    return sortedExpected.every((value, index) => value === sortedActual[index]);
  }

  if (question.type === 'FILL_BLANK') {
    if (Array.isArray(question.answer)) {
      return question.answer.map(String).includes(String(userAnswer).trim());
    }
    return String(question.answer).trim() === String(userAnswer).trim();
  }

  return false;
}

export const ErrorWiperSession: React.FC<ErrorWiperSessionProps> = ({
  initialSession,
  onSessionComplete,
  onUpdateProgress
}) => {
  const [phase, setPhase] = useState<ErrorWiperPhase>('setup');
  const [queue, setQueue] = useState<ErrorBookEntry[]>(initialSession);
  const [wipedCount, setWipedCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalInitial] = useState(initialSession.length);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  const [userAnswer, setUserAnswer] = useState<string | string[] | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState(0);

  const currentEntry = queue[0] || null;
  const nextEntry = queue[1] || null;
  const processedCount = correctCount + incorrectCount;
  const reviewProgress = totalInitial > 0 ? Math.round((processedCount / totalInitial) * 100) : 0;
  const estimatedMinutes = Math.max(4, Math.round(totalInitial * 0.9));
  const coachNote = useMemo(() => {
    if (wipedCount >= Math.max(1, Math.floor(totalInitial / 2))) {
      return '本轮修复效率不错，可以在结束后切到 Smart Drill 再测一次稳定性。';
    }
    if (incorrectCount > correctCount) {
      return '当前错因还没收口，建议专注看解析，不要急着追速度。';
    }
    return '保持稳定节奏，把 3 次正确作为单题修复目标。';
  }, [correctCount, incorrectCount, totalInitial, wipedCount]);

  const handleSubmit = async () => {
    if (!currentEntry || isAnswered) return;

    const correct = isAnswerCorrect(currentEntry.question, userAnswer);
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      setStreak(prev => prev + 1);
      setCorrectCount(prev => prev + 1);
    } else {
      setStreak(0);
      setIncorrectCount(prev => prev + 1);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }

    await onUpdateProgress(currentEntry.questionId, correct);
  };

  const handleContinue = () => {
    const entry = { ...currentEntry };
    const newQueue = [...queue];
    newQueue.shift();

    if (isCorrect === true) {
      entry.masteryLevel += 1;
    } else {
      entry.masteryLevel = 0;
    }

    if (entry.masteryLevel >= 3) {
      setWipedCount(prev => prev + 1);
    } else {
      newQueue.push(entry);
    }

    if (newQueue.length === 0) {
      setSessionDurationMinutes(Math.max(1, Math.round((Date.now() - startedAt) / 60000)));
      setPhase('summary');
      return;
    }

    setQueue(newQueue);
    setUserAnswer(null);
    setIsAnswered(false);
    setIsCorrect(null);
  };

  const handleBackToPractice = async () => {
    await onSessionComplete({ wiped: wipedCount, remaining: queue.length });
  };

  if (totalInitial === 0) return null;

  if (phase === 'setup') {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 py-4">
        <Card className="overflow-hidden rounded-[30px] border-slate-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(248,113,113,0.16),_transparent_28%),linear-gradient(135deg,_#0f172a,_#111827_58%,_#120d12)] text-white shadow-[0_24px_70px_rgba(15,23,42,0.24)] dark:border-slate-800">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-rose-200">
                  <Eraser className="h-3.5 w-3.5" />
                  Error Wiper Setup
                </div>
                <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">开始一轮错因修复</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                  本轮会优先处理你最近做错且尚未稳定修复的题目。目标不是刷完，而是把每道题纠正到足够稳定。
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                    <ShieldAlert className="h-3.5 w-3.5 text-rose-300" />
                    Error Items
                  </div>
                  <div className="mt-3 text-2xl font-black text-white">{totalInitial}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                    <Clock3 className="h-3.5 w-3.5 text-rose-300" />
                    Estimate
                  </div>
                  <div className="mt-3 text-2xl font-black text-white">{estimatedMinutes} min</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                    <BrainCircuit className="h-3.5 w-3.5 text-rose-300" />
                    Goal
                  </div>
                  <div className="mt-3 text-lg font-black text-white">3 correct = repaired</div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-rose-300/80">Repair Rules</div>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                  <li>同一道题连续答对 3 次才算真正修复。</li>
                  <li>答错会重置该题当前修复进度。</li>
                  <li>优先看解析，把错因修正再继续，不要只记答案。</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-rose-300/80">Session Focus</div>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>修复优先级</span>
                    <span className="font-bold text-white">低掌握度优先</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>反馈方式</span>
                    <span className="font-bold text-white">每题即时判定</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>目标输出</span>
                    <span className="font-bold text-white">修复摘要 + 下一步建议</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button className="rounded-2xl bg-rose-400 px-5 py-6 text-sm font-black text-slate-950 hover:bg-rose-300" onClick={() => setPhase('active')}>
                开始 Error Wiper
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="rounded-2xl border-white/10 bg-white/5 px-5 py-6 text-white hover:bg-white/10 hover:text-white" onClick={handleBackToPractice}>
                返回练习中心
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (phase === 'summary') {
    const repairedRatio = totalInitial > 0 ? Math.round((wipedCount / totalInitial) * 100) : 0;
    return (
      <Card className="mx-auto mt-4 max-w-4xl rounded-[30px] border-slate-200/80 shadow-lg dark:border-slate-800">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="space-y-3 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:text-rose-300">
              <CircleCheck className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">Error Wiper Complete</h2>
            <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
              这一轮清错已经结束。重点不是做完多少题，而是修复了多少题的错因。
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-900/60">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Repaired</div>
              <div className="mt-2 text-2xl font-black text-emerald-500">{wipedCount}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-900/60">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Correct</div>
              <div className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{correctCount}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-900/60">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Wrong</div>
              <div className="mt-2 text-2xl font-black text-rose-500">{incorrectCount}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-900/60">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Duration</div>
              <div className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{sessionDurationMinutes}m</div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Repair Rate</div>
                <div className="mt-2 text-xl font-black text-slate-950 dark:text-white">{repairedRatio}% 本轮修复成功</div>
              </div>
              <div className="min-w-[120px]">
                <Progress value={repairedRatio} className="h-2.5" />
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{coachNote}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">What improved</div>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                成功修复的题已经达到连续正确阈值，下一轮不应该再把这些题当作当前优先项。
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Next move</div>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                如果这轮错误仍偏多，建议继续 Error Wiper；如果已稳定，可以回到 Smart Drill 检查迁移效果。
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button className="rounded-2xl bg-rose-500 hover:bg-rose-400" onClick={() => window.location.reload()}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              再跑一轮清错
            </Button>
            <Button variant="outline" className="rounded-2xl" onClick={handleBackToPractice}>
              返回练习中心
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center px-2 py-4 sm:px-6 lg:min-h-0">
      <div className="mb-6 w-full rounded-[28px] border border-white/5 bg-[#0d121f]/90 p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Eraser className="w-6 h-6 text-red-500/70" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progress</div>
            <div className="text-xl font-black text-white">{wipedCount} / {totalInitial}</div>
            <div className="mt-1 text-xs text-slate-400">{processedCount} reviewed · {reviewProgress}% session progress</div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 mb-1.5">
            <Flame className={`w-4 h-4 ${streak > 0 ? 'text-orange-500 animate-pulse' : 'text-slate-700'}`} />
            <span className="text-xs font-black text-white uppercase tracking-widest">Streak: {streak}</span>
          </div>
          <div className="w-32">
            <Progress value={reviewProgress} className="h-2 bg-slate-800" />
          </div>
        </div>
      </div>

      <div className="mb-4 grid w-full gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-[#111827]/80 p-4 text-white">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Current Target</div>
          <div className="mt-2 text-lg font-black">{currentEntry?.masteryLevel ?? 0}/3 repaired</div>
        </div>
        <div className="rounded-2xl border border-white/5 bg-[#111827]/80 p-4 text-white">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Coach Note</div>
          <div className="mt-2 text-sm leading-6 text-slate-300">{coachNote}</div>
        </div>
        <div className="rounded-2xl border border-white/5 bg-[#111827]/80 p-4 text-white">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Next in Queue</div>
          <div className="mt-2 text-sm font-bold text-slate-200">{nextEntry ? nextEntry.question.content : '本轮这是最后一题'}</div>
        </div>
      </div>

      <div className="relative h-auto min-h-[720px] w-full perspective-1000">
        <AnimatePresence mode="popLayout">
          {nextEntry && !isAnswered && (
            <motion.div 
              key="bg-stack"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 0.4, scale: 0.96, y: 10, rotate: -1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-0 pointer-events-none"
            >
              <Card className="h-full bg-[#161d2a] border-white/5 rounded-[2.5rem] shadow-none" />
            </motion.div>
          )}

          {/* Active Card */}
          <motion.div
            key={currentEntry.id}
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ 
              scale: 1, 
              y: 0, 
              opacity: 1,
              x: isShaking ? [-10, 10, -10, 10, 0] : 0
            }}
            exit={isCorrect ? { x: 1000, y: -150, rotate: 25, opacity: 0, transition: { duration: 0.5 } } : { opacity: 0, scale: 0.95 }}
            transition={{ 
              type: 'spring', 
              stiffness: 260, 
              damping: 24,
              x: isShaking ? { duration: 0.4 } : { type: 'spring' }
            }}
            className="absolute inset-0 z-10"
          >
            <Card className={`
              h-full min-h-[720px] flex flex-col p-0 overflow-hidden bg-[#161e2c] border-2 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.6)] transition-all duration-500
              ${isAnswered ? (isCorrect ? 'border-emerald-500/40 shadow-emerald-500/10' : 'border-red-500/40 shadow-red-500/10') : 'border-white/10'}
            `}>
              <div className="px-8 py-5 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-500/10">
                    <Target className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Mastery Level</span>
                </div>
                <MasteryDots level={currentEntry.masteryLevel} />
              </div>

              <div className="flex flex-1 flex-col p-8">
                <div className="mb-6 rounded-3xl border border-white/5 bg-slate-950/30 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Current Error</div>
                      <div className="mt-2 text-lg font-black text-white">{currentEntry.question.type.replace('_', ' ')}</div>
                    </div>
                    <div className={`rounded-2xl px-3 py-2 text-xs font-black uppercase tracking-[0.18em] ${
                      currentEntry.masteryLevel >= 2
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : currentEntry.masteryLevel === 1
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {currentEntry.masteryLevel >= 2 ? 'Almost repaired' : currentEntry.masteryLevel === 1 ? 'Recovering' : 'Needs reset'}
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <QuestionCard
                    question={currentEntry.question}
                    userAnswer={userAnswer}
                    onAnswerChange={setUserAnswer}
                    showResult={isAnswered}
                    readOnly={isAnswered}
                    className="border-white/5 bg-transparent shadow-none"
                  />
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-3 shrink-0">
                  {!isAnswered ? (
                    <Button 
                      size="xl"
                      className="h-16 w-full rounded-2xl bg-rose-500 text-sm font-black tracking-widest text-white shadow-rose-500/20 hover:bg-rose-400 active:scale-95"
                      disabled={!userAnswer || (Array.isArray(userAnswer) && userAnswer.length === 0)}
                      onClick={handleSubmit}
                    >
                      CHECK REPAIR
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  ) : (
                    <div className="space-y-3">
                       <div className={`p-4 rounded-2xl flex items-center gap-3 border shadow-lg ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                          <div className={`p-1.5 rounded-lg ${isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                             {isCorrect ? <CircleCheck className="w-4 h-4" /> : <CircleX className="w-4 h-4" />}
                          </div>
                          <span className={`text-sm font-black tracking-wide ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isCorrect ? 'REPAIR PROGRESS +1' : 'PROGRESS RESET'}
                          </span>
                       </div>

                       <Button 
                         size="xl"
                         className={`h-16 w-full rounded-2xl text-sm font-black tracking-widest transition-all ${isCorrect ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20' : 'bg-slate-800 hover:bg-slate-700'}`}
                         onClick={handleContinue}
                       >
                         {isCorrect && currentEntry.masteryLevel + 1 >= 3 ? 'MARK AS REPAIRED' : 'CONTINUE REPAIR'}
                         <ArrowRight className="ml-2 w-4 h-4" />
                       </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600"
      >
        <Sparkles className="h-3 w-3 text-yellow-500/40" />
        <span>Repair rule: 3 correct answers are required to clear an error permanently</span>
      </motion.div>
    </div>
  );
};
