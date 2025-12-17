import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ChevronRight, ChevronDown, CheckCircle2, Lock, Clock, AlertTriangle, 
  BarChart, Flame, Target, Notebook, Bookmark, Highlighter, ArrowRight,
  List, Brain, GraduationCap, Search, PlayCircle, FileText, HelpCircle,
  Coffee, Calendar, X, Zap, ArrowUpRight
} from 'lucide-react';
import { subjectsData, mockUserContent, Section, SubTabType } from '../shared';
import { LessonPlayer } from './LessonPlayer';

export const MyCoursesView = ({ t }: { t: any }) => {
  const [activeLesson, setActiveLesson] = useState<Section & { chapterTitle: string } | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('math');
  const [activeViewMode, setActiveViewMode] = useState<'curriculum' | 'review' | 'notebook'>('curriculum');
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [hasLiveClass, setHasLiveClass] = useState(true); 
  const [isReviewSessionOpen, setIsReviewSessionOpen] = useState(false); // New: Review Overlay State
  
  // Notebook State
  const [notebookFilter, setNotebookFilter] = useState<SubTabType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load subject data
  const currentSubject = subjectsData[selectedSubjectId] || subjectsData['math'];

  // Initialize expanded chapter
  useEffect(() => {
    if (currentSubject.chapters.length > 0) {
      setExpandedChapter(currentSubject.chapters[0].id);
    }
  }, [selectedSubjectId]);

  if (activeLesson) {
    return (
      <LessonPlayer 
        lesson={activeLesson} 
        onBack={() => setActiveLesson(null)} 
        onComplete={() => setActiveLesson(null)} 
        t={t} 
      />
    );
  }

  // --- Render Helpers ---

  const renderSubjectSelector = () => (
    <div className="relative group">
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide mb-6 pr-12">
        {Object.values(subjectsData).map((sub) => {
          const isActive = selectedSubjectId === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => setSelectedSubjectId(sub.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all border whitespace-nowrap shrink-0 ${
                isActive 
                  ? `${sub.color} text-white border-transparent shadow-lg shadow-blue-900/10 scale-105` 
                  : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <sub.icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
              <span className="text-sm font-bold">{sub.title}</span>
            </button>
          );
        })}
      </div>
      {/* Visual Cue: Fade out effect on the right */}
      <div className="absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent pointer-events-none" />
    </div>
  );

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <PlayCircle className="w-4 h-4 text-blue-400" />;
      case 'reading': return <FileText className="w-4 h-4 text-emerald-400" />;
      case 'quiz': return <HelpCircle className="w-4 h-4 text-orange-400" />;
      default: return <PlayCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const renderCurriculum = () => {
    // Determine the next lesson to continue
    let nextLessonId: string | null = null;
    for (const chapter of currentSubject.chapters) {
      const next = chapter.sections.find(s => !s.isCompleted && !s.isLocked);
      if (next) {
        nextLessonId = next.id;
        break;
      }
    }

    return (
      <div className="space-y-4 animate-fade-in-up">
        {currentSubject.chapters.map((chapter) => (
          <Card key={chapter.id} className="overflow-hidden border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800">
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
              onClick={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${expandedChapter === chapter.id ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {expandedChapter === chapter.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white">{chapter.title}</h4>
              </div>
              <span className="text-xs text-slate-400 font-medium">{chapter.sections.filter(s => s.isCompleted).length}/{chapter.sections.length} Done</span>
            </div>
            
            {expandedChapter === chapter.id && (
              <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                {chapter.sections.map((section) => {
                  const isNext = section.id === nextLessonId;
                  return (
                    <div 
                      key={section.id} 
                      className={`p-3 pl-4 sm:pl-14 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group ${
                        isNext ? 'bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-l-blue-500 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]' : 'border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {section.isCompleted ? (
                          <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                          </div>
                        ) : section.isLocked ? (
                          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                        ) : (
                          <div className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center ${isNext ? 'border-blue-500 bg-white dark:bg-slate-900 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'border-slate-300 dark:border-slate-600'}`}>
                             {isNext && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                             {getContentTypeIcon(section.contentType)}
                             <p className={`text-sm font-medium ${section.isLocked ? 'text-slate-400' : 'text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400'} ${isNext ? 'font-bold text-blue-600 dark:text-blue-400' : ''}`}>
                               {section.title}
                             </p>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 ml-6">
                            <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><Clock className="w-3 h-3" /> {section.duration}</span>
                            {section.xp > 0 && <span className="text-[10px] text-yellow-500 font-bold">+{section.xp} XP</span>}
                          </div>
                        </div>
                      </div>
                      
                      {!section.isLocked && (
                        <Button 
                          size="sm" 
                          variant={isNext ? 'glow' : section.isCompleted ? 'outline' : 'primary'} 
                          className={`h-8 text-xs ${section.isCompleted ? 'text-slate-500' : ''}`}
                          onClick={() => setActiveLesson({ ...section, chapterTitle: chapter.title })}
                        >
                          {isNext ? 'Continue' : section.isCompleted ? 'Review' : 'Start'}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        ))}
      </div>
    );
  };

  const renderSmartReview = () => {
    // Collect stats from current subject
    const sections = currentSubject.chapters.flatMap(c => c.sections);
    const lowConf = sections.filter(s => s.userConfidence === 'low');
    const medConf = sections.filter(s => s.userConfidence === 'medium');
    const highConf = sections.filter(s => s.userConfidence === 'high');

    return (
      <div className="space-y-6 animate-fade-in-up">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <Card className="p-4 border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-900/10">
                <div className="flex items-center gap-2 mb-2 text-red-600 dark:text-red-400">
                   <AlertTriangle className="w-5 h-5" />
                   <h3 className="font-bold">{t.confidenceLow}</h3>
                </div>
                <div className="text-2xl font-bold mb-1 text-slate-900 dark:text-white">{lowConf.length} <span className="text-sm font-normal text-slate-500">Topics</span></div>
             </Card>
             <Card className="p-4 border-l-4 border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10">
                <div className="flex items-center gap-2 mb-2 text-yellow-600 dark:text-yellow-400">
                   <BarChart className="w-5 h-5" />
                   <h3 className="font-bold">{t.confidenceMed}</h3>
                </div>
                <div className="text-2xl font-bold mb-1 text-slate-900 dark:text-white">{medConf.length} <span className="text-sm font-normal text-slate-500">Topics</span></div>
             </Card>
             <Card className="p-4 border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-900/10">
                <div className="flex items-center gap-2 mb-2 text-green-600 dark:text-green-400">
                   <CheckCircle2 className="w-5 h-5" />
                   <h3 className="font-bold">{t.confidenceHigh}</h3>
                </div>
                <div className="text-2xl font-bold mb-1 text-slate-900 dark:text-white">{highConf.length} <span className="text-sm font-normal text-slate-500">Topics</span></div>
             </Card>
         </div>

         <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
               <Flame className="w-5 h-5 text-orange-500" /> Priority Queue
            </h3>
            
            {/* Review CTA Button - Interactive Trigger */}
            { [...lowConf, ...medConf].length > 0 && (
               <Button 
                 fullWidth 
                 variant="glow" 
                 size="lg" 
                 onClick={() => setIsReviewSessionOpen(true)}
                 className="mb-6 shadow-orange-500/20 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 border-none transform transition-all hover:scale-[1.02]"
               >
                  Start Today's Review Session <ArrowRight className="w-4 h-4 ml-2" />
               </Button>
            )}

            <div className="space-y-3">
               {[...lowConf, ...medConf].length > 0 ? (
                 [...lowConf, ...medConf].map(section => (
                   <div key={section.id} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 hover:shadow-md transition-all cursor-pointer group" onClick={() => setActiveLesson({...section, chapterTitle: "Review Mode"})}>
                      <div>
                         <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {section.title}
                            {/* Tags: Urgent, Reinforce */}
                            <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full tracking-wide ${section.userConfidence === 'low' ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300' : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-300'}`}>
                               {section.userConfidence === 'low' ? 'Urgent' : 'Reinforce'}
                            </span>
                         </h4>
                         <p className="text-xs text-slate-500 mt-1">Last reviewed 3 days ago</p>
                      </div>
                      <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">Review</Button>
                   </div>
                 ))
               ) : (
                 <div className="text-center p-8 text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                    <Target className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    All caught up! Great job.
                 </div>
               )}
            </div>
         </div>
      </div>
    );
  };

  const renderNotebook = () => {
    // Filter items based on selectedSubjectId and notebookFilter
    const items = mockUserContent.filter(item => 
      item.subjectId === selectedSubjectId && 
      (notebookFilter === 'all' || item.type === notebookFilter + (notebookFilter === 'bookmarks' ? '' : 's') || item.type === notebookFilter) &&
      (item.content.toLowerCase().includes(searchQuery.toLowerCase()) || item.chapter.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
      <div className="space-y-6 animate-fade-in-up">
        {/* Notebook Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
           <div className="flex gap-2 overflow-x-auto w-full sm:w-auto scrollbar-hide">
             {['all', 'notes', 'bookmarks', 'highlights'].map(f => (
               <button 
                 key={f}
                 onClick={() => setNotebookFilter(f as SubTabType)}
                 className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${notebookFilter === f ? 'bg-slate-900 text-white dark:bg-white dark:text-black' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
               >
                 {f.charAt(0).toUpperCase() + f.slice(1)}
               </button>
             ))}
           </div>
           
           <div className="relative w-full sm:w-48 shrink-0">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search notes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 focus:outline-none transition-all text-slate-900 dark:text-white placeholder-slate-500"
              />
           </div>
        </div>

        <div className="grid gap-4">
           {items.length > 0 ? (
             items.map(item => (
               <Card key={item.id} className="p-4 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                     <div className="flex items-center gap-2">
                        {item.type === 'note' && <Notebook className="w-4 h-4 text-blue-500" />}
                        {item.type === 'bookmark' && <Bookmark className="w-4 h-4 text-red-500" />}
                        {item.type === 'highlight' && <Highlighter className="w-4 h-4 text-yellow-500" />}
                        <span className="text-xs font-bold uppercase text-slate-400">{item.type}</span>
                     </div>
                     <span className="text-xs text-slate-400">{item.date}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{item.chapter}</h4>
                  <p className={`text-sm text-slate-600 dark:text-slate-300 ${item.type === 'highlight' ? 'bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded italic border-l-2 border-yellow-400' : ''}`}>
                    {item.content}
                  </p>
                  <div className="mt-3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                     <Button size="sm" variant="ghost" className="h-6 text-xs text-blue-500 hover:text-blue-600">
                        Go to Context <ArrowRight className="w-3 h-3 ml-1" />
                     </Button>
                  </div>
               </Card>
             ))
           ) : (
             <div className="text-center p-12 text-slate-500">
                <Notebook className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p>No items found matching your filter.</p>
             </div>
           )}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in-up pb-12 relative">
      
      {/* Immersive Review Session Overlay */}
      {isReviewSessionOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-fade-in-up">
           <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-white" />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold text-white">Focus Review Mode</h2>
                    <p className="text-xs text-slate-400">Topic: Algebra & Functions</p>
                 </div>
              </div>
              <button 
                onClick={() => setIsReviewSessionOpen(false)} 
                className="w-10 h-10 rounded-full bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors border border-slate-800"
              >
                 <X className="w-5 h-5" />
              </button>
           </div>
           
           <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full text-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-b from-orange-500/20 to-transparent flex items-center justify-center mb-8 border border-orange-500/30 shadow-[0_0_60px_rgba(249,115,22,0.2)]">
                 <Zap className="w-16 h-16 text-orange-500" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">You have 12 items to review.</h1>
              <p className="text-slate-400 mb-10 text-lg">Estimated time: 15 minutes. Ready to boost your retention?</p>
              
              <Button size="xl" variant="glow" className="px-12 py-6 text-lg rounded-full shadow-orange-500/30 bg-orange-600 hover:bg-orange-500 border-none" onClick={() => setActiveLesson({ id: 'review-1', title: 'Review Session', duration: '15m', difficulty: 'medium', contentType: 'quiz', isCompleted: false, isLocked: false, xp: 100, chapterTitle: 'Smart Review' })}>
                 Start Session
              </Button>
           </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t.courses}</h2>
        <p className="text-slate-500">Resume where you left off or start a new topic.</p>
      </div>

      {/* 1. Subject Selector */}
      {renderSubjectSelector()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           
           {/* 2. Hero Card for Selected Subject */}
           <Card className={`p-6 bg-gradient-to-r ${currentSubject.gradient} border-none text-white relative overflow-hidden transition-all duration-500`}>
              <div className="relative z-10 flex justify-between items-start">
                 <div>
                    <span className="inline-block px-2 py-1 rounded bg-white/20 text-xs font-bold mb-2">
                       {selectedSubjectId.charAt(0).toUpperCase() + selectedSubjectId.slice(1)}
                    </span>
                    <h3 className="text-2xl font-bold mb-1">{currentSubject.title}</h3>
                    <p className="text-white/80 text-sm">{currentSubject.subTitle}</p>
                 </div>
                 <div className="text-right">
                    <div className="text-3xl font-bold">{currentSubject.progress}%</div>
                    <div className="text-xs text-white/80">Course Progress</div>
                 </div>
              </div>
              <div className="mt-6 w-full bg-black/20 rounded-full h-2 relative z-10">
                 <div className="bg-white h-2 rounded-full transition-all duration-1000" style={{ width: `${currentSubject.progress}%` }}></div>
              </div>
              {/* Abstract BG Icon */}
              <div className="absolute -right-6 -bottom-6 opacity-10">
                 <currentSubject.icon className="w-48 h-48 text-white" />
              </div>
           </Card>

           {/* 3. Integrated Tabs Control */}
           <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4">
              <button 
                 onClick={() => setActiveViewMode('curriculum')}
                 className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeViewMode === 'curriculum' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                 <List className="w-4 h-4" /> Curriculum
              </button>
              <button 
                 onClick={() => setActiveViewMode('review')}
                 className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeViewMode === 'review' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                 <Brain className="w-4 h-4" /> Smart Review
              </button>
              <button 
                 onClick={() => setActiveViewMode('notebook')}
                 className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeViewMode === 'notebook' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                 <Notebook className="w-4 h-4" /> My Notebook
              </button>
           </div>

           {/* 4. Tab Content Area */}
           <div className="min-h-[400px]">
              {activeViewMode === 'curriculum' && renderCurriculum()}
              {activeViewMode === 'review' && renderSmartReview()}
              {activeViewMode === 'notebook' && renderNotebook()}
           </div>
        </div>

        {/* Right Sidebar (Global Context) */}
        <div className="space-y-6">
           {/* Interactive Study Goal Card */}
           <Card className="p-5 group cursor-pointer hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                 <h3 className="font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                    <GraduationCap className="w-5 h-5 text-blue-500" /> Study Goal
                 </h3>
                 <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <div className="text-center py-4 relative">
                 <div className="absolute inset-0 bg-blue-500/5 blur-2xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-500"></div>
                 <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1 relative z-10">A*</div>
                 <p className="text-xs text-slate-500 relative z-10">Target Grade for {currentSubject.title}</p>
                 
                 <div className="mt-4 grid grid-cols-2 gap-2 text-center relative z-10">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                       <div className="font-bold text-blue-500">14</div>
                       <div className="text-[10px] text-slate-400">Hours Studied</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                       <div className="font-bold text-green-500">850</div>
                       <div className="text-[10px] text-slate-400">Questions Done</div>
                    </div>
                 </div>
                 
                 <div className="mt-4 text-xs font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                    View Roadmap &gt;
                 </div>
              </div>
           </Card>

           {/* Live Class Widget with Empty State */}
           {hasLiveClass ? (
             <Card className="p-5 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
                <div className="flex justify-between items-start mb-2">
                   <h3 className="font-bold text-blue-800 dark:text-blue-300 text-sm">Next Live Class</h3>
                   <button onClick={() => setHasLiveClass(false)} className="text-[10px] text-blue-400 hover:underline">Dismiss</button>
                </div>
                <div className="flex items-center gap-3 mb-3">
                   <div className="w-10 h-10 rounded-lg bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-blue-700 dark:text-white font-bold text-xs">
                      18<br/>OCT
                   </div>
                   <div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">Exam Prep Strategy</div>
                      <div className="text-xs text-slate-500">19:00 - 20:30 • Mr. Anderson</div>
                   </div>
                </div>
                <Button size="sm" fullWidth className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-blue-500/20">
                   Set Reminder
                </Button>
             </Card>
           ) : (
             <Card className="p-6 bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 text-center">
                <div className="w-12 h-12 mx-auto bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-3">
                   <Coffee className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-1">No classes this week</h3>
                <p className="text-xs text-slate-500 mb-4">Review your Error Book?</p>
                <Button variant="outline" size="sm" onClick={() => setHasLiveClass(true)} className="text-xs h-8">
                   Open Error Book
                </Button>
             </Card>
           )}
        </div>
      </div>
    </div>
  );
};
