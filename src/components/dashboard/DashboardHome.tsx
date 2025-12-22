
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DailyInspiration } from './Widgets';
import { 
  Target, Clock, PenTool, AlertTriangle, Star, Trophy, ArrowRight,
  Flame, Activity, ChevronRight, Play, Brain, ArrowUpRight, Zap
} from 'lucide-react';
import { useApp } from '@/providers/app-provider';
import { DashboardData } from '@/actions/dashboard';

export const DashboardHome = ({ navigate, initialData }: { navigate: (path: string) => void, initialData: DashboardData | null }) => {
  const { t, lang } = useApp();

  // Mock data for missions (Layer 1)
  const missions = [
    { title: "Fix 3 Errors in Algebra", xp: 50, type: t.dashboard.fix, color: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
    { title: "Learn: Force Vectors", xp: 100, type: "New", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
    { title: "Quiz: Chemical Bonding", xp: 75, type: "Quiz", color: "text-purple-400 bg-purple-400/10 border-purple-400/20" }
  ];

  // Use real data or fallback to defaults
  const stats = initialData?.stats || {
    studyTime: "0h",
    questions: 0,
    accuracy: 0,
    mistakes: 0,
    streak: 0
  };

  const weaknesses = initialData?.weaknesses || [];
  const recentActivity = initialData?.recentActivity || [];
  const subjectStrengths = initialData?.subjectStrengths || [];

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      
      {/* --- Row 1: Core Drive (Status & Inspiration) --- */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Card: Today's Mission (~70% Width on LG) */}
        <Card className="lg:col-span-2 p-0 overflow-hidden relative border-none bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl h-full flex flex-col">
           {/* Abstract Background Effect */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none"></div>

           <div className="p-6 md:p-8 relative z-10 h-full flex flex-col">
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                       <Target className="w-6 h-6 text-blue-400" /> {t.dashboard.todaysMission}
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">{t.dashboard.missionSub}</p>
                 </div>
                 <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                    </span>
                    <span className="text-xs font-bold text-blue-200">AI Active</span>
                 </div>
              </div>

              <div className="space-y-3 flex-1">
                 {missions.map((m, i) => (
                    <div key={i} className="group flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/30 transition-all cursor-pointer hover:shadow-lg shadow-black/20">
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center group-hover:border-blue-400 group-hover:bg-blue-500/20 transition-all`}>
                             <div className={`w-2 h-2 rounded-full ${m.color.split(' ')[0]} bg-current`}></div>
                          </div>
                          <div>
                             <div className="font-bold text-white text-base group-hover:text-blue-200 transition-colors">{m.title}</div>
                             <div className={`text-[10px] inline-block px-1.5 py-0.5 rounded mt-1 font-bold ${m.color}`}>
                                {m.type}
                             </div>
                          </div>
                       </div>
                       <div className="text-right flex items-center gap-4">
                          <div className="text-sm font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded border border-yellow-400/20">+{m.xp} XP</div>
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                             <ArrowRight className="w-4 h-4" />
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </Card>

        {/* Side Card: Daily Inspiration (~30% Width on LG) */}
        <div className="lg:col-span-1 h-full">
           <DailyInspiration 
             lang={lang} 
             t={t} 
             welcomeTitle={t.dashboard.dailyVibe} 
             welcomeSub="Stay motivated." 
             className="h-full min-h-[340px]" 
           />
        </div>
      </section>

      {/* --- Row 2: Data Dashboard (The Stats) --- */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Group A: Effort (Warm Colors) */}
         <Card className="p-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/50">
            <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-700/50">
               {[
                  { label: t.dashboard.studyTime, val: `${stats.studyTime}h`, icon: Clock, color: "text-orange-500", sub: "Total" },
                  { label: t.dashboard.streak, val: `${stats.streak} Days`, icon: Flame, color: "text-red-500", sub: "Keep it up!" },
                  { label: t.dashboard.level, val: "12", icon: Star, color: "text-yellow-500", sub: "Level" },
               ].map((s, i) => (
                  <div key={i} className="p-4 flex flex-col items-center text-center group cursor-default">
                     <s.icon className={`w-5 h-5 mb-2 ${s.color} group-hover:scale-110 transition-transform`} />
                     <div className="text-xl font-bold text-slate-900 dark:text-white leading-none mb-1">{s.val}</div>
                     <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">{s.label}</div>
                  </div>
               ))}
            </div>
         </Card>
         
         {/* Group B: Performance (Cool Colors) */}
         <Card className="p-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/50">
            <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-700/50">
               {[
                  { label: t.dashboard.questions, val: `${stats.questions}`, icon: PenTool, color: "text-blue-500", sub: "Total" },
                  { label: t.dashboard.accuracy, val: `${stats.accuracy}%`, icon: Target, color: "text-emerald-500", sub: "Average" },
                  { label: t.dashboard.mistakes, val: `${stats.mistakes}`, icon: AlertTriangle, color: "text-purple-500", sub: "Pending fix" },
               ].map((s, i) => (
                  <div key={i} className="p-4 flex flex-col items-center text-center group cursor-default">
                     <s.icon className={`w-5 h-5 mb-2 ${s.color} group-hover:scale-110 transition-transform`} />
                     <div className="text-xl font-bold text-slate-900 dark:text-white leading-none mb-1">{s.val}</div>
                     <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">{s.label}</div>
                  </div>
               ))}
            </div>
         </Card>
      </section>

      {/* --- Row 3: Positioning & Context (Process vs. Outcome) --- */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Left Column: Subject Progress (~65% Width) */}
         <Card className="lg:col-span-2 p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/50">
            <div className="flex justify-between items-end mb-6">
               <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                     <Activity className="w-5 h-5 text-indigo-500" /> {t.dashboard.subjectProgress}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Real-time tracking of your accuracy</p>
               </div>
               <Button variant="ghost" size="sm" onClick={() => navigate && navigate('/subjects')}>{t.common.viewAll}</Button>
            </div>
            
            <div className="space-y-6">
               {subjectStrengths.length > 0 ? subjectStrengths.map((sub, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                     <div className="w-24 font-bold text-sm text-slate-700 dark:text-slate-300">{sub.subject}</div>
                     <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1.5">
                           <span className="text-slate-400">Accuracy</span>
                           <span className={`font-bold ${sub.accuracy >= 80 ? 'text-emerald-500' : 'text-blue-500'}`}>{sub.accuracy}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700/50 h-2.5 rounded-full overflow-hidden">
                           <div className={`h-full rounded-full ${sub.accuracy >= 80 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${sub.accuracy}%` }}></div>
                        </div>
                     </div>
                     
                     <button 
                        className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white transition-all shadow-sm hover:shadow-md hover:scale-105" 
                        title="View Subject"
                        onClick={() => navigate('/subjects')}
                     >
                        <Zap className="w-4 h-4 fill-current" />
                     </button>
                  </div>
               )) : (
                   <p className="text-sm text-muted-foreground text-center py-4">Start practicing to see subject progress!</p>
               )}
            </div>
         </Card>

         {/* Right Column: Rank & Positioning (~35% Width) */}
         <Card className="lg:col-span-1 p-6 bg-gradient-to-br from-indigo-900 to-purple-900 text-white border-none flex flex-col justify-between relative overflow-hidden shadow-lg">
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] pointer-events-none"></div>
            
            <div>
               <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
                  <Trophy className="w-5 h-5 text-yellow-400" /> {t.dashboard.rank}
               </h3>
               <p className="text-indigo-200 text-xs">Diamond League • Season 4</p>
            </div>

            <div className="my-8 text-center relative z-10">
               <div className="inline-block relative">
                  <div className="text-5xl font-bold text-white drop-shadow-lg">Top 15%</div>
                  <div className="text-sm text-indigo-300 mt-1 font-medium">Percentile Rank</div>
               </div>
               <div className="mt-6 flex justify-center gap-2 text-xs">
                  <span className="bg-white/10 px-2 py-1 rounded">Avg: 68%</span>
                  <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded border border-green-500/30">You: {stats.accuracy}%</span>
               </div>
            </div>

            <Button fullWidth variant="glow" className="bg-white/10 hover:bg-white/20 border-white/20 shadow-none">
               View Leaderboard <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
         </Card>
      </section>

      {/* --- Row 4: Deep Dive & Actions --- */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Left: My Learning Path */}
         <Card className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/50">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
               <Brain className="w-5 h-5 text-blue-500" /> {t.dashboard.learningPath}
            </h3>
            
            {/* Continue Learning Item */}
            {recentActivity.length > 0 ? (
                recentActivity.map((item, i) => (
                    <div key={i} onClick={() => navigate(`/course/${item.id}` /* Assuming id is lesson id, ideally we need subjectId too but this is ok for now if route handles it or redirect */)} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-blue-500/30 transition-colors group mb-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                            <Play className="w-6 h-6 fill-current" />
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Resume: {item.subject}</div>
                            <div className="font-bold text-slate-900 dark:text-white">{item.title}</div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2">
                                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${item.progress}%` }}></div>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                ))
            ) : (
                <div className="text-sm text-muted-foreground p-4">No recent activity. Start a course!</div>
            )}
            
            {/* Up Next List */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
               <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-2">{t.dashboard.upNext}</div>
               <Button variant="ghost" size="sm" onClick={() => navigate('/subjects')} className="text-xs">Find new courses</Button>
            </div>
         </Card>

         {/* Right: Weakness Sniper (The Inventory) */}
         <Card className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/50">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" /> {t.dashboard.weaknessSniper}
               </h3>
               <span className="text-xs bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded-full font-bold">{weaknesses.length} Active</span>
            </div>
            
            <div className="space-y-3">
               {weaknesses.length > 0 ? weaknesses.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-red-100 dark:border-red-900/20 bg-red-50/50 dark:bg-red-900/5 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors cursor-pointer group">
                     <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-1">{item.topic}</div>
                        <div className="text-xs text-slate-500">{item.subject}</div>
                     </div>
                     <div className="flex items-center gap-3">
                        <span className="text-red-500 font-bold text-sm">Lvl {item.masteryLevel}</span>
                        {/* Refinement 4: Solid Filled Fix Button */}
                        <Button 
                            size="sm" 
                            onClick={() => navigate('/error-book')}
                            className="h-7 px-4 text-xs bg-red-500 text-white border-transparent hover:bg-red-600 shadow-md shadow-red-500/20 transition-all transform hover:scale-105"
                        >
                           {t.dashboard.fix}
                        </Button>
                     </div>
                  </div>
               )) : (
                   <p className="text-sm text-muted-foreground text-center py-4">Great job! No weaknesses detected.</p>
               )}
            </div>
            <Button variant="ghost" fullWidth onClick={() => navigate('/error-book')} className="mt-4 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white">{t.common.viewAll}</Button>
         </Card>
      </section>

    </div>
  );
};
