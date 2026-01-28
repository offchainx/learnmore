
import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ProgressBar } from './components/ProgressBar';
import { MOCK_PROBLEMS } from './constants';
import { UserStats } from './types';
import { getProblemHint, explainSolution } from './services/geminiService';

const App: React.FC = () => {
  const [currentProblemIdx, setCurrentProblemIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState({ hint: false, explanation: false });
  
  const [stats, setStats] = useState<UserStats>({
    mastery: 82,
    sessionTime: "18:45",
    streak: 4,
    currentProblemIndex: 13,
    totalProblems: 20
  });

  const currentProblem = useMemo(() => 
    MOCK_PROBLEMS[currentProblemIdx % MOCK_PROBLEMS.length]
  , [currentProblemIdx]);

  const handleCheckAnswer = async () => {
    if (selectedIdx === null || isCorrect !== null) return;
    
    const correct = selectedIdx === currentProblem.correctIndex;
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

    // Automatically get an explanation after answering
    setIsLoading(prev => ({ ...prev, explanation: true }));
    const result = await explainSolution(
      currentProblem.equation, 
      currentProblem.options[selectedIdx], 
      correct
    );
    setExplanation(result);
    setIsLoading(prev => ({ ...prev, explanation: false }));
  };

  const handleNext = () => {
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

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0a0a16] text-slate-100">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar stats={stats} />

        <main className="flex-1 flex flex-col items-center p-4 md:p-10 overflow-y-auto scrollbar-hide">
          <div className="max-w-[840px] w-full">
            
            {/* Header / Progress */}
            <div className="flex flex-col gap-6 mb-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg text-primary">
                    <span className="material-symbols-outlined text-[20px]">school</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">Algebra I</h3>
                    <p className="text-[11px] text-slate-text uppercase font-bold tracking-widest">Chapter 4: Quadratics</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-text uppercase">Progress</span>
                  <div className="text-lg font-black text-primary">
                    {stats.currentProblemIndex + currentProblemIdx} / {stats.totalProblems}
                  </div>
                </div>
              </div>
              <ProgressBar current={7 + currentProblemIdx} total={stats.totalProblems} />
            </div>

            {/* Main Problem Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative bg-[#111126] border border-slate-accent/40 rounded-2xl p-8 md:p-12 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/30 rounded-full">
                    <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Level {currentProblem.level} Problem</span>
                  </div>
                  <div className="text-xs font-bold text-slate-text tracking-widest uppercase">
                    ID: #{currentProblem.id}
                  </div>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold mb-8 leading-tight text-white/90">
                  {currentProblem.question}
                </h2>

                <div className="bg-slate-accent/10 border border-slate-accent/30 rounded-xl p-8 mb-10 flex justify-center items-center">
                  <code className="text-3xl md:text-5xl font-mono text-primary drop-shadow-[0_0_15px_rgba(17,17,212,0.3)] select-all">
                    {currentProblem.equation}
                  </code>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentProblem.options.map((option, idx) => (
                    <button
                      key={idx}
                      disabled={isCorrect !== null}
                      onClick={() => setSelectedIdx(idx)}
                      className={`group relative flex items-center p-5 rounded-xl border-2 transition-all duration-300 text-left ${
                        selectedIdx === idx
                          ? isCorrect === null 
                            ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(17,17,212,0.15)]'
                            : isCorrect 
                              ? 'border-green-500 bg-green-500/10'
                              : 'border-red-500 bg-red-500/10'
                          : 'border-slate-accent/40 bg-slate-accent/5 hover:border-slate-accent hover:bg-slate-accent/10'
                      } ${isCorrect !== null && idx !== selectedIdx && idx !== currentProblem.correctIndex ? 'opacity-40' : ''}
                        ${isCorrect !== null && idx === currentProblem.correctIndex && idx !== selectedIdx ? 'border-green-500/50 bg-green-500/5 ring-1 ring-green-500/20' : ''}
                      `}
                    >
                      <div className={`mr-4 size-6 rounded-md border-2 flex items-center justify-center transition-all ${
                        selectedIdx === idx ? 'border-primary bg-primary' : 'border-slate-accent'
                      }`}>
                        {selectedIdx === idx && (
                          <span className="material-symbols-outlined text-[14px] font-bold text-white">check</span>
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
                      <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                      Step-by-Step Analysis
                    </div>
                    {isLoading.explanation ? (
                      <div className="flex items-center gap-3 text-slate-text">
                        <div className="size-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="size-2 bg-primary rounded-full animate-bounce delay-75"></div>
                        <div className="size-2 bg-primary rounded-full animate-bounce delay-150"></div>
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
            <div className="flex flex-col sm:flex-row items-center justify-between mt-10 gap-6">
              <div className="flex gap-2">
                <button
                  onClick={handleShowHint}
                  disabled={isLoading.hint || !!hint || isCorrect !== null}
                  className="group flex items-center gap-2 px-6 py-3 rounded-xl text-slate-text hover:text-white hover:bg-slate-accent/40 transition-all font-bold text-sm uppercase tracking-wider disabled:opacity-30"
                >
                  <span className={`material-symbols-outlined transition-transform ${isLoading.hint ? 'animate-spin' : 'group-hover:rotate-12'}`}>
                    {isLoading.hint ? 'progress_activity' : 'lightbulb'}
                  </span>
                  {hint ? 'Hint Viewed' : 'Unlock Hint'}
                </button>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button
                  onClick={handleNext}
                  className="flex-1 sm:flex-none px-8 py-3 rounded-xl border border-slate-accent/60 text-slate-text font-bold hover:bg-slate-accent/40 transition-all"
                >
                  {isCorrect === null ? 'Skip' : 'Next'}
                </button>
                <button
                  onClick={isCorrect === null ? handleCheckAnswer : handleNext}
                  disabled={selectedIdx === null}
                  className={`flex-1 sm:flex-none px-12 py-3 rounded-xl text-white font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:grayscale ${
                    isCorrect === null ? 'bg-primary hover:shadow-primary/20' : isCorrect ? 'bg-green-600' : 'bg-red-600'
                  }`}
                >
                  {isCorrect === null ? 'Confirm Answer' : 'Continue'}
                </button>
              </div>
            </div>

            {/* Popover Hint */}
            {hint && (
              <div className="mt-6 p-6 bg-primary/5 border-l-4 border-primary rounded-r-xl animate-in slide-in-from-left duration-500">
                <div className="flex items-center gap-2 mb-2 text-primary">
                  <span className="material-symbols-outlined text-[20px]">psychology</span>
                  <span className="text-xs font-black uppercase tracking-widest">Tutor Tip</span>
                </div>
                <p className="text-sm text-slate-300 italic leading-relaxed">"{hint}"</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
    </div>
  );
};

export default App;
