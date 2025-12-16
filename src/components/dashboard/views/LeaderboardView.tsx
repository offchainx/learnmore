/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client';

import React from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Clock, Activity, Crown, ChevronUp, ChevronDown, Minus } from 'lucide-react';

interface LeaderboardViewProps {
  t: Record<string, unknown>;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ t }) => {
   // Mock Leaderboard Data with Trends
   const leaderboardData = [
     { rank: 1, name: "Sarah J.", xp: 15400, avatar: "https://i.pravatar.cc/150?u=1", trend: "up", change: 2, isMe: false },
     { rank: 2, name: "Mike T.", xp: 14200, avatar: "https://i.pravatar.cc/150?u=2", trend: "same", change: 0, isMe: false },
     { rank: 3, name: "Jessica L.", xp: 13800, avatar: "https://i.pravatar.cc/150?u=3", trend: "down", change: 1, isMe: false },
     { rank: 4, name: "Tom R.", xp: 13200, avatar: "https://i.pravatar.cc/150?u=4", trend: "up", change: 5, isMe: false },
     { rank: 5, name: "Emily W.", xp: 12950, avatar: "https://i.pravatar.cc/150?u=5", trend: "same", change: 0, isMe: false },
     // ... Gap ...
     { rank: 11, name: "Ryan G.", xp: 12550, avatar: "https://i.pravatar.cc/150?u=11", trend: "down", change: 2, isMe: false, isRival: true },
     { rank: 12, name: "Alex Student", xp: 12450, avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=2669&auto=format&fit=crop", trend: "up", change: 3, isMe: true },
     { rank: 13, name: "Daniel K.", xp: 12100, avatar: "https://i.pravatar.cc/150?u=13", trend: "down", change: 1, isMe: false },
   ];

   return (
     <div className="animate-fade-in-up max-w-5xl mx-auto pb-12">
        {/* Header Area */}
        <div className="flex justify-between items-end mb-8">
           <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                 {t.leaderboard}
                 <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs font-bold uppercase tracking-wider border border-yellow-200 dark:border-yellow-700/50">Season 4</span>
              </h2>
              <p className="text-slate-500">Compete for the Diamond League trophy.</p>
           </div>
           <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Ends In</div>
              <div className="flex items-center gap-1 font-mono text-xl font-bold text-slate-900 dark:text-white">
                 <Clock className="w-5 h-5 text-blue-500" /> 02d : 14h : 23m
              </div>
           </div>
        </div>
   
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
           {/* 1. League Status Card */}
           <Card className="lg:col-span-2 bg-gradient-to-br from-indigo-900 to-slate-900 border-none text-white p-8 relative overflow-hidden shadow-2xl">
              <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-8">
                 {/* Badge */}
                 <div className="w-32 h-32 shrink-0 relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse-slow"></div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://cdn-icons-png.flaticon.com/512/6556/6556057.png" alt="Diamond League" className="w-24 h-24 relative z-10 drop-shadow-2xl" style={{filter: 'drop-shadow(0 0 10px rgba(59,130,246,0.5))'}} />
                 </div>
                 
                 <div className="flex-1 w-full text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-2">
                       <h3 className="text-2xl font-bold tracking-tight">Diamond League</h3>
                       <span className="text-indigo-300 font-mono text-sm">Top 5%</span>
                    </div>
                    <p className="text-indigo-200 text-sm mb-6">You are ranked <strong className="text-white">#12</strong>. Keep pushing to reach the top 10!</p>
                    
                    {/* Progress Bar to next rank */}
                    <div className="space-y-2">
                       <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-indigo-300">
                          <span>Current XP</span>
                          <span>Next Rank (+550 XP)</span>
                       </div>
                       <div className="h-3 w-full bg-black/30 rounded-full overflow-hidden border border-white/5">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 w-[75%] relative">
                             <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/50 animate-pulse"></div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </Card>
   
           {/* 2. Activity Comparison Chart (Simple CSS Bar Chart) */}
           <Card className="lg:col-span-1 p-6 flex flex-col justify-between bg-white dark:bg-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                 <Activity className="w-5 h-5 text-green-500" /> Weekly Activity
              </h3>
              <div className="flex items-end justify-between h-32 gap-2">
                 {['M','T','W','T','F','S','S'].map((day, i) => {
                    const myHeight = [40, 60, 30, 80, 50, 20, 90][i];
                    const avgHeight = [30, 40, 40, 50, 40, 30, 50][i];
                    return (
                       <div key={day} className="flex flex-col items-center gap-1 flex-1">
                          <div className="w-full flex items-end justify-center gap-[2px] h-full">
                             {/* Avg Bar */}
                             <div style={{height: `${avgHeight}%`}} className="w-1.5 bg-slate-200 dark:bg-slate-700 rounded-t-sm"></div>
                             {/* My Bar */}
                             <div style={{height: `${myHeight}%`}} className={`w-1.5 rounded-t-sm ${i === 6 ? 'bg-blue-500' : 'bg-blue-300 dark:bg-blue-800'}`}></div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">{day}</span>
                       </div>
                    )
                 })}
              </div>
              <div className="flex items-center gap-4 justify-center mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                 <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> You</div>
                 <div className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-300 dark:bg-slate-700 rounded-full"></div> Avg</div>
              </div>
           </Card>
        </div>
   
        {/* The Podium Section */}
        <div className="mb-12 flex justify-center items-end gap-4 sm:gap-8 px-4">
           {/* Rank 2 */}
           <div className="flex flex-col items-center animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="mb-2 flex flex-col items-center">
                 <Image src={leaderboardData[1].avatar} width={64} height={64} className="rounded-full border-4 border-slate-300 shadow-xl" alt="Rank 2" />
                 <span className="font-bold mt-2 text-slate-900 dark:text-white text-sm">{leaderboardData[1].name}</span>
                 <span className="text-xs text-slate-500">{leaderboardData[1].xp} XP</span>
              </div>
              <div className="w-20 sm:w-24 h-24 bg-gradient-to-b from-slate-300 to-slate-400 rounded-t-lg flex items-center justify-center text-4xl font-bold text-white shadow-lg relative">
                 2
              </div>
           </div>
   
           {/* Rank 1 */}
           <div className="flex flex-col items-center z-10 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <div className="mb-2 flex flex-col items-center relative">
                 <Crown className="w-8 h-8 text-yellow-400 absolute -top-10 animate-bounce" style={{filter: 'drop-shadow(0 0 5px rgba(234,179,8,0.8))'}} />
                 <Image src={leaderboardData[0].avatar} width={80} height={80} className="rounded-full border-4 border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.4)]" alt="Rank 1" />
                 <span className="font-bold mt-2 text-slate-900 dark:text-white text-base">{leaderboardData[0].name}</span>
                 <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">{leaderboardData[0].xp} XP</span>
              </div>
              <div className="w-24 sm:w-32 h-32 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-t-lg flex items-center justify-center text-5xl font-bold text-white shadow-xl relative overflow-hidden">
                 <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                 1
              </div>
           </div>
   
           {/* Rank 3 */}
           <div className="flex flex-col items-center animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <div className="mb-2 flex flex-col items-center">
                 <Image src={leaderboardData[2].avatar} width={64} height={64} className="rounded-full border-4 border-orange-300 shadow-xl" alt="Rank 3" />
                 <span className="font-bold mt-2 text-slate-900 dark:text-white text-sm">{leaderboardData[2].name}</span>
                 <span className="text-xs text-slate-500">{leaderboardData[2].xp} XP</span>
              </div>
              <div className="w-20 sm:w-24 h-20 bg-gradient-to-b from-orange-300 to-orange-400 rounded-t-lg flex items-center justify-center text-4xl font-bold text-white shadow-lg relative">
                 3
              </div>
           </div>
        </div>
   
        {/* Leaderboard List */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-xl overflow-hidden animate-fade-in-up" style={{animationDelay: '0.4s'}}>
           <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex gap-4">
                 <button className="text-sm font-bold text-slate-900 dark:text-white border-b-2 border-blue-500 pb-4 -mb-4.5">Global</button>
                 <button className="text-sm font-medium text-slate-500 pb-4">Friends</button>
              </div>
           </div>
   
           <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {leaderboardData.slice(3).map((user, i) => (
                 <div key={i} className={`flex items-center px-4 sm:px-6 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30 ${user.isMe ? 'bg-blue-50/80 dark:bg-blue-900/10 border-l-4 border-blue-500' : ''}`}>
                    <div className="w-8 flex flex-col items-center justify-center gap-1 mr-4">
                       <span className={`font-bold text-lg ${user.isMe ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>{user.rank}</span>
                       <div className={`flex items-center text-[10px] font-bold ${
                          user.trend === 'up' ? 'text-green-500' : user.trend === 'down' ? 'text-red-500' : 'text-slate-300'
                       }`}>
                          {user.trend === 'up' && <ChevronUp className="w-3 h-3" />}
                          {user.trend === 'down' && <ChevronDown className="w-3 h-3" />}
                          {user.change > 0 && user.change}
                          {user.trend === 'same' && <Minus className="w-3 h-3" />}
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-4 flex-1">
                       <div className="relative">
                          <Image src={user.avatar} width={40} height={40} className="rounded-full object-cover border border-slate-200 dark:border-slate-700" alt={user.name} />
                          {user.isRival && (
                             <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-bounce shadow-sm">
                                RIVAL
                             </div>
                          )}
                       </div>
                       <div className="flex flex-col">
                          <span className={`font-bold text-sm ${user.isMe ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                             {user.name} {user.isMe && '(You)'}
                          </span>
                          {user.isRival && <span className="text-[10px] text-red-400 font-bold">Only 100 XP ahead!</span>}
                       </div>
                    </div>
   
                    <div className="text-right">
                       <div className="font-bold text-slate-700 dark:text-slate-200 tabular-nums">{user.xp.toLocaleString()} <span className="text-xs text-slate-400">XP</span></div>
                    </div>
                 </div>
              ))}
           </div>
           
           {/* Bottom sticky current user if not in view (simulated for now by showing the list cuts off) */}
           <div className="bg-slate-50 dark:bg-slate-900 p-3 text-center text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800">
              Top 10 players get promoted to Master League next week.
           </div>
        </div>
     </div>
   );
};