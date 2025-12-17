import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { 
  Trophy, ChevronRight, Notebook, X, Info, ArrowLeft, Edit3, Highlighter, 
  Trash2, Bookmark, MessageSquare, ThumbsUp, Reply, Zap
} from 'lucide-react';
import { Section, ConfidenceLevel, Confetti } from '../shared';

export const LessonPlayer = ({ lesson, onBack, onComplete, t }: { lesson: Section & { chapterTitle: string }, onBack: () => void, onComplete: () => void, t: any }) => {
  const [confidence, setConfidence] = useState<ConfidenceLevel | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Interaction States
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [highlightMode, setHighlightMode] = useState(false);
  const [hasHighlights, setHasHighlights] = useState(false);
  
  // Discussion States
  const [discussionInput, setDiscussionInput] = useState('');
  const [comments, setComments] = useState<{id: number, user: string, text: string, time: string}[]>([]);

  const handleFinish = () => {
    setShowCelebration(true);
    setTimeout(() => {
      onComplete(); // Go back or mark done
    }, 2500);
  };

  const saveNote = () => {
    console.log("Note saved:", currentNote);
    setIsNoteModalOpen(false);
    setCurrentNote('');
  };

  const handleTextSelection = () => {
    if (!highlightMode) return;
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      setHasHighlights(true);
      selection.removeAllRanges();
    }
  };

  const postComment = () => {
    if (!discussionInput.trim()) return;
    const newComment = {
      id: Date.now(),
      user: "Alex Student",
      text: discussionInput,
      time: "Just now"
    };
    setComments([newComment, ...comments]);
    setDiscussionInput('');
  };

  if (showCelebration) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] animate-fade-in-up text-center relative">
        <Confetti />
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 max-w-sm w-full relative z-10">
           <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce shadow-lg shadow-yellow-400/30">
              <Trophy className="w-10 h-10 text-white" />
           </div>
           <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Lesson Complete!</h2>
           <p className="text-slate-500 mb-6">You've earned <span className="font-bold text-yellow-500">+{lesson.xp} XP</span></p>
           
           <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-full h-3 mb-2">
              <div className="bg-blue-500 h-3 rounded-full w-[85%] shadow-sm transition-all duration-1000"></div>
           </div>
           <p className="text-xs text-slate-400 text-right mb-6">1250 / 1500 XP to Level Up</p>

           <Button fullWidth variant="glow" onClick={onComplete}>
              Continue Journey <ChevronRight className="w-4 h-4 ml-1" />
           </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in-up relative">
      
      {/* Note Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
               <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                 <Notebook className="w-5 h-5 text-blue-500" />
                 Take a Note
               </h3>
               <button onClick={() => setIsNoteModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                 <X className="w-5 h-5" />
               </button>
            </div>
            <div className="p-6">
              <textarea 
                className="w-full h-40 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none text-slate-900 dark:text-white placeholder-slate-400"
                placeholder="Type your key takeaways here..."
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                <Info className="w-3 h-3" /> Notes are saved automatically to your dashboard.
              </p>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
               <Button variant="ghost" onClick={() => setIsNoteModalOpen(false)}>Cancel</Button>
               <Button variant="glow" onClick={saveNote}>Save Note</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-sm z-20 pt-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="h-9 w-9 p-0 rounded-full border border-slate-200 dark:border-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500">{lesson.chapterTitle}</span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{lesson.title}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Button 
             variant={isNoteModalOpen ? 'primary' : 'ghost'} 
             size="sm" 
             onClick={() => setIsNoteModalOpen(true)}
             className={`transition-colors ${isNoteModalOpen ? '' : 'text-slate-500 hover:text-blue-500'}`}
             title="Add Note"
           >
             <Edit3 className="w-4 h-4" />
           </Button>
           
           <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
             <Button 
               variant={highlightMode ? 'glow' : 'ghost'} 
               size="sm" 
               className={`h-7 px-2 ${!highlightMode && 'text-slate-500 hover:text-yellow-500'}`}
               onClick={() => setHighlightMode(!highlightMode)}
               title="Toggle Highlight Mode"
             >
               <Highlighter className="w-4 h-4" />
             </Button>
             {hasHighlights && (
               <Button 
                 variant="ghost" 
                 size="sm" 
                 className="h-7 px-2 text-slate-400 hover:text-red-500"
                 onClick={() => setHasHighlights(false)}
                 title="Clear Highlights"
               >
                 <Trash2 className="w-4 h-4" />
               </Button>
             )}
           </div>

           <Button 
             variant="ghost" 
             size="sm" 
             onClick={() => setIsBookmarked(!isBookmarked)}
             className={`transition-colors ${isBookmarked ? 'text-red-500 bg-red-50 dark:bg-red-900/10' : 'text-slate-500 hover:text-red-500'}`}
             title="Bookmark Lesson"
           >
             <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
           </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content Column */}
        <div className="flex-1 space-y-8">
          
          {/* Learning Content */}
          <div 
            className={`prose dark:prose-invert max-w-none transition-all ${highlightMode ? 'cursor-text selection:bg-yellow-200 dark:selection:bg-yellow-900/50' : ''}`}
            onMouseUp={handleTextSelection}
          >
            {highlightMode && (
               <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700/50 rounded-lg flex items-center justify-center text-xs text-yellow-700 dark:text-yellow-400 animate-fade-in-up">
                 <Highlighter className="w-3 h-3 mr-2" />
                 Highlight mode active: Select text to highlight
               </div>
            )}

            <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6 uppercase tracking-tight">
              {lesson.title}
            </h1>

            {/* Learning Outcomes Box */}
            <div className="rounded-xl overflow-hidden border border-blue-200 dark:border-blue-900/50 mb-8">
              <div className="bg-blue-600 px-6 py-3 flex justify-between items-center">
                <h3 className="text-white font-bold uppercase tracking-wide text-sm">Learning Outcomes</h3>
                <span className="text-xs text-blue-100 bg-blue-700 px-2 py-0.5 rounded">{lesson.duration} Read</span>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/10 p-6">
                <ul className="space-y-3">
                  {[
                    "Understand the core definitions and terminology.",
                    "Apply theoretical concepts to practical scenarios."
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Introduction / Content Body */}
            <div className="space-y-4 text-slate-800 dark:text-slate-200">
              <p>
                In this lesson, we will explore the fundamental dynamics of {lesson.title}. 
                Understanding this concept is crucial for solving advanced problems in this unit.
              </p>
              <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-2xl flex items-center justify-center h-64 text-slate-400 border border-slate-200 dark:border-slate-700 border-dashed">
                 [ Interactive Video / Diagram Placeholder ]
              </div>
              <h3 className="text-xl font-bold mt-6">Key Concepts</h3>
              <p>
                The interaction between supply and demand determines market equilibrium...
              </p>
            </div>
          </div>

          {/* Discussion Section */}
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Discuss <span className="flex items-center justify-center w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 text-[10px] text-slate-500 font-normal">i</span>
                </h3>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                   Filter <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
             </div>
             
             {/* Discussion Input */}
             <div className="mb-10 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
                <textarea 
                  className="w-full p-3 rounded-lg bg-transparent border-none outline-none resize-none text-sm text-slate-900 dark:text-white placeholder-slate-400" 
                  rows={3} 
                  placeholder="What do you want to discuss... (required)"
                  value={discussionInput}
                  onChange={(e) => setDiscussionInput(e.target.value)}
                />
                <div className="flex justify-between items-center px-2 pb-2 mt-2 border-t border-slate-100 dark:border-slate-800 pt-2">
                   <span className="text-xs text-slate-400 font-medium">Markdown supported</span>
                   <Button size="sm" variant={discussionInput.trim() ? 'primary' : 'ghost'} disabled={!discussionInput.trim()} onClick={postComment}>
                      Post Message
                   </Button>
                </div>
             </div>
             
             {/* Comments List / Empty State */}
             <div className="space-y-6">
                {comments.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700/50">
                      <div className="w-16 h-16 mb-4 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center relative">
                         <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                         <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-0.5 bg-slate-300 dark:bg-slate-600 rotate-45 transform origin-center"></div>
                         </div>
                      </div>
                      <p className="font-medium">No messages to display</p>
                      <p className="text-xs mt-1 opacity-70">Be the first to start the discussion!</p>
                   </div>
                ) : (
                   comments.map((comment) => (
                      <div key={comment.id} className="flex gap-4 animate-fade-in-up">
                         <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 overflow-hidden">
                            <img src={`https://i.pravatar.cc/150?u=${comment.user}`} alt={comment.user} />
                         </div>
                         <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                               <span className="font-bold text-sm text-slate-900 dark:text-white">{comment.user}</span>
                               <span className="text-xs text-slate-400">{comment.time}</span>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl inline-block border border-slate-100 dark:border-slate-700/50">
                               {comment.text}
                            </p>
                            <div className="flex items-center gap-4 mt-2 ml-1">
                               <button className="text-xs font-bold text-slate-400 hover:text-blue-500 flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> Like</button>
                               <button className="text-xs font-bold text-slate-400 hover:text-blue-500 flex items-center gap-1"><Reply className="w-3 h-3" /> Reply</button>
                            </div>
                         </div>
                      </div>
                   ))
                )}
             </div>
          </div>
        </div>

        {/* Right Sidebar - Sticky */}
        <div className="lg:w-80 shrink-0 space-y-6">
           <Card className="p-0 border-none shadow-lg bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 sticky top-4 overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                 <h3 className="font-bold text-slate-900 dark:text-white mb-1">Session Progress</h3>
                 <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-2">
                    <div className="bg-green-500 h-2 rounded-full w-[60%]"></div>
                 </div>
              </div>
              
              <div className="p-5 space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Confidence Check</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {['High', 'Medium', 'Low'].map((level) => (
                      <button 
                        key={level}
                        onClick={() => setConfidence(level.toLowerCase() as ConfidenceLevel)}
                        className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                          confidence === level.toLowerCase() 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' 
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-blue-400 hover:text-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <Button fullWidth size="lg" variant="glow" onClick={handleFinish} className="group relative overflow-hidden">
                   <span className="relative z-10 flex items-center gap-2">
                     Complete & Continue <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </span>
                   {/* Shine effect */}
                   <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                </Button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 text-center">
                 <p className="text-xs text-slate-500">Reward for completion</p>
                 <div className="font-bold text-yellow-500 flex items-center justify-center gap-1 text-lg">
                    <Zap className="w-4 h-4 fill-yellow-500" /> +{lesson.xp} XP
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};