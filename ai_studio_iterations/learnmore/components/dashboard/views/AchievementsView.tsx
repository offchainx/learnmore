import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Share2, Sparkles, Zap, Brain, Target, Clock, BookOpen, MessageSquare, Moon, Timer, Heart, Crown, Award, TrendingUp, Hexagon, Lock } from 'lucide-react';

export const AchievementsView = ({ t }: { t: any }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'rare' | 'epic'>('all');

  const stats = [
    { label: "Study Streak", value: "12 Days", icon: Zap, color: "text-yellow-500" },
    { label: "Questions", value: "1,248", icon: Brain, color: "text-blue-500" },
    { label: "Accuracy", value: "85%", icon: Target, color: "text-green-500" },
    { label: "Hours", value: "48h", icon: Clock, color: "text-purple-500" },
  ];

  const badges = [
    { name: "Scholar", desc: "Complete 10 Lessons", icon: BookOpen, rarity: 'common', unlocked: true },
    { name: "Sharpshooter", desc: "100% in a Quiz", icon: Target, rarity: 'rare', unlocked: true },
    { name: "Socialite", desc: "5 Helpful Comments", icon: MessageSquare, rarity: 'common', unlocked: false },
    { name: "Night Owl", desc: "Study after 10 PM", icon: Moon, rarity: 'epic', unlocked: false },
    { name: "Marathon", desc: "Study 4 hours in one sitting", icon: Timer, rarity: 'legendary', unlocked: false },
    { name: "Helper", desc: "Answer 10 questions", icon: Heart, rarity: 'rare', unlocked: true },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.3)]';
      case 'epic': return 'text-purple-500 border-purple-500/50 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.3)]';
      case 'rare': return 'text-blue-500 border-blue-500/50 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]';
      default: return 'text-slate-500 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800';
    }
  };

  return (
    <div className="animate-fade-in-up pb-12">
       {/* 1. Hero Profile Card */}
       <div className="relative mb-8 rounded-3xl overflow-hidden bg-slate-900 text-white shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px]"></div>
          
          <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
             {/* Avatar Level Ring */}
             <div className="relative group cursor-pointer">
                <div className="w-32 h-32 rounded-full border-4 border-white/10 p-1 relative">
                   <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin-slow" style={{ animationDuration: '3s' }}></div>
                   <img src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=2669&auto=format&fit=crop" className="w-full h-full rounded-full object-cover" alt="Profile" />
                   <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-slate-900 shadow-lg">
                      Level 12
                   </div>
                </div>
             </div>

             <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-3 mb-2">
                   <h1 className="text-3xl font-bold">Alex Student</h1>
                   <span className="text-blue-300 font-medium pb-1 flex items-center gap-1"><Sparkles className="w-4 h-4" /> Knowledge Seeker</span>
                </div>
                <div className="w-full max-w-lg bg-white/10 h-3 rounded-full overflow-hidden backdrop-blur-sm mb-2">
                   <div className="bg-gradient-to-r from-blue-400 to-purple-400 h-full rounded-full w-[65%] relative">
                      <div className="absolute top-0 right-0 h-full w-1 bg-white/50 animate-pulse"></div>
                   </div>
                </div>
                <div className="flex justify-between max-w-lg text-xs text-slate-400 font-mono">
                   <span>1,250 XP</span>
                   <span>2,000 XP (Next Level)</span>
                </div>
             </div>

             <div className="flex flex-col gap-3">
                <Button variant="glow" className="shadow-lg shadow-blue-500/30 border border-blue-400/30">
                   <Share2 className="w-4 h-4 mr-2" /> Share Profile
                </Button>
                <Button variant="secondary" className="bg-white/5 hover:bg-white/10 text-white border-white/10 backdrop-blur-md">
                   Edit Profile
                </Button>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Stats & Radar */}
          <div className="lg:col-span-1 space-y-6">
             {/* Stats Grid */}
             <div className="grid grid-cols-2 gap-3">
                {stats.map((stat, i) => (
                   <Card key={i} className="p-4 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800 flex flex-col items-center text-center hover:border-blue-500/30 transition-colors">
                      <stat.icon className={`w-6 h-6 mb-2 ${stat.color}`} />
                      <div className="text-lg font-bold text-slate-900 dark:text-white">{stat.value}</div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</div>
                   </Card>
                ))}
             </div>

             {/* Hexagon Radar Chart */}
             <Card className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/50 relative overflow-hidden">
                <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                   <Hexagon className="w-5 h-5 text-blue-500" /> Capability Map
                </h3>
                <div className="relative h-64 w-full flex items-center justify-center">
                   {/* Background Hexagons */}
                   <div className="absolute w-48 h-48 border border-slate-200 dark:border-slate-700 opacity-50 transform rotate-90" style={{clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'}}></div>
                   <div className="absolute w-32 h-32 border border-slate-200 dark:border-slate-700 opacity-50 transform rotate-90" style={{clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'}}></div>
                   
                   {/* Data Shape (Simulated) */}
                   <div className="absolute w-40 h-40 bg-blue-500/20 border-2 border-blue-500 transform rotate-90" style={{clipPath: 'polygon(50% 10%, 90% 25%, 85% 85%, 50% 90%, 15% 75%, 10% 25%)'}}></div>
                   
                   {/* Labels */}
                   <span className="absolute top-2 text-[10px] font-bold text-slate-500 uppercase">Focus</span>
                   <span className="absolute bottom-2 text-[10px] font-bold text-slate-500 uppercase">Speed</span>
                   <span className="absolute left-2 text-[10px] font-bold text-slate-500 uppercase">Logic</span>
                   <span className="absolute right-2 text-[10px] font-bold text-slate-500 uppercase">Memory</span>
                </div>
             </Card>

             {/* Growth Graph (Simple SVG) */}
             <Card className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/50">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                   <TrendingUp className="w-5 h-5 text-green-500" /> XP History
                </h3>
                <div className="h-32 flex items-end gap-1">
                   {[20, 35, 45, 30, 60, 75, 50, 80, 90, 65, 85, 100].map((h, i) => (
                      <div key={i} className="flex-1 bg-slate-100 dark:bg-slate-700/50 rounded-t-sm relative group">
                         <div 
                           className="absolute bottom-0 w-full bg-blue-500 rounded-t-sm transition-all duration-500 group-hover:bg-blue-400" 
                           style={{ height: `${h}%` }}
                         ></div>
                      </div>
                   ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-400">
                   <span>30 Days ago</span>
                   <span>Today</span>
                </div>
             </Card>
          </div>

          {/* Right Column: Badges Collection */}
          <div className="lg:col-span-2 space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                   <Award className="w-6 h-6 text-yellow-500" /> Badge Collection
                </h3>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                   {['all', 'rare', 'epic'].map(tab => (
                      <button
                         key={tab}
                         onClick={() => setActiveTab(tab as any)}
                         className={`px-3 py-1 text-xs font-bold rounded-md capitalize transition-all ${
                            activeTab === tab 
                            ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' 
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                         }`}
                      >
                         {tab}
                      </button>
                   ))}
                </div>
             </div>

             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {badges.filter(b => activeTab === 'all' || b.rarity === activeTab || (activeTab === 'rare' && b.rarity === 'legendary')).map((badge, i) => (
                   <div 
                     key={i} 
                     className={`relative p-1 rounded-2xl transition-all duration-300 group hover:-translate-y-1 ${
                        !badge.unlocked ? 'opacity-50 grayscale' : ''
                     }`}
                   >
                      {/* Rarity Border Glow */}
                      <div className={`absolute inset-0 rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity ${
                         badge.rarity === 'legendary' ? 'bg-yellow-500 blur-sm' :
                         badge.rarity === 'epic' ? 'bg-purple-500 blur-sm' :
                         badge.rarity === 'rare' ? 'bg-blue-500 blur-sm' : 'bg-transparent'
                      }`}></div>

                      <Card className={`relative h-full p-5 flex flex-col items-center text-center border-2 ${
                         badge.unlocked ? getRarityColor(badge.rarity) : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                      }`}>
                         {badge.rarity === 'legendary' && <div className="absolute top-2 right-2 text-yellow-500 animate-pulse"><Crown className="w-4 h-4" /></div>}
                         
                         <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 text-3xl shadow-inner ${
                            badge.unlocked ? 'bg-white/20 backdrop-blur-md' : 'bg-slate-200 dark:bg-slate-700'
                         }`}>
                            <badge.icon className="w-8 h-8" />
                         </div>
                         
                         <h4 className="font-bold text-slate-900 dark:text-white mb-1">{badge.name}</h4>
                         <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{badge.desc}</p>
                         
                         {!badge.unlocked && (
                            <div className="mt-3 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                               <Lock className="w-3 h-3" /> Locked
                            </div>
                         )}
                         {badge.unlocked && (
                            <div className="mt-3 text-[10px] font-bold uppercase tracking-widest opacity-70">
                               {badge.rarity}
                            </div>
                         )}
                      </Card>
                   </div>
                ))}
             </div>
             
             {/* Hidden Achievement Teaser */}
             <div className="mt-8 p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-center">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                   ?
                </div>
                <h4 className="font-bold text-slate-500 dark:text-slate-400">Secret Achievements</h4>
                <p className="text-xs text-slate-400 mt-1">Keep learning to discover 3 hidden milestones.</p>
             </div>
          </div>
       </div>
    </div>
  );
};
