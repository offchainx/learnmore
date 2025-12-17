
import React, { useState } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { 
  Trophy, Flame, Clock, Shield, Zap, Target, MessageCircle, 
  ChevronUp, ChevronDown, Minus, Crown, Sword, ArrowUpRight, 
  AlertTriangle, CheckCircle2, TrendingUp, Search, Filter,
  ChevronsUp
} from 'lucide-react';

export const LeaderboardView = ({ t }: { t: any }) => {
  const [activeTab, setActiveTab] = useState<'global' | 'friends'>('global');

  // --- Mock Data: Context & Season ---
  const currentTierIndex = 2; // Gold
  const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Challenger'];
  
  const seasonData = {
    name: "Season 4: Sniper Elite",
    theme: "Precision Matters",
    bonus: "2x XP for Error Book Kills",
    endsIn: "05d 12h 30m",
    color: "from-red-500/20 to-orange-500/20",
    border: "border-red-500/30",
    icon: Target
  };

  // --- Mock Data: Users ---
  const topThree = [
     { rank: 1, name: "Sarah J.", xp: 15400, avatar: "https://i.pravatar.cc/150?u=1", trend: "up", change: 2, badge: "Grandmaster" },
     { rank: 2, name: "Mike T.", xp: 14200, avatar: "https://i.pravatar.cc/150?u=2", trend: "same", change: 0, badge: "Elite" },
     { rank: 3, name: "Jessica L.", xp: 13800, avatar: "https://i.pravatar.cc/150?u=3", trend: "down", change: 1, badge: "Elite" },
  ];

  const listData = [
     { rank: 4, name: "Tom R.", xp: 13200, avatar: "https://i.pravatar.cc/150?u=4", trend: "up", status: 'promotion' },
     { rank: 5, name: "Emily W.", xp: 12950, avatar: "https://i.pravatar.cc/150?u=5", trend: "same", status: 'promotion' },
     { rank: 6, name: "David K.", xp: 12800, avatar: "https://i.pravatar.cc/150?u=6", trend: "down", status: 'safe' },
     { rank: 7, name: "Sophie M.", xp: 12750, avatar: "https://i.pravatar.cc/150?u=7", trend: "up", status: 'safe' },
     { rank: 8, name: "Chris P.", xp: 12600, avatar: "https://i.pravatar.cc/150?u=8", trend: "same", status: 'safe' },
     { rank: 9, name: "Anna B.", xp: 12550, avatar: "https://i.pravatar.cc/150?u=9", trend: "down", status: 'safe' },
     { rank: 10, name: "Ryan G.", xp: 12500, avatar: "https://i.pravatar.cc/150?u=11", trend: "up", status: 'safe', isRival: true },
     { rank: 11, name: "Kevin L.", xp: 12480, avatar: "https://i.pravatar.cc/150?u=12", trend: "down", status: 'safe' },
     { rank: 12, name: "Alex Student", xp: 12450, avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=200&auto=format&fit=crop", trend: "up", status: 'safe', isMe: true },
     { rank: 13, name: "Brian C.", xp: 12100, avatar: "https://i.pravatar.cc/150?u=13", trend: "same", status: 'demotion' },
     { rank: 14, name: "Laura D.", xp: 11900, avatar: "https://i.pravatar.cc/150?u=14", trend: "down", status: 'demotion' },
     { rank: 15, name: "Sam K.", xp: 11800, avatar: "https://i.pravatar.cc/150?u=15", trend: "down", status: 'demotion' },
     { rank: 16, name: "Nina P.", xp: 11500, avatar: "https://i.pravatar.cc/150?u=16", trend: "up", status: 'demotion' },
     { rank: 17, name: "Oscar Z.", xp: 11200, avatar: "https://i.pravatar.cc/150?u=17", trend: "down", status: 'demotion' },
  ];

  const currentUser = listData.find(u => u.isMe);

  // --- Mock Data: HUD Widgets ---
  const quests = [
    { title: "Kill 3 Errors", xp: 120, progress: 1, total: 3, icon: Zap, color: "text-orange-400 bg-orange-400/10" },
    { title: "Upvote 3 Helpful Posts", xp: 30, progress: 0, total: 3, icon: MessageCircle, color: "text-blue-400 bg-blue-400/10" },
    { title: "Complete 1 Quiz", xp: 150, progress: 0, total: 1, icon: Target, color: "text-purple-400 bg-purple-400/10" },
  ];

  return (
    <div className="animate-fade-in-up pb-12 relative max-w-7xl mx-auto">
       
       {/* 1. Header: The Journey & Context */}
       <div className="mb-8 space-y-6">
          {/* Tier Roadmap */}
          <div className="w-full bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 p-6 relative overflow-hidden">
             <div className="flex justify-between items-center relative z-10">
                {tiers.map((tier, i) => {
                   const isActive = i === currentTierIndex;
                   const isPast = i < currentTierIndex;
                   return (
                      <div key={tier} className="flex flex-col items-center gap-2 flex-1 relative group">
                         {/* Connecting Line */}
                         {i !== tiers.length - 1 && (
                            <div className={`absolute top-4 left-1/2 w-full h-1 -z-10 ${i < currentTierIndex ? 'bg-blue-600' : 'bg-slate-800'}`}></div>
                         )}
                         
                         {/* Node */}
                         <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-xs transition-all duration-300
                            ${isActive 
                               ? 'bg-blue-600 border-blue-400 text-white scale-125 shadow-[0_0_15px_rgba(37,99,235,0.5)]' 
                               : isPast 
                                  ? 'bg-slate-800 border-blue-600 text-blue-500' 
                                  : 'bg-slate-900 border-slate-700 text-slate-600'}
                         `}>
                            {isPast ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                         </div>
                         
                         <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-white' : 'text-slate-500'}`}>
                            {tier}
                         </span>
                      </div>
                   );
                })}
             </div>
             
             {/* Progress Info */}
             <div className="mt-6 flex justify-center">
                <div className="bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700 text-xs font-medium text-slate-300 flex items-center gap-2">
                   <span>Current Standing: <span className="text-white font-bold">Top 12%</span></span>
                   <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                   <span className="text-blue-400 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> 150 XP to Promotion</span>
                </div>
             </div>
          </div>

          {/* Season Banner */}
          <div className={`w-full rounded-2xl border p-1 bg-gradient-to-r ${seasonData.color} ${seasonData.border}`}>
             <div className="bg-slate-900/90 backdrop-blur rounded-xl p-4 px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                      <seasonData.icon className="w-6 h-6 text-white" />
                   </div>
                   <div>
                      <div className="flex items-center gap-2">
                         <h3 className="text-lg font-bold text-white">{seasonData.name}</h3>
                         <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded animate-pulse">LIVE</span>
                      </div>
                      <p className="text-sm text-orange-200 font-medium">{seasonData.bonus}</p>
                   </div>
                </div>
                
                <div className="flex items-center gap-4 bg-black/20 rounded-lg px-4 py-2 border border-white/5">
                   <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Season Ends In</div>
                      <div className="font-mono text-xl font-bold text-white tabular-nums">{seasonData.endsIn}</div>
                   </div>
                   <Clock className="w-5 h-5 text-slate-500" />
                </div>
             </div>
          </div>
       </div>

       {/* 2. Main Content Area */}
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: The Arena (Leaderboard) - 8 cols (approx 70%) */}
          <div className="lg:col-span-8 space-y-4">
             
             {/* Podium - Visual Update: Added Grounding Base and Ambient Glow */}
             <div className="relative pt-8 pb-4">
                 {/* Grounding Glow Effect */}
                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none"></div>
                 
                 <div className="flex justify-center items-end gap-4 min-h-[220px] px-4 relative z-10">
                     {/* Silver */}
                     <div className="flex flex-col items-center group relative z-10 w-1/3 max-w-[130px]">
                        <img src={topThree[1].avatar} className="w-16 h-16 rounded-full border-4 border-slate-300 shadow-lg mb-3 object-cover" alt="Rank 2" />
                        <div className="w-full h-24 bg-gradient-to-b from-slate-700 to-slate-800 rounded-t-lg border-t border-slate-500/50 flex flex-col items-center pt-2 relative shadow-lg">
                           <div className="text-3xl font-black text-white/20">2</div>
                           <div className="absolute bottom-3 text-xs font-bold text-slate-300">{topThree[1].name}</div>
                        </div>
                     </div>
                     {/* Gold */}
                     <div className="flex flex-col items-center group relative z-20 w-1/3 max-w-[150px]">
                        <Crown className="w-8 h-8 text-yellow-400 absolute -top-10 animate-bounce" />
                        <img src={topThree[0].avatar} className="w-20 h-20 rounded-full border-4 border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.4)] mb-4 object-cover" alt="Rank 1" />
                        <div className="w-full h-32 bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-t-lg border-t border-yellow-400/50 flex flex-col items-center pt-2 relative overflow-hidden shadow-xl shadow-yellow-900/20">
                           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                           {/* Promotion Hint */}
                           <div className="absolute top-0 w-full h-1 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
                           <div className="text-4xl font-black text-white/30 relative z-10">1</div>
                           <div className="absolute bottom-4 text-sm font-bold text-yellow-100 relative z-10">{topThree[0].name}</div>
                        </div>
                     </div>
                     {/* Bronze */}
                     <div className="flex flex-col items-center group relative z-10 w-1/3 max-w-[130px]">
                        <img src={topThree[2].avatar} className="w-16 h-16 rounded-full border-4 border-orange-700 shadow-lg mb-3 object-cover" alt="Rank 3" />
                        <div className="w-full h-20 bg-gradient-to-b from-orange-800 to-orange-900 rounded-t-lg border-t border-orange-600/50 flex flex-col items-center pt-2 relative shadow-lg">
                           <div className="text-3xl font-black text-white/20">3</div>
                           <div className="absolute bottom-3 text-xs font-bold text-orange-200">{topThree[2].name}</div>
                        </div>
                     </div>
                 </div>
             </div>

             {/* Controls */}
             <div className="flex justify-between items-center mb-2">
                 <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button className="px-4 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-bold shadow-sm">Global</button>
                    <button className="px-4 py-1.5 rounded-lg text-slate-500 hover:text-white text-xs font-bold transition-colors">Friends</button>
                 </div>
                 <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white"><Filter className="w-4 h-4 mr-2" /> Filters</Button>
             </div>

             {/* The List Container - Height Increased */}
             <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-800 bg-slate-950/50 text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
                   <div className="col-span-2 text-center">Rank</div>
                   <div className="col-span-7">Student</div>
                   <div className="col-span-3 text-right">XP</div>
                </div>

                {/* Rows - Increased height to 600px */}
                <div className="h-[600px] overflow-y-auto">
                   {listData.map((user, i) => {
                      const isPromotion = user.status === 'promotion';
                      const isDemotion = user.status === 'demotion';
                      
                      return (
                         <div 
                           key={i} 
                           className={`
                              grid grid-cols-12 gap-4 p-4 items-center transition-all duration-200 border-b border-slate-800/50 last:border-0 relative
                              ${user.isMe ? 'bg-blue-500/10 hover:bg-blue-500/20' : 'hover:bg-slate-800/50'}
                              ${isPromotion ? 'bg-emerald-500/5' : ''}
                              ${isDemotion ? 'bg-red-500/5' : ''}
                           `}
                         >  
                            {/* Zone Indicators */}
                            {isPromotion && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>}
                            {isDemotion && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>}

                            <div className="col-span-2 flex flex-col items-center justify-center">
                               <span className={`font-bold text-base ${user.isMe ? 'text-blue-400' : 'text-slate-300'}`}>{user.rank}</span>
                               <div className={`text-[10px] font-bold flex items-center ${user.trend === 'up' ? 'text-emerald-500' : user.trend === 'down' ? 'text-red-500' : 'text-slate-600'}`}>
                                  {user.trend === 'up' && <ChevronUp className="w-3 h-3" />}
                                  {user.trend === 'down' && <ChevronDown className="w-3 h-3" />}
                                  {user.trend === 'same' && <Minus className="w-3 h-3" />}
                               </div>
                            </div>

                            <div className="col-span-7 flex items-center gap-3">
                               <img src={user.avatar} className={`w-9 h-9 rounded-full object-cover border ${user.isMe ? 'border-blue-500' : 'border-slate-700'}`} alt={user.name} />
                               <div className="min-w-0">
                                  <div className={`font-bold text-sm truncate flex items-center gap-2 ${user.isMe ? 'text-white' : 'text-slate-300'}`}>
                                     {user.name} 
                                     {user.isMe && <span className="bg-blue-600 text-[9px] px-1.5 rounded text-white font-normal">YOU</span>}
                                     {user.isRival && <span className="bg-red-900/50 text-red-400 text-[9px] px-1.5 rounded border border-red-800 font-normal flex items-center gap-1"><Sword className="w-2 h-2" /> RIVAL</span>}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                     {isPromotion && <span className="text-emerald-500 flex items-center gap-0.5"><ChevronsUp className="w-3 h-3" /> Promotion Zone</span>}
                                     {isDemotion && <span className="text-red-500 flex items-center gap-0.5"><AlertTriangle className="w-3 h-3" /> Demotion Risk</span>}
                                     {!isPromotion && !isDemotion && <span>Safe Zone</span>}
                                  </div>
                               </div>
                            </div>

                            <div className="col-span-3 text-right font-mono font-bold text-slate-300">
                               {user.xp.toLocaleString()}
                            </div>
                         </div>
                      );
                   })}
                </div>

                {/* Sticky User Footer */}
                {currentUser && (
                   <div className="sticky bottom-0 bg-slate-900 border-t-2 border-blue-500 p-3 shadow-2xl z-20">
                      <div className="grid grid-cols-12 gap-4 items-center">
                         <div className="col-span-2 text-center font-bold text-white text-lg">{currentUser.rank}</div>
                         <div className="col-span-7 flex items-center gap-3">
                            <img src={currentUser.avatar} className="w-10 h-10 rounded-full border-2 border-blue-400" alt="Me" />
                            <div>
                               <div className="font-bold text-white text-sm">You</div>
                               <div className="text-xs text-blue-400 font-medium">550 XP to Rank {currentUser.rank - 1}</div>
                            </div>
                         </div>
                         <div className="col-span-3 text-right font-bold text-white text-lg font-mono">
                            {currentUser.xp.toLocaleString()}
                         </div>
                      </div>
                   </div>
                )}
             </div>
          </div>

          {/* Right Column: The HUD - 4 cols (approx 30%) */}
          <div className="lg:col-span-4 space-y-6">
             
             {/* Widget 1: My Performance (Donut) */}
             <Card className="p-6 bg-slate-900 border-slate-800">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                   <TrendingUp className="w-5 h-5 text-blue-500" /> XP Breakdown
                </h3>
                <div className="flex items-center gap-4">
                   <div className="relative w-24 h-24 shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                         <circle cx="48" cy="48" r="40" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                         <circle cx="48" cy="48" r="40" stroke="#3b82f6" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset="75" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className="text-xl font-bold text-white">70%</span>
                      </div>
                   </div>
                   <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-300">
                         <div className="w-3 h-3 rounded-full bg-blue-500"></div> Study
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                         <div className="w-3 h-3 rounded-full bg-slate-700"></div> Community
                      </div>
                   </div>
                </div>
             </Card>

             {/* Widget 2: Daily Quests (Action Trigger) */}
             <Card className="p-6 bg-slate-900 border-slate-800">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-white flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-500" /> Daily Quests
                   </h3>
                   <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded">Resets in 4h</span>
                </div>
                
                <div className="space-y-4">
                   {quests.map((q, i) => (
                      <div key={i} className="group">
                         <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                               <div className={`p-2 rounded-lg ${q.color}`}>
                                  <q.icon className="w-4 h-4" />
                               </div>
                               <div>
                                  <div className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{q.title}</div>
                                  <div className="text-xs text-slate-500 font-mono">+{q.xp} XP</div>
                               </div>
                            </div>
                            <Button size="sm" variant="outline" className="h-7 text-xs border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800">
                               {q.progress >= q.total ? 'Claim' : 'Go'}
                            </Button>
                         </div>
                         {/* Progress Bar */}
                         <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${q.progress >= q.total ? 'bg-green-500' : 'bg-blue-500'}`} 
                              style={{width: `${(q.progress/q.total)*100}%`}}
                            ></div>
                         </div>
                         <div className="text-[10px] text-right text-slate-500 mt-1">{q.progress}/{q.total}</div>
                      </div>
                   ))}
                </div>
             </Card>

             {/* Widget 3: Rival Watch */}
             <Card className="p-0 overflow-hidden bg-slate-900 border-slate-800 relative group cursor-pointer hover:border-red-500/50 transition-colors">
                <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors"></div>
                <div className="p-5 relative z-10">
                   <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-white text-sm flex items-center gap-2">
                         <Sword className="w-4 h-4 text-red-500" /> Rival Watch
                      </h3>
                      <span className="text-[10px] font-bold text-red-400 animate-pulse">CATCH UP!</span>
                   </div>
                   
                   <div className="flex items-center gap-4">
                      <div className="relative">
                         <img src="https://i.pravatar.cc/150?u=11" className="w-12 h-12 rounded-full border-2 border-red-500/50" alt="Rival" />
                         <div className="absolute -bottom-1 -right-1 bg-red-600 text-[10px] text-white px-1.5 rounded border border-red-400">#10</div>
                      </div>
                      <div>
                         <div className="text-sm font-bold text-slate-200">Ryan G.</div>
                         <div className="text-xs text-slate-400">is only <span className="text-white font-bold">50 XP</span> ahead.</div>
                         <div className="text-xs text-blue-400 mt-1 hover:underline">View Profile &gt;</div>
                      </div>
                   </div>
                </div>
             </Card>

          </div>
       </div>
    </div>
  );
};
