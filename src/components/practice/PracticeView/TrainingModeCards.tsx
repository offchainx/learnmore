import React from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Eraser, Trophy, Zap } from 'lucide-react';

interface PracticeModeGridProps {
  selectedSubjectId: string;
}

export const PracticeModeGrid: React.FC<PracticeModeGridProps> = ({ selectedSubjectId }) => {
  const router = useRouter();

  return (
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
};
