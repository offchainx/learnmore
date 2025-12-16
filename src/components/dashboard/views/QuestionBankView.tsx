/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trophy, ArrowLeft, Timer, CheckCircle2, ChevronDown, ChevronRight, Lock, Check, Play, Activity, AlertOctagon, TrendingUp } from 'lucide-react';
import { subjectsData, Section } from '../shared';

interface QuestionBankViewProps {
  t: Record<string, unknown>;
}

// Mock data for quiz interface
const quizQuestions = [
  { id: 1, text: "What is the derivative of x²?", options: ["x", "2x", "x²", "2"], correct: 1 },
  { id: 2, text: "Solve for x: 2x + 5 = 15", options: ["5", "2", "10", "7.5"], correct: 0 },
  { id: 3, text: "Which law states F=ma?", options: ["Newton's 1st", "Newton's 2nd", "Newton's 3rd", "Hooke's Law"], correct: 1 },
];

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({ t }) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('math');
  const [expandedChapter, setExpandedChapter] = useState<string | null>('math-c1');
  const [activeQuiz, setActiveQuiz] = useState<{ sectionId: string, title: string } | null>(null);
  
  // Quiz State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  // Load subject data
  const currentSubject = subjectsData[selectedSubjectId] || subjectsData['math'];

  // Reset expanded chapter when subject changes
  // 为了避免 useEffect 依赖报错，我们将重置逻辑移入 setState
  const handleSubjectChange = (id: string) => {
    setSelectedSubjectId(id);
    const newSubject = subjectsData[id] || subjectsData['math'];
    if (newSubject.chapters.length > 0) {
      setExpandedChapter(newSubject.chapters[0].id);
    }
    setActiveQuiz(null);
    setIsQuizFinished(false);
  };

  const handleStartQuiz = (section: Section) => {
    setActiveQuiz({ sectionId: section.id, title: section.title });
    setCurrentQIndex(0);
    setUserAnswers(new Array(quizQuestions.length).fill(-1));
    setIsQuizFinished(false);
  };

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQIndex] = optionIndex;
    setUserAnswers(newAnswers);
  };

  const calculateScore = () => {
    let score = 0;
    userAnswers.forEach((ans, idx) => {
      if (ans === quizQuestions[idx].correct) score++;
    });
    return Math.round((score / quizQuestions.length) * 100);
  };

  // --- Components ---

  const renderSubjectSelector = () => (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2">
      {Object.values(subjectsData).map((sub) => {
        const isActive = selectedSubjectId === sub.id;
        return (
          <button
            key={sub.id}
            onClick={() => handleSubjectChange(sub.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all border whitespace-nowrap ${
              isActive 
                ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-transparent shadow-md' 
                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <sub.icon className={`w-4 h-4 ${isActive ? 'text-white dark:text-black' : ''}`} />
            <span className="text-sm font-bold">{sub.title.split(' ')[0]}</span> {/* Simplified name */}
          </button>
        );
      })}
    </div>
  );

  const renderLeftColumn = () => {
    if (activeQuiz) {
      // --- QUIZ INTERFACE ---
      if (isQuizFinished) {
        const score = calculateScore();
        return (
          <div className="animate-fade-in-up h-full flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-sm min-h-[500px]">
             <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-yellow-400/20">
                <Trophy className="w-12 h-12 text-white" />
             </div>
             <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Quiz Complete!</h2>
             <p className="text-slate-500 mb-8">You scored <span className="font-bold text-slate-900 dark:text-white text-xl">{score}%</span></p>
             <div className="flex gap-4">
               <Button variant="outline" onClick={() => { setActiveQuiz(null); setIsQuizFinished(false); }}>Back to Topics</Button>
               <Button variant="glow" onClick={() => { setCurrentQIndex(0); setUserAnswers([]); setIsQuizFinished(false); }}>Try Again</Button>
             </div>
          </div>
        );
      }

      const question = quizQuestions[currentQIndex];
      const progress = ((currentQIndex + 1) / quizQuestions.length) * 100;

      return (
        <div className="animate-fade-in-up h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
             <button onClick={() => setActiveQuiz(null)} className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Exit Quiz
             </button>
             <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Timer className="w-4 h-4 text-blue-500" /> 14:20
             </div>
          </div>

          <Card className="flex-1 flex flex-col relative overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-0">
             {/* Progress Bar */}
             <div className="w-full bg-slate-100 dark:bg-slate-700/50 h-1.5">
                <div className="bg-blue-600 h-1.5 transition-all duration-300" style={{ width: `${progress}%` }}></div>
             </div>

             <div className="p-8 flex-1 flex flex-col">
                <div className="mb-6 flex justify-between items-start">
                   <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-relaxed max-w-2xl">
                     {currentQIndex + 1}. {question.text}
                   </h3>
                   <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold px-2 py-1 rounded border border-blue-100 dark:border-blue-800">Multiple Choice</span>
                </div>

                <div className="space-y-3 mb-8">
                   {question.options.map((opt, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${
                          userAnswers[currentQIndex] === idx 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                            : 'border-slate-200 dark:border-slate-700 bg-transparent hover:border-blue-300 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                         <span className="font-medium">{opt}</span>
                         {userAnswers[currentQIndex] === idx && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                      </button>
                   ))}
                </div>

                <div className="mt-auto flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-700/50">
                   <Button 
                      variant="ghost" 
                      disabled={currentQIndex === 0} 
                      onClick={() => setCurrentQIndex(prev => prev - 1)}
                   >
                      Previous
                   </Button>
                   {currentQIndex === quizQuestions.length - 1 ? (
                      <Button variant="glow" onClick={() => setIsQuizFinished(true)}>Submit Quiz</Button>
                   ) : (
                      <Button variant="default" onClick={() => setCurrentQIndex(prev => prev + 1)}>Next Question</Button>
                   )}
                </div>
             </div>
          </Card>
        </div>
      );
    }

    // --- DRILL DOWN LIST (Default State) ---
    return (
      <div className="space-y-4 animate-fade-in-up">
        <div className="flex justify-between items-center mb-2">
           <h3 className="text-lg font-bold text-slate-900 dark:text-white">{currentSubject.title} Topics</h3>
           <span className="text-xs text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{currentSubject.chapters.length} Chapters</span>
        </div>

        {currentSubject.chapters.map((chapter) => (
          <Card key={chapter.id} className="overflow-hidden border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800 transition-all hover:shadow-md">
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
              onClick={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${expandedChapter === chapter.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                   {expandedChapter === chapter.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </div>
                <div>
                   <h4 className="font-bold text-slate-900 dark:text-white text-sm md:text-base">{chapter.title}</h4>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="hidden md:flex flex-col items-end">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Progress</span>
                    <div className="w-20 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-1">
                       <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                 </div>
              </div>
            </div>
            
            {expandedChapter === chapter.id && (
              <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 animate-fade-in-up">
                {chapter.sections.map((section, idx) => (
                  <div 
                     key={section.id} 
                     onClick={() => !section.isLocked && handleStartQuiz(section)}
                     className={`p-4 pl-16 flex items-center justify-between transition-colors border-b last:border-0 border-slate-100 dark:border-slate-800/50 ${
                        section.isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-white dark:hover:bg-slate-800/80'
                     }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 ${
                         section.isCompleted 
                            ? 'bg-green-100 border-green-500 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                            : 'border-slate-300 dark:border-slate-600 text-slate-400'
                      }`}>
                         {section.isCompleted ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{section.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                           <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                              section.difficulty === 'easy' ? 'bg-green-100 text-green-600 dark:bg-green-900/20' :
                              section.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20' :
                              'bg-red-100 text-red-600 dark:bg-red-900/20'
                           }`}>{section.difficulty}</span>
                           <span className="text-[10px] text-slate-400">• {section.duration}</span>
                        </div>
                      </div>
                    </div>
                    
                    {section.isLocked ? (
                       <Lock className="w-4 h-4 text-slate-400" />
                    ) : (
                       <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0"><Play className="w-4 h-4 text-blue-500 fill-blue-500" /></Button>
                       </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    );
  };

  const renderRightAnalytics = () => (
    <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
       
       {/* 1. Dynamic Subject Score Card */}
       <Card className={`p-6 bg-gradient-to-br ${currentSubject.gradient} text-white border-none relative overflow-hidden shadow-lg`}>
          <div className="relative z-10">
             <div className="flex justify-between items-start mb-6">
                <div>
                   <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">Current Subject</p>
                   <h2 className="text-2xl font-bold">{currentSubject.title}</h2>
                </div>
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                   <currentSubject.icon className="w-6 h-6 text-white" />
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 rounded-xl p-3 backdrop-blur-sm">
                   <div className="text-2xl font-bold mb-0.5">85%</div>
                   <div className="text-[10px] text-white/70 uppercase font-bold">Accuracy</div>
                </div>
                <div className="bg-black/20 rounded-xl p-3 backdrop-blur-sm">
                   <div className="text-2xl font-bold mb-0.5">12</div>
                   <div className="text-[10px] text-white/70 uppercase font-bold">Streaks</div>
                </div>
             </div>
          </div>
          {/* Decorative Pattern */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>
       </Card>

       {/* 2. Proficiency Radar (Simulated) */}
       <Card className="p-5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/50">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
             <Activity className="w-5 h-5 text-blue-500" /> Proficiency Map
          </h3>
          <div className="relative h-48 w-full flex items-center justify-center">
             {/* Simulated Radar Chart */}
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 border border-slate-200 dark:border-slate-700 rounded-full opacity-50"></div>
                <div className="w-20 h-20 border border-slate-200 dark:border-slate-700 rounded-full opacity-50 absolute"></div>
                <div className="w-40 h-40 absolute border-t border-b border-transparent border-l border-r border-slate-200 dark:border-slate-700 opacity-30 rotate-45"></div>
                <div className="w-40 h-40 absolute border-t border-b border-transparent border-l border-r border-slate-200 dark:border-slate-700 opacity-30 -rotate-45"></div>
             </div>
             {/* The Shape */}
             <div className="relative z-10 w-24 h-24 bg-blue-500/20 dark:bg-blue-500/10 border-2 border-blue-500 rounded-lg transform rotate-12 flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-xs -rotate-12">Level 4</span>
             </div>
             {/* Labels */}
             <span className="absolute top-2 text-[10px] font-bold text-slate-400">Algebra</span>
             <span className="absolute bottom-2 text-[10px] font-bold text-slate-400">Geometry</span>
             <span className="absolute left-2 text-[10px] font-bold text-slate-400">Calc</span>
             <span className="absolute right-2 text-[10px] font-bold text-slate-400">Stats</span>
          </div>
       </Card>

       {/* 3. Weakness Analysis */}
       <Card className="p-5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/50">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-red-500" /> Weak Points
             </h3>
             <Button variant="ghost" size="sm" className="h-6 text-[10px]">View Mistake Book</Button>
          </div>
          <div className="space-y-3">
             {[
               { topic: "Integration by Parts", count: 4, diff: 'Hard' },
               { topic: "Vector Mechanics", count: 3, diff: 'Medium' }
             ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                   <div>
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.topic}</div>
                      <div className="text-[10px] text-red-500 font-medium">{item.count} recent errors</div>
                   </div>
                   <Button size="sm" className="h-7 px-3 bg-red-100 hover:bg-red-200 text-red-600 border-none dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400">Practice</Button>
                </div>
             ))}
          </div>
       </Card>

       {/* 4. Exam Forecast */}
       <div className="bg-slate-900 dark:bg-black rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex items-center justify-between">
             <div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Exam Forecast</div>
                <div className="text-3xl font-bold text-green-400">A*</div>
                <div className="text-[10px] text-slate-500 mt-1">Based on recent performance</div>
             </div>
             <div className="h-12 w-12 rounded-full border-4 border-green-500/30 border-t-green-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
             </div>
          </div>
       </div>

    </div>
  );

  return (
    <div className="pb-12 animate-fade-in-up">
       <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t.questionBank}</h2>
          <p className="text-slate-500">Master every topic with adaptive drills and instant feedback.</p>
       </div>

       {/* Subject Tabs - Sticky for easy access */}
       <div className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-sm py-2 -mx-4 px-4 mb-4">
          {renderSubjectSelector()}
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: 2/3 width */}
          <div className="lg:col-span-2">
             {renderLeftColumn()}
          </div>

          {/* Right Column: 1/3 width - Sticky Stats */}
          <div className="lg:col-span-1 sticky top-24">
             {renderRightAnalytics()}
          </div>
       </div>
    </div>
  );
};