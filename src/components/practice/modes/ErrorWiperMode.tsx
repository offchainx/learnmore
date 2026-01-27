'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eraser, CircleCheck, CircleX, ArrowRight, 
  Flame, Target, Sparkles, ChevronRight, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Question } from '@/components/business/question/types';

export interface ErrorBookEntry {
  id: string;
  questionId: string;
  masteryLevel: number; // 0-3
  question: Question;
}

interface ErrorWiperModeProps {
  initialSession: ErrorBookEntry[];
  onSessionComplete: (results: { wiped: number; remaining: number }) => void;
  onUpdateProgress: (questionId: string, isCorrect: boolean) => Promise<any>;
}

export const ErrorWiperMode: React.FC<ErrorWiperModeProps> = ({
  initialSession,
  onSessionComplete,
  onUpdateProgress
}) => {
  const [queue, setQueue] = useState<ErrorBookEntry[]>(initialSession);
  const [wipedCount, setWipedCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalInitial] = useState(initialSession.length);

  // Interaction states
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentEntry = queue[0] || null;
  const nextEntry = queue[1] || null;

  const handleSubmit = async () => {
    if (!currentEntry || isAnswered) return;

    const correct = selectedOption === currentEntry.question.answer;
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }

    await onUpdateProgress(currentEntry.questionId, correct);
  };

  const handleContinue = () => {
    const entry = { ...currentEntry };
    let newQueue = [...queue];
    newQueue.shift();

    if (isCorrect) {
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
      onSessionComplete({ wiped: wipedCount + (entry.masteryLevel >= 3 ? 1 : 0), remaining: 0 });
      return;
    }

    setQueue(newQueue);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false); // Reset correctness for next question
    setShowExplanation(false);
  };

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

  if (queue.length === 0) return null;

  // Helper to safely get options entries
  const getOptionsEntries = () => {
    const opts = currentEntry.question.options;
    if (opts && typeof opts === 'object' && !Array.isArray(opts)) {
      return Object.entries(opts);
    }
    return [];
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center py-4 px-2 sm:px-6 min-h-screen lg:min-h-0">
      
      {/* HUD Progress Header (Screenshot Aligned) */}
      <div className="w-full bg-[#0d121f]/90 backdrop-blur-xl border border-white/5 rounded-3xl p-5 mb-6 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Eraser className="w-6 h-6 text-red-500/70" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progress</div>
            <div className="text-xl font-black text-white">{wipedCount} / {totalInitial}</div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 mb-1.5">
            <Flame className={`w-4 h-4 ${streak > 0 ? 'text-orange-500 animate-pulse' : 'text-slate-700'}`} />
            <span className="text-xs font-black text-white uppercase tracking-widest">Streak: {streak}</span>
          </div>
          <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]"
              animate={{ width: `${(wipedCount / totalInitial) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card Arena */}
      <div className="relative w-full h-[660px] perspective-1000">
        <AnimatePresence mode="popLayout">
          {/* Background Card (The physical stack effect) */}
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
              h-full flex flex-col p-0 overflow-hidden bg-[#161e2c] border-2 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.6)] transition-all duration-500
              ${isAnswered ? (isCorrect ? 'border-emerald-500/40 shadow-emerald-500/10' : 'border-red-500/40 shadow-red-500/10') : 'border-white/10'}
            `}>
              
              {/* Mastery Header Area */}
              <div className="px-8 py-5 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-500/10">
                    <Target className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Mastery Level</span>
                </div>
                <MasteryDots level={currentEntry.masteryLevel} />
              </div>

              <div className="p-8 flex-1 flex flex-col overflow-y-auto scrollbar-hide">
                {/* Question Section */}
                <div className="mb-6 shrink-0">
                  <Badge variant="outline" className="mb-4 bg-white/5 text-[10px] border-white/10 text-slate-400 px-3 py-1 rounded-lg">
                    {currentEntry.question.type.replace('_', ' ')}
                  </Badge>
                  <h3 className="text-2xl md:text-3xl text-white font-extrabold leading-[1.3] tracking-tight">
                    {currentEntry.question.content}
                  </h3>
                </div>

                {/* Options List */}
                <div className="flex-1 space-y-3">
                  {getOptionsEntries().map(([key, value]) => {
                    const isSelected = selectedOption === key;
                    const showCorrect = isAnswered && key === currentEntry.question.answer;
                    const showWrong = isAnswered && isSelected && !isCorrect;

                    return (
                      <button
                        key={key}
                        disabled={isAnswered}
                        onClick={() => setSelectedOption(key)}
                        className={`
                          w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between group
                          ${isSelected ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 bg-slate-900/40 hover:bg-white/[0.05] hover:border-white/10'}
                          ${showCorrect ? 'border-emerald-500 bg-emerald-500/10 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]' : ''}
                          ${showWrong ? 'border-red-500 bg-red-500/10' : ''}
                        `}
                      >
                        <span className="flex items-center gap-4">
                          <span className={`
                            w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-black border transition-all
                            ${isSelected ? 'bg-blue-500 border-blue-400 text-white shadow-lg' : 'bg-slate-800/80 border-white/5 text-slate-500 group-hover:text-slate-400'}
                            ${showCorrect ? 'bg-emerald-500 border-emerald-400 text-white' : ''}
                            ${showWrong ? 'bg-red-500 border-red-400 text-white' : ''}
                          `}>
                            {key}
                          </span>
                          <span className={`text-[15px] font-bold transition-colors ${isSelected || showCorrect ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>
                            {value}
                          </span>
                        </span>
                        {showCorrect && <CircleCheck className="w-5 h-5 text-emerald-500 drop-shadow-lg" />}
                        {showWrong && <CircleX className="w-5 h-5 text-red-500 drop-shadow-lg" />}
                      </button>
                    );
                  })}
                </div>

                {/* Footer Section (Always visible) */}
                <div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-3 shrink-0">
                  {!isAnswered ? (
                    <Button 
                      variant="glow" 
                      size="xl"
                      className="w-full rounded-2xl h-16 font-black tracking-widest text-sm shadow-blue-500/30 active:scale-95"
                      disabled={!selectedOption}
                      onClick={handleSubmit}
                    >
                      CHECK ANSWER <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <div className="space-y-3">
                       <div className={`p-4 rounded-2xl flex items-center gap-3 border shadow-lg ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                          <div className={`p-1.5 rounded-lg ${isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                             {isCorrect ? <CircleCheck className="w-4 h-4" /> : <CircleX className="w-4 h-4" />}
                          </div>
                          <span className={`text-sm font-black tracking-wide ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isCorrect ? 'EXCELLENT! MASTERY +1' : 'RESETTING PROGRESS...'}
                          </span>
                          <button 
                            onClick={() => setShowExplanation(!showExplanation)}
                            className="ml-auto text-[10px] font-black text-blue-400 hover:text-blue-300 bg-blue-500/5 px-2 py-1 rounded border border-blue-500/10 uppercase tracking-widest transition-colors"
                          >
                            {showExplanation ? 'Hide' : 'Review'} Solution
                          </button>
                       </div>

                       <Button 
                        variant={isCorrect ? 'primary' : 'secondary'} 
                        size="xl"
                        className={`w-full rounded-2xl h-16 font-black tracking-widest text-sm transition-all ${isCorrect ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20' : 'bg-slate-800'}`}
                        onClick={handleContinue}
                      >
                        {isCorrect && currentEntry.masteryLevel + 1 >= 3 ? 'WIPE ERROR FOREVER' : 'CONTINUE'} 
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Solution Panel */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full mt-4 overflow-hidden"
          >
            <div className="p-6 bg-[#0a0f1a] border border-white/5 rounded-3xl text-slate-300 text-sm leading-relaxed shadow-inner">
               <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-blue-400" />
                  <h5 className="font-black text-blue-400 text-[10px] uppercase tracking-[0.2em]">Step-by-Step Breakdown</h5>
               </div>
               <div className="whitespace-pre-wrap font-medium">{currentEntry.question.explanation}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tutorial Tooltip */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-8 flex items-center gap-2 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]"
      >
        <Sparkles className="w-3 h-3 text-yellow-500/40" />
        <span>Answer 3x correctly to remove an error forever</span>
      </motion.div>

    </div>
  );
};