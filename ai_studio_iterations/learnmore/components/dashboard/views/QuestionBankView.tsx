
import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { 
  Trophy, ArrowLeft, Timer, CheckCircle2, ChevronDown, ChevronRight, 
  Lock, Check, Play, Activity, AlertOctagon, TrendingUp, 
  Eraser, Shield, BookOpen, Flame, Star, Hexagon, Zap, MousePointer2,
  FileText, BarChart2, ArrowUpRight
} from 'lucide-react';
import { subjectsData, Section } from '../shared';

// Mock data for quiz interface
const quizQuestions = [
  { id: 1, text: "What is the derivative of x²?", options: ["x", "2x", "x²", "2"], correct: 1 },
  { id: 2, text: "Solve for x: 2x + 5 = 15", options: ["5", "2", "10", "7.5"], correct: 0 },
  { id: 3, text: "Which law states F=ma?", options: ["Newton's 1st", "Newton's 2nd", "Newton's 3rd", "Hooke's Law"], correct: 1 },
];

// Expanded Mock data for Hexagon Hive (19 items for a full grid)
const hiveData = [
  // Row 1 (5)
  { id: 1, status: 'strong', color: 'text-emerald-500 fill-emerald-500/20' },
  { id: 2, status: 'strong', color: 'text-emerald-500 fill-emerald-500/20' },
  { id: 3, status: 'strong', color: 'text-emerald-500 fill-emerald-500/20' },
  { id: 4, status: 'neutral', color: 'text-yellow-500 fill-yellow-500/20' },
  { id: 5, status: 'strong', color: 'text-emerald-500 fill-emerald-500/20' },
  // Row 2 (4)
  { id: 6, status: 'strong', color: 'text-emerald-500 fill-emerald-500/20' },
  { id: 7, status: 'weak', color: 'text-red-500 fill-red-500/20 animate-pulse' }, // Pulsing weak point
  { id: 8, status: 'neutral', color: 'text-yellow-500 fill-yellow-500/20' },
  { id: 9, status: 'strong', color: 'text-emerald-500 fill-emerald-500/20' },
  // Row 3 (5)
  { id: 10, status: 'neutral', color: 'text-yellow-500 fill-yellow-500/20' },
  { id: 11, status: 'weak', color: 'text-red-500 fill-red-500/20 animate-pulse' },
  { id: 12, status: 'strong', color: 'text-emerald-500 fill-emerald-500/20' },
  { id: 13, status: 'strong', color: 'text-emerald-500 fill-emerald-500/20' },
  { id: 14, status: 'neutral', color: 'text-yellow-500 fill-yellow-500/20' },
  // Row 4 (4)
  { id: 15, status: 'locked', color: 'text-slate-200 dark:text-slate-700 fill-slate-100 dark:fill-slate-800' },
  { id: 16, status: 'locked', color: 'text-slate-200 dark:text-slate-700 fill-slate-100 dark:fill-slate-800' },
  { id: 17, status: 'locked', color: 'text-slate-200 dark:text-slate-700 fill-slate-100 dark:fill-slate-800' },
  { id: 18, status: 'locked', color: 'text-slate-200 dark:text-slate-700 fill-slate-100 dark:fill-slate-800' },
];

export const QuestionBankView = ({ t }: { t: any }) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('math');
  const [activeQuiz, setActiveQuiz] = useState<{ sectionId: string, title: string } | null>(null);
  
  // Quiz State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  // Load subject data
  const currentSubject = subjectsData[selectedSubjectId] || subjectsData['math'];

  useEffect(() => {
    setActiveQuiz(null); // Exit quiz mode on subject change
    setIsQuizFinished(false);
  }, [selectedSubjectId]);

  const handleStartQuiz = (title: string, id: string = 'general') => {
    setActiveQuiz({ sectionId: id, title: title });
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

  // --- Render Helpers ---

  const renderSubjectSelector = () => (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2">
      {Object.values(subjectsData).map((sub) => {
        const isActive = selectedSubjectId === sub.id;
        return (
          <button
            key={sub.id}
            onClick={() => setSelectedSubjectId(sub.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all border whitespace-nowrap ${
              isActive 
                ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-transparent shadow-md transform scale-105' 
                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <sub.icon className={`w-4 h-4 ${isActive ? 'text-white dark:text-black' : ''}`} />
            <span className="text-sm font-bold">{sub.title.split(' ')[0]}</span>
          </button>
        );
      })}
    </div>
  );

  // --- QUIZ INTERFACE ---
  if (activeQuiz) {
    if (isQuizFinished) {
      const score = calculateScore();
      return (
        <div className="animate-fade-in-up h-full flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-sm min-h-[500px]">
           <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-yellow-400/20 animate-bounce">
              <Trophy className="w-12 h-12 text-white" />
           </div>
           <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Quiz Complete!</h2>
           <p className="text-slate-500 mb-8">You scored <span className="font-bold text-slate-900 dark:text-white text-xl">{score}%</span> on {activeQuiz.title}</p>
           <div className="flex gap-4">
             <Button variant="outline" onClick={() => { setActiveQuiz(null); setIsQuizFinished(false); }}>Back to Practice</Button>
             <Button variant="glow" onClick={() => { setCurrentQIndex(0); setUserAnswers([]); setIsQuizFinished(false); }}>Try Again</Button>
           </div>
        </div>
      );
    }

    const question = quizQuestions[currentQIndex];
    const progress = ((currentQIndex + 1) / quizQuestions.length) * 100;

    return (
      <div className="animate-fade-in-up h-full flex flex-col max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
           <button onClick={() => setActiveQuiz(null)} className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" /> Exit Quiz
           </button>
           <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              <Timer className="w-4 h-4 text-blue-500" /> 14:20
           </div>
        </div>

        <Card className="flex-1 flex flex-col relative overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-0 shadow-xl">
           <div className="w-full bg-slate-100 dark:bg-slate-700/50 h-1.5">
              <div className="bg-blue-600 h-1.5 transition-all duration-300" style={{ width: `${progress}%` }}></div>
           </div>

           <div className="p-8 md:p-12 flex-1 flex flex-col">
              <div className="mb-8">
                 <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Question {currentQIndex + 1} of {quizQuestions.length}</span>
                    <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold px-2 py-1 rounded border border-blue-100 dark:border-blue-800">Multiple Choice</span>
                 </div>
                 <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
                   {question.text}
                 </h3>
              </div>

              <div className="space-y-4 mb-8 max-w-2xl">
                 {question.options.map((opt, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${
                        userAnswers[currentQIndex] === idx 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-md' 
                          : 'border-slate-200 dark:border-slate-700 bg-transparent hover:border-blue-300 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                       <span className="font-medium flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${userAnswers[currentQIndex] === idx ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 text-slate-400'}`}>
                             {String.fromCharCode(65 + idx)}
                          </span>
                          {opt}
                       </span>
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
                    <Button variant="glow" onClick={() => setIsQuizFinished(true)} className="px-8">Submit Quiz</Button>
                 ) : (
                    <Button variant="primary" onClick={() => setCurrentQIndex(prev => prev + 1)} className="px-8">Next Question</Button>
                 )}
              </div>
           </div>
        </Card>
      </div>
    );
  }

  // --- PRACTICE CENTER DASHBOARD ---

  const renderTrainingModes = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
       {/* 1. Smart Drill */}
       <div 
          onClick={() => handleStartQuiz('Adaptive Smart Drill')}
          className="group relative p-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl text-white overflow-hidden cursor-pointer shadow-lg hover:shadow-blue-500/25 transition-all hover:-translate-y-1"
       >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-white/20 transition-colors"></div>
          <div className="relative z-10">
             <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4 border border-white/20">
                <BookOpen className="w-6 h-6 text-white" />
             </div>
             <h3 className="text-lg font-bold mb-1">Smart Drill</h3>
             <p className="text-blue-100 text-xs mb-4">Chapter-based adaptive practice.</p>
             <div className="flex items-center gap-2 text-xs font-bold bg-black/20 w-fit px-2 py-1 rounded-lg">
                <Zap className="w-3 h-3 text-yellow-300 fill-yellow-300" /> Recommended
             </div>
          </div>
       </div>

       {/* 2. Error Wiper */}
       <div 
          onClick={() => handleStartQuiz('Error Wiper')}
          className="group relative p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden cursor-pointer hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 transition-all hover:-translate-y-1"
       >
          <div className="relative z-10">
             <div className="flex justify-between items-start mb-4">
               <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center border border-red-200 dark:border-red-900/50">
                  <Eraser className="w-6 h-6 text-red-600 dark:text-red-400" />
               </div>
               <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-1 rounded-full">24 Pending</span>
             </div>
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Error Wiper</h3>
             <p className="text-slate-500 text-xs">Clear your mistakes to boost score.</p>
          </div>
       </div>

       {/* 3. Mock Arena */}
       <div 
          onClick={() => handleStartQuiz('Mock Exam Simulation')}
          className="group relative p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden cursor-pointer hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all hover:-translate-y-1"
       >
          <div className="relative z-10">
             <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4 border border-purple-200 dark:border-purple-900/50">
                <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
             </div>
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Mock Arena</h3>
             <p className="text-slate-500 text-xs">Full-length past year papers.</p>
          </div>
       </div>
    </div>
  );

  const renderChapterMap = () => (
    <div className="space-y-4">
       <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Chapter Map</h3>
          <span className="text-xs text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{currentSubject.chapters.length} Modules</span>
       </div>

       {currentSubject.chapters.map((chapter, i) => {
          // Mocking Data for Demo
          const stars = i === 0 ? 3 : i === 1 ? 1 : 0;
          const isHotspot = i === 1;
          const isWeakness = i === 2;

          return (
             <Card key={chapter.id} className="p-4 flex items-center justify-between hover:border-blue-500/30 transition-all group">
                <div className="flex items-center gap-4">
                   <div className="flex flex-col items-center gap-1 w-10">
                      <div className="text-xs font-bold text-slate-400">CH</div>
                      <div className="text-xl font-bold text-slate-900 dark:text-white">0{i+1}</div>
                   </div>
                   
                   <div>
                      <div className="flex items-center gap-2 mb-1">
                         <h4 className="font-bold text-slate-900 dark:text-white text-base">{chapter.title}</h4>
                         {isHotspot && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-[10px] font-bold text-orange-500 uppercase">
                               <Flame className="w-3 h-3 fill-orange-500" /> Hot
                            </span>
                         )}
                         {isWeakness && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-500 uppercase">
                               <AlertOctagon className="w-3 h-3" /> Weak
                            </span>
                         )}
                      </div>
                      
                      {/* Mastery Stars */}
                      <div className="flex gap-1">
                         {[1, 2, 3].map(star => (
                            <Star 
                               key={star} 
                               className={`w-4 h-4 ${star <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-700'}`} 
                            />
                         ))}
                         <span className="text-xs text-slate-400 ml-2">{stars}/3 Mastery</span>
                      </div>
                   </div>
                </div>

                <Button 
                   onClick={() => handleStartQuiz(`Practice: ${chapter.title}`)}
                   size="sm" 
                   variant={stars === 3 ? 'outline' : 'primary'}
                   className={stars === 3 ? 'text-green-500 border-green-500/30 hover:bg-green-500/10' : ''}
                >
                   {stars === 3 ? 'Review' : 'Start'}
                </Button>
             </Card>
          );
       })}
    </div>
  );

  const renderMockExams = () => (
     <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Past Year Papers</h3>
        <div className="grid gap-3">
           {['2023 Paper 1 (Feb/Mar)', '2023 Paper 2 (May/Jun)', '2022 Paper 1 (Oct/Nov)'].map((paper, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                       <FileText className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                       <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">{paper}</div>
                       <div className="text-xs text-slate-500">2 hours • 80 Marks</div>
                    </div>
                 </div>
                 <Button size="sm" variant="ghost" className="text-slate-400 group-hover:text-blue-500">
                    Start <ChevronRight className="w-4 h-4 ml-1" />
                 </Button>
              </div>
           ))}
        </div>
     </div>
  );

  // --- SIDEBAR WIDGETS ---

  const renderKnowledgeHive = () => (
     <Card className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/50 mb-6 relative overflow-hidden">
        <div className="flex justify-between items-start mb-6 relative z-10">
           <div>
             <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Hexagon className="w-5 h-5 text-purple-500" /> Knowledge Hive
             </h3>
             <p className="text-xs text-slate-500 mt-1">Proficiency Heatmap</p>
           </div>
           <div className="text-right">
              <div className="text-2xl font-bold text-emerald-500">B+</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Current Grade</div>
           </div>
        </div>
        
        {/* Hexagon Grid Visual - Expanded to 4 rows for fullness */}
        <div className="relative h-64 w-full flex items-center justify-center z-10">
           <div className="grid grid-cols-5 gap-1.5 transform scale-100">
              {/* Row 1 (5 items) */}
              <div className="col-span-5 flex justify-center gap-1.5 mb-[-10px]">
                 {hiveData.slice(0, 5).map(h => (
                    <Hexagon key={h.id} className={`w-10 h-10 ${h.color} transition-all hover:scale-110 cursor-pointer`} strokeWidth={1.5} />
                 ))}
              </div>
              {/* Row 2 (4 items) */}
              <div className="col-span-5 flex justify-center gap-1.5 mb-[-10px]">
                 {hiveData.slice(5, 9).map(h => (
                    <Hexagon key={h.id} className={`w-10 h-10 ${h.color} transition-all hover:scale-110 cursor-pointer`} strokeWidth={1.5} />
                 ))}
              </div>
              {/* Row 3 (5 items) */}
              <div className="col-span-5 flex justify-center gap-1.5 mb-[-10px]">
                 {hiveData.slice(9, 14).map(h => (
                    <Hexagon key={h.id} className={`w-10 h-10 ${h.color} transition-all hover:scale-110 cursor-pointer`} strokeWidth={1.5} />
                 ))}
              </div>
              {/* Row 4 (4 items) */}
              <div className="col-span-5 flex justify-center gap-1.5">
                 {hiveData.slice(14, 18).map(h => (
                    <Hexagon key={h.id} className={`w-10 h-10 ${h.color} transition-all hover:scale-110 cursor-pointer`} strokeWidth={1.5} />
                 ))}
              </div>
           </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-3 mt-4">
           <div className="flex items-center gap-1 text-[10px] text-slate-400"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Strong</div>
           <div className="flex items-center gap-1 text-[10px] text-slate-400"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Fair</div>
           <div className="flex items-center gap-1 text-[10px] text-slate-400"><div className="w-2 h-2 rounded-full bg-red-500"></div> Weak</div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
     </Card>
  );

  const renderExamForecast = () => (
     <Card className="p-0 bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 text-white mb-6 overflow-hidden relative">
        <div className="p-5 relative z-10">
           <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              <TrendingUp className="w-4 h-4 text-blue-500" /> Exam Forecast
           </div>
           <div className="flex items-end gap-3 mb-4">
              <div className="text-4xl font-bold text-white">A-</div>
              <div className="text-green-400 text-sm font-bold mb-1 flex items-center">
                 +1 Grade <TrendingUp className="w-3 h-3 ml-1" />
              </div>
           </div>
           
           {/* Simple Sparkline */}
           <div className="h-10 flex items-end gap-1 opacity-80">
              {[30, 40, 35, 50, 45, 60, 65, 55, 70, 75].map((h, i) => (
                 <div key={i} className="flex-1 bg-blue-500/30 rounded-t-sm hover:bg-blue-500 transition-colors" style={{ height: `${h}%` }}></div>
              ))}
           </div>
        </div>
        <div className="bg-slate-800/50 p-3 text-center border-t border-slate-800 relative z-10">
           <span className="text-xs text-slate-400">Predicted for <strong>Finals (Nov)</strong></span>
        </div>
        {/* Glow */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-blue-900/20 to-transparent pointer-events-none"></div>
     </Card>
  );

  const renderWeaknessFix = () => (
     <Card className="p-5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/50">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
           <AlertOctagon className="w-4 h-4 text-red-500" /> Weakness Quick Fix
        </h3>
        <div className="space-y-3">
           {[
             { topic: "Matrices (Inverse)", score: 45 },
             { topic: "Vector Geometry", score: 52 },
             { topic: "Functions (Composite)", score: 58 }
           ].map((w, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group cursor-pointer">
                 <div>
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-red-500 transition-colors">{w.topic}</div>
                    <div className="text-[10px] text-red-500 font-medium">{w.score}% Proficiency</div>
                 </div>
                 <Button 
                    size="sm" 
                    className="h-7 px-3 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-transparent hover:bg-red-600 hover:text-white dark:hover:bg-red-500 dark:hover:text-white transition-all shadow-none group-hover:shadow-lg"
                 >
                    Fix <Play className="w-2.5 h-2.5 ml-1 fill-current" />
                 </Button>
              </div>
           ))}
        </div>
     </Card>
  );

  return (
    <div className="pb-12 animate-fade-in-up">
       {/* Page Header */}
       <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t.questionBank}</h2>
          <p className="text-slate-500">Adaptive training center. Choose a mode to begin.</p>
       </div>

       {/* Subject Tabs - Sticky */}
       <div className="sticky top-0 z-20 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-sm py-3 -mx-4 px-4 mb-6 border-b border-slate-200 dark:border-slate-800/50">
          {renderSubjectSelector()}
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Column (~70%) */}
          <div className="lg:col-span-2">
             {renderTrainingModes()}
             {renderChapterMap()}
             {renderMockExams()}
          </div>

          {/* Sidebar (~30%) */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
             {renderKnowledgeHive()}
             {renderExamForecast()}
             {renderWeaknessFix()}
          </div>
       </div>
    </div>
  );
};
