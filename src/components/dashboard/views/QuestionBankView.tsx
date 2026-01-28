import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Trophy, ArrowLeft, Timer, CircleCheck, ChevronRight, 
  Play, AlertOctagon, TrendingUp, 
  Eraser, BookOpen, Flame, Star, Zap,
  FileText, Calculator, Atom, FlaskConical, Languages, Dna, Landmark, Globe, Laptop
} from 'lucide-react';
import { subjectsData } from '../shared';
import { getAllSubjects } from '@/actions/subject';
import { getSubjectChapters } from '@/actions/practice/data-service';
import type { ChapterWithStats } from '@/lib/practice/types';
import KnowledgeHive from '@/components/practice/analytics/KnowledgeHive';

// Mock data for quiz interface (to be replaced by full Quiz engine integration later)
const quizQuestions = [
  { id: 1, text: "What is the derivative of x²?", options: ["x", "2x", "x²", "2"], correct: 1 },
  { id: 2, text: "Solve for x: 2x + 5 = 15", options: ["5", "2", "10", "7.5"], correct: 0 },
  { id: 3, text: "Which law states F=ma?", options: ["Newton's 1st", "Newton's 2nd", "Newton's 3rd", "Hooke's Law"], correct: 1 },
];

interface DbSubject {
  id: string;
  name: string;
  icon?: string | null;
}

const iconMap: Record<string, React.ElementType> = {
  'Calculator': Calculator,
  'Atom': Atom,
  'FlaskConical': FlaskConical,
  'Dna': Dna,
  'BookOpen': Languages,
  'Landmark': Landmark,
  'Globe': Globe,
  'Laptop': Laptop
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const QuestionBankView = ({ t, userId }: { t: any, userId: string }) => {
  const router = useRouter();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [activeQuiz, setActiveQuiz] = useState<{ sectionId: string, title: string } | null>(null);
  const [dbSubjects, setDbSubjects] = useState<DbSubject[]>([]);
  const [dbChapters, setDbChapters] = useState<ChapterWithStats[]>([]);
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);
  
  // Quiz State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  // Load subject data
  useEffect(() => {
    async function fetchDbSubjects() {
      const result = await getAllSubjects();
      if (result.success && result.data) {
        setDbSubjects(result.data);
        // Find mathematics or select the first one
        const mathSubject = result.data.find(s => 
          s.name.toLowerCase().includes('math') || 
          s.name.toLowerCase().includes('数学')
        );
        if (mathSubject) {
          setSelectedSubjectId(mathSubject.id);
        } else if (result.data.length > 0) {
          setSelectedSubjectId(result.data[0].id);
        }
      }
    }
    fetchDbSubjects();
  }, []);

  // Fetch chapters when subject changes
  useEffect(() => {
    async function fetchChapters() {
      if (!selectedSubjectId) return;
      
      setIsLoadingChapters(true);
      try {
        const data = await getSubjectChapters(selectedSubjectId, userId);
        if (data && data.chapters) {
          setDbChapters(data.chapters);
        } else {
          setDbChapters([]);
        }
      } catch (error) {
        console.error('Failed to fetch chapters:', error);
        setDbChapters([]);
      } finally {
        setIsLoadingChapters(false);
      }
    }

    fetchChapters();
    setActiveQuiz(null); 
    setIsQuizFinished(false);
  }, [selectedSubjectId, userId]);

  // Derived current subject info
  const currentDbSubject = dbSubjects.find(s => s.id === selectedSubjectId);
  const currentSubjectTitle = currentDbSubject ? currentDbSubject.name : 'Loading...';

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
      {dbSubjects.map((sub) => {
        const Icon = iconMap[sub.icon as string] || BookOpen;
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
            <Icon className={`w-4 h-4 ${isActive ? 'text-white dark:text-black' : ''}`} />
            <span className="text-sm font-bold">{sub.name.split(' ')[0]}</span>
          </button>
        );
      })}
    </div>
  );

  const renderTrainingModes = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
       {/* Smart Drill */}
       <div 
          onClick={() => router.push(`/dashboard/practice/smart-drill?subjectId=${selectedSubjectId}`)}
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

       {/* Error Wiper */}
       <div 
          onClick={() => router.push(`/dashboard/practice/error-wiper?subjectId=${selectedSubjectId}`)}
          className="group relative p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden cursor-pointer hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 transition-all hover:-translate-y-1"
       >
          <div className="relative z-10">
             <div className="flex justify-between items-start mb-4">
               <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center border border-red-200 dark:border-red-900/50">
                  <Eraser className="w-6 h-6 text-red-600 dark:text-red-400" />
               </div>
               <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-1 rounded-full">Error Wipe</span>
             </div>
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Error Wiper</h3>
             <p className="text-slate-500 text-xs">Clear your mistakes to boost score.</p>
          </div>
       </div>

       {/* Mock Arena */}
       <div 
          onClick={() => router.push(`/dashboard/practice/mock-arena?subjectId=${selectedSubjectId}`)}
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

  // --- Chapter Map Carousel Logic ---
  const [chapterPage, setChapterPage] = useState(0);
  const CHAPTERS_PER_PAGE = 3;

  const handleChapterWheel = (e: React.WheelEvent) => {
    // Only intercept if we have enough chapters to scroll
    if (dbChapters.length <= CHAPTERS_PER_PAGE) return;

    // Prevent default page scroll only if we are actually scrolling the carousel
    // Note: We can't strictly preventDefault in passive listeners, but React handles this mostly.
    // Ideally we just consume the event.
    
    const direction = e.deltaY > 0 ? 1 : -1;
    const maxPage = Math.ceil(dbChapters.length / CHAPTERS_PER_PAGE) - 1;
    
    setChapterPage(prev => {
      const next = prev + direction;
      // Clamp between 0 and maxPage
      return Math.max(0, Math.min(next, maxPage));
    });
  };

  const renderChapterMap = () => {
    const totalPages = Math.ceil(dbChapters.length / CHAPTERS_PER_PAGE);
    const visibleChapters = dbChapters.slice(
      chapterPage * CHAPTERS_PER_PAGE, 
      (chapterPage + 1) * CHAPTERS_PER_PAGE
    );

    return (
    <div className="space-y-4">
       <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Chapter Map</h3>
          <div className="flex items-center gap-2">
             <div className="flex gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                   <div 
                      key={i} 
                      className={`w-1.5 h-1.5 rounded-full transition-all ${i === chapterPage ? 'bg-slate-900 dark:bg-white w-3' : 'bg-slate-300 dark:bg-slate-700'}`}
                   />
                ))}
             </div>
             <span className="text-xs text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                {dbChapters.length} Modules
             </span>
          </div>
       </div>

       {isLoadingChapters ? (
         <div className="space-y-3">
           {[1, 2, 3].map(i => (
             <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800/40 animate-pulse rounded-2xl" />
           ))}
         </div>
       ) : dbChapters.length === 0 ? (
         <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
           <p className="text-slate-500">No chapters found for this subject.</p>
         </div>
       ) : (
         <div 
            className="space-y-3 min-h-[320px]" 
            onWheel={handleChapterWheel}
         >
            {visibleChapters.map((chapter, index) => {
                // Calculate absolute index for correct numbering
                const absoluteIndex = (chapterPage * CHAPTERS_PER_PAGE) + index;
                const mastery = chapter.stats.masteryLevel;
                const stars = mastery >= 80 ? 3 : mastery >= 50 ? 2 : mastery > 0 ? 1 : 0;
                const isHotspot = chapter.stats.totalAttempts > 10 && (chapter.stats.correctCount / chapter.stats.totalAttempts) < 0.7;
                const isWeakness = chapter.stats.totalAttempts > 5 && (chapter.stats.correctCount / chapter.stats.totalAttempts) < 0.6;

                return (
                   <div 
                      key={chapter.id} 
                      className="animate-in fade-in slide-in-from-right-4 duration-300 fill-mode-both"
                      style={{ animationDelay: `${index * 50}ms` }}
                   >
                     <Card className="p-4 flex items-center justify-between hover:border-blue-500/30 transition-all group rounded-2xl hover:shadow-md dark:hover:shadow-blue-900/10 cursor-default">
                        <div className="flex items-center gap-4">
                           <div className="flex flex-col items-center gap-1 w-10">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">CH</div>
                              <div className="text-xl font-black text-slate-900 dark:text-white">{String(absoluteIndex + 1).padStart(2, '0')}</div>
                           </div>
                           
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                 <h4 className="font-bold text-slate-900 dark:text-white text-base line-clamp-1">{chapter.title}</h4>
                                 {isHotspot && (
                                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-[10px] font-bold text-orange-500 uppercase whitespace-nowrap">
                                       <Flame className="w-3 h-3 fill-orange-500" /> Hot
                                    </span>
                                 )}
                                 {isWeakness && (
                                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-500 uppercase whitespace-nowrap">
                                       <AlertOctagon className="w-3 h-3" /> Weak
                                    </span>
                                 )}
                              </div>
                              
                              <div className="flex gap-1">
                                 {[1, 2, 3].map(star => (
                                    <Star 
                                       key={star} 
                                       className={`w-4 h-4 ${star <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 dark:text-slate-700'}`} 
                                    />
                                 ))}
                                 <span className="text-[10px] font-bold text-slate-400 ml-2 uppercase tracking-tight">{stars}/3 Mastery</span>
                              </div>
                           </div>
                        </div>

                                          <Button 

                                             onClick={() => router.push(`/dashboard/practice/chapter-drill/${chapter.id}`)}

                                             size="sm" 

                                             variant={stars === 3 ? 'outline' : 'primary'}

                                             className={stars === 3 ? 'rounded-xl text-green-500 border-green-500/30 hover:bg-green-500/10' : 'rounded-xl'}

                                          >

                                             {stars === 3 ? 'Review' : 'Start'}

                                          </Button>

                        
                     </Card>
                   </div>
                );
            })}
            
            {/* Empty state filler to maintain height if last page has < 3 items */}
            {visibleChapters.length < CHAPTERS_PER_PAGE && Array.from({ length: CHAPTERS_PER_PAGE - visibleChapters.length }).map((_, i) => (
                <div key={`empty-${i}`} className="h-[72px] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/50 flex items-center justify-center">
                    <span className="text-xs text-slate-300 dark:text-slate-700 font-medium">End of list</span>
                </div>
            ))}
         </div>
       )}
    </div>
  );
  }; // End renderChapterMap

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

  const renderExamForecast = () => (
     <Card className="p-0 bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 text-white mb-6 overflow-hidden relative rounded-3xl">
        <div className="p-6 relative z-10">
           <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">
              <TrendingUp className="w-4 h-4 text-blue-500" /> Exam Forecast
           </div>
           <div className="flex items-end gap-3 mb-4">
              <div className="text-5xl font-black text-white">A-</div>
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
        <div className="bg-white/5 p-3 text-center border-t border-white/5 relative z-10">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Predicted for <strong>Finals (Nov)</strong></span>
        </div>
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-blue-900/20 to-transparent pointer-events-none"></div>
     </Card>
  );

  const renderWeaknessFix = () => (
     <Card className="p-5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/50 rounded-3xl">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
           <AlertOctagon className="w-4 h-4 text-red-500" /> Weakness Quick Fix
        </h3>
        <div className="space-y-3">
           {[
             { topic: "Matrices (Inverse)", score: 45 },
             { topic: "Vector Geometry", score: 52 },
             { topic: "Functions (Composite)", score: 58 }
           ].map((w, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group cursor-pointer">
                 <div>
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-red-500 transition-colors">{w.topic}</div>
                    <div className="text-[10px] text-red-500 font-bold uppercase">{w.score}% Proficiency</div>
                 </div>
                 <Button 
                    size="sm" 
                    className="h-7 px-3 text-[10px] font-black uppercase bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-transparent hover:bg-red-600 hover:text-white rounded-lg transition-all"
                 >
                    Fix <Play className="w-2.5 h-2.5 ml-1 fill-current" />
                 </Button>
              </div>
           ))}
        </div>
     </Card>
  );

  // --- Main Render ---

  if (activeQuiz) {
    // Quiz logic... (existing handleStartQuiz logic)
    // For now we keep the existing Quiz UI structure if needed, 
    // but the main goal was the dashboard optimization.
  }

  return (
    <div className="pb-12 animate-fade-in-up">
       <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{t.questionBank}</h2>
          <p className="text-slate-500 text-sm">Adaptive training center. Choose a mode to begin.</p>
       </div>

       <div className="sticky top-0 z-20 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-sm py-3 -mx-4 px-4 mb-6 border-b border-slate-200 dark:border-slate-800/50">
          {renderSubjectSelector()}
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
             {renderTrainingModes()}
             {renderChapterMap()}
             {renderMockExams()}
          </div>

          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
             {selectedSubjectId && (
                <KnowledgeHive 
                   userId={userId} 
                   subjectId={selectedSubjectId} 
                   subjectName={currentSubjectTitle} 
                />
             )}
             {renderExamForecast()}
             {renderWeaknessFix()}
          </div>
       </div>
    </div>
  );
};