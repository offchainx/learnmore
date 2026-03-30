'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/practice/chapter-drill/Header';
import { Sidebar } from '@/components/practice/chapter-drill/Sidebar';
import { ProgressBar } from '@/components/practice/chapter-drill/ProgressBar';
import { getProblemHint, explainSolution } from '@/actions/ai/tutor';
import { Problem, UserStats } from '@/components/practice/chapter-drill/types';
import { Check, Lightbulb, Loader2, Sparkles } from 'lucide-react';

interface ChapterDrillSessionProps {
  initialProblems: Problem[];
  chapterTitle: string;
  subjectName: string;
  initialStats: UserStats;
  sidebarChapters?: { id: string; title: string; isCompleted: boolean; isLocked: boolean; isActive: boolean; }[];
}

export default function ChapterDrillSession({
  initialProblems, 
  chapterTitle, 
  subjectName, 
  initialStats,
  sidebarChapters = []
}: ChapterDrillSessionProps) {
  const router = useRouter();
  const [currentProblemIdx, setCurrentProblemIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState({ hint: false, explanation: false });
  
  const [stats, setStats] = useState<UserStats>(initialStats);

  const currentProblem = useMemo(() => {
    if (!initialProblems || initialProblems.length === 0) return null;
    return initialProblems[currentProblemIdx % initialProblems.length];
  }, [currentProblemIdx, initialProblems]);

  // Transform options object to array if needed, or use parsedOptions
  const currentOptions = useMemo(() => {
    if (!currentProblem) return [];
    if (currentProblem.parsedOptions) return currentProblem.parsedOptions;
    if (currentProblem.options && typeof currentProblem.options === 'object') {
      return Object.values(currentProblem.options);
    }
    return [];
  }, [currentProblem]);

  const handleCheckAnswer = async () => {
    if (selectedIdx === null || isCorrect !== null || !currentProblem) return;

    // Determine correctness based on answer key ("a", "b"...) or index
    // Assuming currentProblem.correctIndex is set correctly by the server component
    let correct = false;
    if (currentProblem.correctIndex !== undefined) {
      correct = selectedIdx === currentProblem.correctIndex;
    }
    
    setIsCorrect(correct);
    
    if (correct) {
      setStats(prev => ({ 
        ...prev, 
        streak: prev.streak + 1, 
        mastery: Math.min(100, prev.mastery + 3) 
      }));
    } else {
      setStats(prev => ({ ...prev, streak: 0 }));
    }

    // Automatically get an explanation
    setIsLoading(prev => ({ ...prev, explanation: true }));
    const result = await explainSolution(
      currentProblem.equation,
      currentProblem.question,
      currentOptions[selectedIdx], 
      correct
    );
    setExplanation(result);
    setIsLoading(prev => ({ ...prev, explanation: false }));
  };

  const handleNext = () => {
    if (currentProblemIdx >= initialProblems.length - 1) {
      // Finished
      router.push('/dashboard/practice'); // Or a summary screen
      return;
    }
    setCurrentProblemIdx(prev => prev + 1);
    setSelectedIdx(null);
    setIsCorrect(null);
    setHint(null);
    setExplanation(null);
  };

  const handleShowHint = async () => {
    if (isLoading.hint || hint || !currentProblem) return;
    setIsLoading(prev => ({ ...prev, hint: true }));
    const generatedHint = await getProblemHint(currentProblem.equation, currentProblem.question);
    setHint(generatedHint || null);
    setIsLoading(prev => ({ ...prev, hint: false }));
  };

  if (!currentProblem) return <div>Loading...</div>;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[linear-gradient(180deg,hsl(var(--page-bg-elevated))_0%,hsl(var(--surface-default))_48%,hsl(var(--surface-muted))_100%)] font-sans text-text-primary dark:bg-page dark:text-text-primary">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          stats={stats} 
          chapterTitle={chapterTitle} 
          subjectName={subjectName} 
          chapters={sidebarChapters}
        />

        <main className="scrollbar-hide flex flex-1 flex-col items-center overflow-y-auto bg-transparent p-4 tablet:p-10">
          <div className="max-w-[840px] w-full">
            
            {/* Header / Progress */}
            <div className="flex flex-col gap-6 mb-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[hsl(var(--state-info-bg))] p-2 text-[hsl(var(--state-info-fg))] dark:bg-[hsl(var(--state-info-bg))] dark:text-[hsl(var(--state-info-fg))]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-tight text-text-primary dark:text-text-primary">{subjectName}</h3>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-text-secondary dark:text-text-secondary">{chapterTitle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold uppercase text-text-secondary dark:text-text-secondary">Progress</span>
                  <div className="text-lg font-black text-primary dark:text-primary">
                    {currentProblemIdx + 1} / {initialProblems.length}
                  </div>
                </div>
              </div>
              <ProgressBar current={currentProblemIdx + 1} total={initialProblems.length} />
            </div>

            {/* Main Problem Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[hsl(var(--state-info-bg))]/90 to-[hsl(var(--state-warning-bg))]/80 blur opacity-50 transition duration-1000 group-hover:opacity-70 dark:from-[hsl(var(--state-info-bg))]/30 dark:to-[hsl(var(--state-warning-bg))]/18"></div>
              <div className="relative rounded-2xl border border-borderTone bg-surface p-8 shadow-[0_24px_70px_rgba(148,163,184,0.16)] dark:border-borderTone dark:bg-surface tablet:p-12 dark:shadow-[0_20px_50px_rgba(2,8,23,0.36)]">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2 rounded-full border border-borderTone bg-[hsl(var(--state-info-bg))] px-3 py-1 dark:border-borderTone dark:bg-[hsl(var(--state-info-bg))]">
                    <span className="size-2 animate-pulse rounded-full bg-[hsl(var(--state-info-fg))] dark:bg-[hsl(var(--state-info-fg))]"></span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--state-info-fg))] dark:text-[hsl(var(--state-info-fg))]">Level {currentProblem.level} Problem</span>
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest text-text-secondary dark:text-text-secondary">
                    ID: #{currentProblem.id.slice(0, 6)}
                  </div>
                </div>

                <h2 className="mb-8 text-2xl font-bold leading-tight text-text-primary dark:text-text-primary tablet:text-3xl">
                  {currentProblem.question}
                </h2>

                {currentProblem.equation && (
                  <div className="mb-10 flex items-center justify-center rounded-xl border border-borderTone bg-surface-subtle p-8 dark:border-borderTone dark:bg-surface-subtle">
                    <code className="select-all font-mono text-3xl text-primary drop-shadow-[0_0_15px_rgba(59,130,246,0.16)] dark:text-primary tablet:text-5xl">
                      {currentProblem.equation}
                    </code>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
                  {currentOptions.map((option, idx) => (
                    <button
                      key={idx}
                      disabled={isCorrect !== null}
                      onClick={() => setSelectedIdx(idx)}
                      className={`group relative flex items-center p-5 rounded-xl border-2 transition-all duration-300 text-left ${
                        selectedIdx === idx
                          ? isCorrect === null 
                            ? 'border-borderTone bg-[hsl(var(--state-info-bg))] shadow-[0_0_20px_rgba(59,130,246,0.12)] dark:border-borderTone dark:bg-[hsl(var(--state-info-bg))]'
                            : isCorrect 
                              ? 'border-borderTone bg-[hsl(var(--state-success-bg))] dark:border-borderTone dark:bg-[hsl(var(--state-success-bg))]'
                              : 'border-borderTone bg-[hsl(var(--state-danger-bg))] dark:border-borderTone dark:bg-[hsl(var(--state-danger-bg))]'
                          : 'border-borderTone bg-surface-subtle hover:border-[hsl(var(--border-strong))] hover:bg-surface dark:border-borderTone dark:bg-surface-subtle dark:hover:border-[hsl(var(--border-strong))] dark:hover:bg-surface'
                      } ${isCorrect !== null && idx !== selectedIdx && idx !== currentProblem.correctIndex ? 'opacity-40' : ''}
                        ${isCorrect !== null && idx === currentProblem.correctIndex && idx !== selectedIdx ? 'border-borderTone bg-[hsl(var(--state-success-bg))] ring-1 ring-[hsl(var(--state-success-fg))]/20 dark:border-borderTone dark:bg-[hsl(var(--state-success-bg))]' : ''}
                      `}
                    >
                      <div className={`mr-4 size-6 rounded-md border-2 flex items-center justify-center transition-all ${
                        selectedIdx === idx ? 'border-primary bg-primary dark:border-primary dark:bg-primary' : 'border-borderTone dark:border-borderTone'
                      }`}>
                        {selectedIdx === idx && (
                          <Check className="w-3.5 h-3.5 font-bold text-white" />
                        )}
                      </div>
                      <span className="text-lg font-medium text-text-primary dark:text-text-primary">{option}</span>
                    </button>
                  ))}
                </div>

                {/* AI Explanation Area */}
                {(explanation || isLoading.explanation) && (
                  <div className={`mt-8 p-6 rounded-xl border animate-in fade-in slide-in-from-top-4 duration-500 ${
                    isCorrect
                      ? 'border-borderTone bg-[hsl(var(--state-success-bg))] dark:border-borderTone dark:bg-[hsl(var(--state-success-bg))]'
                      : 'border-borderTone bg-[hsl(var(--state-danger-bg))] dark:border-borderTone dark:bg-[hsl(var(--state-danger-bg))]'
                  }`}>
                    <div className="flex items-center gap-2 mb-3 text-xs font-black uppercase tracking-widest opacity-80">
                      <Sparkles className="w-[18px]" />
                      Step-by-Step Analysis
                    </div>
                    {isLoading.explanation ? (
                      <div className="flex items-center gap-3 text-text-secondary dark:text-text-secondary">
                        <Loader2 className="h-4 w-4 animate-spin text-primary dark:text-primary" />
                        <span className="text-sm">Gemini is analyzing the solution...</span>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed text-text-secondary dark:text-text-secondary">
                        {explanation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-10 gap-6 pb-10">
              <div className="flex gap-2">
                <button
                  onClick={handleShowHint}
                  disabled={isLoading.hint || !!hint || isCorrect !== null}
                  className="group flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold uppercase tracking-wider text-text-secondary transition-all hover:bg-surface hover:text-text-primary disabled:opacity-30 dark:text-text-secondary dark:hover:bg-surface-subtle dark:hover:text-text-primary"
                >
                  {isLoading.hint ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Lightbulb className="h-5 w-5 transition-colors group-hover:text-yellow-500 dark:group-hover:text-yellow-300" />
                  )}
                  {hint ? 'Hint Viewed' : 'Unlock Hint'}
                </button>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button
                  onClick={handleNext}
                  className="flex-1 rounded-xl border border-borderTone px-8 py-3 font-bold text-text-secondary transition-all hover:bg-surface hover:text-text-primary dark:border-borderTone dark:text-text-secondary dark:hover:bg-surface-subtle dark:hover:text-text-primary sm:flex-none"
                >
                  {isCorrect === null ? 'Skip' : 'Next'}
                </button>
                <button
                  onClick={isCorrect === null ? handleCheckAnswer : handleNext}
                  disabled={selectedIdx === null}
                  className={`flex-1 sm:flex-none px-12 py-3 rounded-xl text-white font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:grayscale ${
                    isCorrect === null
                      ? 'bg-primary hover:bg-primary hover:shadow-primary/20 dark:bg-primary dark:text-white dark:hover:bg-primary'
                      : isCorrect
                        ? 'bg-[hsl(var(--state-success-fg))] hover:bg-[hsl(var(--state-success-fg))]'
                        : 'bg-[hsl(var(--state-danger-fg))] hover:bg-[hsl(var(--state-danger-fg))]'
                  }`}
                >
                  {isCorrect === null ? 'Confirm Answer' : 'Continue'}
                </button>
              </div>
            </div>

            {/* Popover Hint */}
            {hint && (
              <div className="mt-6 animate-in rounded-r-xl border-l-4 border-primary bg-[hsl(var(--state-info-bg))] p-6 duration-500 slide-in-from-left dark:border-primary dark:bg-[hsl(var(--state-info-bg))]">
                <div className="mb-2 flex items-center gap-2 text-[hsl(var(--state-info-fg))] dark:text-[hsl(var(--state-info-fg))]">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-xs font-black uppercase tracking-widest">Tutor Tip</span>
                </div>
                <p className="text-sm italic leading-relaxed text-text-secondary dark:text-text-secondary">&quot;{hint}&quot;</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
