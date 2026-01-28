'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/practice/chapter-drill/Header';
import { Sidebar } from '@/components/practice/chapter-drill/Sidebar';
import { ProgressBar } from '@/components/practice/chapter-drill/ProgressBar';
import { getProblemHint, explainSolution } from '@/actions/ai-tutor';
import { Problem, UserStats } from '@/components/practice/chapter-drill/types';
import { Check, Lightbulb, Loader2, Sparkles, X } from 'lucide-react';

interface DrillInterfaceProps {
  initialProblems: Problem[];
  chapterTitle: string;
  subjectName: string;
  initialStats: UserStats;
  sidebarChapters?: { id: string; title: string; isCompleted: boolean; isLocked: boolean; isActive: boolean; }[];
}

export default function DrillInterface({ 
  initialProblems, 
  chapterTitle, 
  subjectName, 
  initialStats,
  sidebarChapters = []
}: DrillInterfaceProps) {
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
    if (selectedIdx === null || isCorrect !== null) return;
    
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
    if (isLoading.hint || hint) return;
    setIsLoading(prev => ({ ...prev, hint: true }));
    const generatedHint = await getProblemHint(currentProblem.equation, currentProblem.question);
    setHint(generatedHint || null);
    setIsLoading(prev => ({ ...prev, hint: false }));
  };

  if (!currentProblem) return <div>Loading...</div>;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0a0a16] text-slate-100 font-sans">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          stats={stats} 
          chapterTitle={chapterTitle} 
          subjectName={subjectName} 
          chapters={sidebarChapters}
        />

        <main className="flex-1 flex flex-col items-center p-4 md:p-10 overflow-y-auto scrollbar-hide bg-[#0a0a16]">
          <div className="max-w-[840px] w-full">
            
            {/* Header / Progress */}
            <div className="flex flex-col gap-6 mb-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#1111d4]/20 rounded-lg text-[#1111d4]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">{subjectName}</h3>
                    <p className="text-[11px] text-[#9292c9] uppercase font-bold tracking-widest">{chapterTitle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#9292c9] uppercase">Progress</span>
                  <div className="text-lg font-black text-[#1111d4]">
                    {currentProblemIdx + 1} / {initialProblems.length}
                  </div>
                </div>
              </div>
              <ProgressBar current={currentProblemIdx + 1} total={initialProblems.length} />
            </div>

            {/* Main Problem Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#1111d4]/20 to-purple-600/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative bg-[#111126] border border-[#232348]/40 rounded-2xl p-8 md:p-12 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2 px-3 py-1 bg-[#1111d4]/10 border border-[#1111d4]/30 rounded-full">
                    <span className="size-2 rounded-full bg-[#1111d4] animate-pulse"></span>
                    <span className="text-[10px] font-black text-[#1111d4] uppercase tracking-widest">Level {currentProblem.level} Problem</span>
                  </div>
                  <div className="text-xs font-bold text-[#9292c9] tracking-widest uppercase">
                    ID: #{currentProblem.id.slice(0, 6)}
                  </div>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold mb-8 leading-tight text-white/90">
                  {currentProblem.question}
                </h2>

                {currentProblem.equation && (
                  <div className="bg-[#232348]/10 border border-[#232348]/30 rounded-xl p-8 mb-10 flex justify-center items-center">
                    <code className="text-3xl md:text-5xl font-mono text-[#1111d4] drop-shadow-[0_0_15px_rgba(17,17,212,0.3)] select-all">
                      {currentProblem.equation}
                    </code>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentOptions.map((option, idx) => (
                    <button
                      key={idx}
                      disabled={isCorrect !== null}
                      onClick={() => setSelectedIdx(idx)}
                      className={`group relative flex items-center p-5 rounded-xl border-2 transition-all duration-300 text-left ${
                        selectedIdx === idx
                          ? isCorrect === null 
                            ? 'border-[#1111d4] bg-[#1111d4]/10 shadow-[0_0_20px_rgba(17,17,212,0.15)]'
                            : isCorrect 
                              ? 'border-green-500 bg-green-500/10'
                              : 'border-red-500 bg-red-500/10'
                          : 'border-[#232348]/40 bg-[#232348]/5 hover:border-[#232348] hover:bg-[#232348]/10'
                      } ${isCorrect !== null && idx !== selectedIdx && idx !== currentProblem.correctIndex ? 'opacity-40' : ''}
                        ${isCorrect !== null && idx === currentProblem.correctIndex && idx !== selectedIdx ? 'border-green-500/50 bg-green-500/5 ring-1 ring-green-500/20' : ''}
                      `}
                    >
                      <div className={`mr-4 size-6 rounded-md border-2 flex items-center justify-center transition-all ${
                        selectedIdx === idx ? 'border-[#1111d4] bg-[#1111d4]' : 'border-[#232348]'
                      }`}>
                        {selectedIdx === idx && (
                          <Check className="w-3.5 h-3.5 font-bold text-white" />
                        )}
                      </div>
                      <span className="text-lg font-medium">{option}</span>
                    </button>
                  ))}
                </div>

                {/* AI Explanation Area */}
                {(explanation || isLoading.explanation) && (
                  <div className={`mt-8 p-6 rounded-xl border animate-in fade-in slide-in-from-top-4 duration-500 ${
                    isCorrect ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'
                  }`}>
                    <div className="flex items-center gap-2 mb-3 text-xs font-black uppercase tracking-widest opacity-80">
                      <Sparkles className="w-[18px]" />
                      Step-by-Step Analysis
                    </div>
                    {isLoading.explanation ? (
                      <div className="flex items-center gap-3 text-[#9292c9]">
                        <Loader2 className="w-4 h-4 animate-spin text-[#1111d4]" />
                        <span className="text-sm">Gemini is analyzing the solution...</span>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed text-slate-300">
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
                  className="group flex items-center gap-2 px-6 py-3 rounded-xl text-[#9292c9] hover:text-white hover:bg-[#232348]/40 transition-all font-bold text-sm uppercase tracking-wider disabled:opacity-30"
                >
                  {isLoading.hint ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Lightbulb className="w-5 h-5 group-hover:text-yellow-400 transition-colors" />
                  )}
                  {hint ? 'Hint Viewed' : 'Unlock Hint'}
                </button>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button
                  onClick={handleNext}
                  className="flex-1 sm:flex-none px-8 py-3 rounded-xl border border-[#232348]/60 text-[#9292c9] font-bold hover:bg-[#232348]/40 transition-all"
                >
                  {isCorrect === null ? 'Skip' : 'Next'}
                </button>
                <button
                  onClick={isCorrect === null ? handleCheckAnswer : handleNext}
                  disabled={selectedIdx === null}
                  className={`flex-1 sm:flex-none px-12 py-3 rounded-xl text-white font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:grayscale ${
                    isCorrect === null ? 'bg-[#1111d4] hover:shadow-[#1111d4]/20' : isCorrect ? 'bg-green-600' : 'bg-red-600'
                  }`}
                >
                  {isCorrect === null ? 'Confirm Answer' : 'Continue'}
                </button>
              </div>
            </div>

            {/* Popover Hint */}
            {hint && (
              <div className="mt-6 p-6 bg-[#1111d4]/5 border-l-4 border-[#1111d4] rounded-r-xl animate-in slide-in-from-left duration-500">
                <div className="flex items-center gap-2 mb-2 text-[#1111d4]">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">Tutor Tip</span>
                </div>
                <p className="text-sm text-slate-300 italic leading-relaxed">"{hint}"</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
