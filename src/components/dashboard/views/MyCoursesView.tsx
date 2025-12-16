/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ChevronRight, ChevronDown, CheckCircle2, Lock, Clock, AlertTriangle, 
  BarChart, Flame, Target, Notebook, Bookmark, Highlighter, ArrowRight,
  List, Brain, GraduationCap
} from 'lucide-react';
import { subjectsData, mockUserContent, Section, SubTabType } from '../shared';
import { LessonPlayer } from './LessonPlayer';

interface MyCoursesViewProps {
  t: Record<string, unknown>;
}

export const MyCoursesView: React.FC<MyCoursesViewProps> = ({ t }) => {
  const [activeLesson, setActiveLesson] = useState<Section & { chapterTitle: string } | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('math');
  const [activeViewMode, setActiveViewMode] = useState<'curriculum' | 'review' | 'notebook'>('curriculum');
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  
  // Notebook Filter State
  const [notebookFilter, setNotebookFilter] = useState<SubTabType>('all');

  // Load subject data
  const currentSubject = subjectsData[selectedSubjectId] || subjectsData['math'];

  // Handle subject change and reset expanded chapter in event handler to avoid set-state-in-effect
  const handleSubjectChange = (id: string) => {
    setSelectedSubjectId(id);
    const subject = subjectsData[id] || subjectsData['math'];
    if (subject.chapters.length > 0) {
      setExpandedChapter(subject.chapters[0].id);
    }
  };

  // Initial load
  React.useEffect(() => {
    // Set initial expanded chapter only on mount
    const subject = subjectsData[selectedSubjectId] || subjectsData['math'];
    if (subject.chapters.length > 0) {
      setExpandedChapter(subject.chapters[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

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
    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide mb-6">
      {Object.values(subjectsData).map((sub) => {
        const isActive = selectedSubjectId === sub.id;
        return (
          <button
            key={sub.id}
            onClick={() => handleSubjectChange(sub.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all border whitespace-nowrap ${
              isActive 
                ? `${sub.color} text-white border-transparent shadow-lg shadow-blue-900/10` 
                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <sub.icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
            <span className="text-sm font-bold">{sub.title}</span>
          </button>
        );
      })}
    </div>
  );

  const renderCurriculum = () => (
    <div className="space-y-4 animate-fade-in-up">
      {currentSubject.chapters.map((chapter) => (
        <Card key={chapter.id} className="overflow-hidden border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800">
          <div 
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
            onClick={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${expandedChapter === chapter.id ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                {expandedChapter === chapter.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white">{chapter.title}</h4>
            </div>
            <span className="text-xs text-slate-400 font-medium">{chapter.sections.filter(s => s.isCompleted).length}/{chapter.sections.length} Done</span>
          </div>
          
          {expandedChapter === chapter.id && (
            <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              {chapter.sections.map((section) => (
                <div key={section.id} className="p-3 pl-14 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                  <div className="flex items-center gap-3">
                    {section.isCompleted ? (
                      <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                      </div>
                    ) : section.isLocked ? (
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600 shrink-0"></div>
                    )}
                    <div>
                      <p className={`text-sm font-medium ${section.isLocked ? 'text-slate-400' : 'text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>
                        {section.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><Clock className="w-3 h-3" /> {section.duration}</span>
                        {section.xp > 0 && <span className="text-[10px] text-yellow-500 font-bold">+{section.xp} XP</span>}
                      </div>
                    </div>
                  </div>
                  
                  {!section.isLocked && (
                    <Button 
                      size="sm" 
                      variant={section.isCompleted ? 'outline' : 'default'} 
                      className={`h-8 text-xs ${section.isCompleted ? 'text-slate-500' : ''}`}
                      onClick={() => setActiveLesson({ ...section, chapterTitle: chapter.title })}
                    >
                      {section.isCompleted ? 'Review' : 'Start'}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );

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
            <div className="space-y-3">
               {[...lowConf, ...medConf].length > 0 ? (
                 [...lowConf, ...medConf].map(section => (
                   <div key={section.id} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 hover:shadow-md transition-all cursor-pointer" onClick={() => setActiveLesson({...section, chapterTitle: "Review Mode"})}>
                      <div>
                         <h4 className="font-bold text-slate-900 dark:text-white">{section.title}</h4>
                         <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded mt-1 inline-block ${section.userConfidence === 'low' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                            {section.userConfidence === 'low' ? 'Urgent' : 'Reinforce'}
                         </span>
                      </div>
                      <Button size="sm" variant="ghost">Review</Button>
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
      (notebookFilter === 'all' || item.type === notebookFilter + (notebookFilter === 'bookmarks' ? '' : 's') || item.type === notebookFilter) // simple loose match for demo types
    );

    return (
      <div className="space-y-6 animate-fade-in-up">
        {/* Notebook Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
           {['all', 'notes', 'bookmarks', 'highlights'].map(f => (
             <button 
               key={f}
               onClick={() => setNotebookFilter(f as SubTabType)}
               className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${notebookFilter === f ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
             >
               {f.charAt(0).toUpperCase() + f.slice(1)}
             </button>
           ))}
        </div>

        <div className="grid gap-4">
           {items.length > 0 ? (
             items.map(item => (
               <Card key={item.id} className="p-4 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors cursor-pointer">
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
                  <p className={`text-sm text-slate-600 dark:text-slate-300 ${item.type === 'highlight' ? 'bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded italic' : ''}`}>
                    {item.content}
                  </p>
                  <div className="mt-3 flex justify-end">
                     <Button size="sm" variant="ghost" className="h-6 text-xs text-blue-500 hover:text-blue-600">
                        Go to Context <ArrowRight className="w-3 h-3 ml-1" />
                     </Button>
                  </div>
               </Card>
             ))
           ) : (
             <div className="text-center p-12 text-slate-500">
                <Notebook className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p>No items found in your notebook for this subject.</p>
             </div>
           )}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in-up pb-12">
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
           <Card className="p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-blue-500" /> Study Goal</h3>
              <div className="text-center py-4">
                 <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">A*</div>
                 <p className="text-xs text-slate-500">Target Grade for {currentSubject.title}</p>
                 <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                       <div className="font-bold text-blue-500">14</div>
                       <div className="text-[10px] text-slate-400">Hours Studied</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                       <div className="font-bold text-green-500">850</div>
                       <div className="text-[10px] text-slate-400">Questions Done</div>
                    </div>
                 </div>
              </div>
           </Card>

           <Card className="p-5 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
              <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2 text-sm">Next Live Class</h3>
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 rounded-lg bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-blue-700 dark:text-white font-bold text-xs">
                    18<br/>OCT
                 </div>
                 <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">Exam Prep Strategy</div>
                    <div className="text-xs text-slate-500">19:00 - 20:30 • Mr. Anderson</div>
                 </div>
              </div>
              <Button size="sm" variant="default" className="w-full bg-blue-600 hover:bg-blue-700 text-white border-none">Set Reminder</Button>
           </Card>
        </div>
      </div>
    </div>
  );
};