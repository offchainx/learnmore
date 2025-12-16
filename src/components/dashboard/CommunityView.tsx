/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Plus, ImageIcon, Hash, Heart, MessageSquare, Share2, MoreHorizontal, 
  Mic, Flame, Crown 
} from 'lucide-react';

interface CommunityViewProps {
  t: Record<string, unknown>;
}

export const CommunityView: React.FC<CommunityViewProps> = ({ t }) => {
  const [activeTab, setActiveTab] = useState('latest');

  const posts = [
    {
      id: 1,
      author: "Sarah Jenkins",
      avatar: "https://i.pravatar.cc/150?u=Sarah",
      role: "Grade 9",
      time: "2h ago",
      type: "question", // question, note, achievement
      title: "Help with Quadratic Formula derivation?",
      content: "I'm stuck on the step where we complete the square. Can someone explain why we add (b/2a)^2 to both sides? Here is my work so far...",
      tags: ["Math", "Algebra"],
      likes: 24,
      comments: 5,
      solved: false
    },
    {
      id: 2,
      author: "David Chen",
      avatar: "https://i.pravatar.cc/150?u=David",
      role: "Grade 8",
      time: "4h ago",
      type: "note",
      title: "Physics: Newton's Laws Cheat Sheet 📝",
      content: "Compiled a quick summary of all 3 laws with real-life examples. Feel free to save it!",
      tags: ["Physics", "Notes", "ExamPrep"],
      likes: 156,
      comments: 12,
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2670&auto=format&fit=crop",
      solved: null
    },
    {
      id: 3,
      author: "Emily Watson",
      avatar: "https://i.pravatar.cc/150?u=Emily",
      role: "Grade 9",
      time: "5h ago",
      type: "achievement",
      title: "Finally aced the Chemistry Mock! 🎉",
      content: "After 2 weeks of intense study on the periodic table trends, I got 98%! Thanks for the help @MikeT!",
      tags: ["Chemistry", "Celebration"],
      likes: 89,
      comments: 24,
      solved: null
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in-up pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {t.communityTitle} 
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          </h2>
          <p className="text-slate-500">{t.communitySub}</p>
        </div>
        <Button variant="glow" className="shadow-blue-500/20">
          <Plus className="w-4 h-4 mr-2" /> New Post
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Feed */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Create Post Widget */}
          <Card className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50">
            <div className="flex gap-4">
               <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 overflow-hidden shrink-0 relative">
                  <Image src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=2669&auto=format&fit=crop" alt="Me" fill className="object-cover" sizes="40px"/>
               </div>
               <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder={t.createPost} 
                    className="w-full bg-slate-50 dark:bg-slate-700/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder-slate-500 transition-all"
                  />
                  <div className="flex items-center gap-2 mt-3">
                     <Button variant="ghost" size="sm" className="text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 h-8 px-2">
                        <ImageIcon className="w-4 h-4 mr-2 text-green-500" /> Photo
                     </Button>
                     <Button variant="ghost" size="sm" className="text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 h-8 px-2">
                        <Hash className="w-4 h-4 mr-2 text-blue-500" /> Topic
                     </Button>
                  </div>
               </div>
            </div>
          </Card>

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
             {['latest', 'popular', 'unanswered'].map((tab) => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                   activeTab === tab 
                   ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-lg shadow-slate-500/20' 
                   : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/50'
                 }`}
               >
                 {t[`feed${tab.charAt(0).toUpperCase() + tab.slice(1)}`]}
               </button>
             ))}
          </div>

          {/* Posts Feed */}
          <div className="space-y-4">
             {posts.map((post) => (
               <Card key={post.id} className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 hover:border-blue-500/30 transition-all group">
                  {/* Post Header */}
                  <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-blue-500/50 transition-all relative">
                           <Image src={post.avatar} alt={post.author} fill className="object-cover" sizes="40px" />
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <h3 className="font-bold text-slate-900 dark:text-white text-sm">{post.author}</h3>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-300">{post.role}</span>
                           </div>
                           <p className="text-xs text-slate-400">{post.time}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        {post.type === 'question' && <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded-full border border-orange-500/20">{t.postQuestion}</span>}
                        {post.type === 'note' && <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded-full border border-blue-500/20">{t.postNote}</span>}
                        {post.type === 'achievement' && <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full border border-yellow-500/20">{t.postAchievement}</span>}
                        <button className="text-slate-400 hover:text-white"><MoreHorizontal className="w-4 h-4" /></button>
                     </div>
                  </div>

                  {/* Content */}
                  <div className="mb-4">
                     <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">{post.title}</h4>
                     <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{post.content}</p>
                     {post.image && (
                        <div className="mt-3 rounded-xl overflow-hidden h-48 w-full relative">
                           <Image src={post.image} alt="Post content" fill className="object-cover" sizes="(max-width: 768px) 100vw, 500px" />
                        </div>
                     )}
                  </div>

                  {/* Tags */}
                  <div className="flex gap-2 mb-4">
                     {post.tags.map(tag => (
                        <span key={tag} className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-blue-500 cursor-pointer">#{tag}</span>
                     ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-6 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                     <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-500 transition-colors group/like">
                        <Heart className="w-4 h-4 group-hover/like:fill-red-500" /> {post.likes}
                     </button>
                     <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-500 transition-colors">
                        <MessageSquare className="w-4 h-4" /> {post.comments}
                     </button>
                     <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-green-500 transition-colors ml-auto">
                        <Share2 className="w-4 h-4" />
                     </button>
                  </div>
               </Card>
             ))}
          </div>
        </div>

        {/* Right Column: Sidebar Widgets */}
        <div className="lg:col-span-1 space-y-6">
           
           {/* Live Rooms */}
           <Card className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-indigo-500/20 p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-20">
                 <Mic className="w-12 h-12 text-white" />
              </div>
              <div className="relative z-10">
                 <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    {t.liveRooms}
                    <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                 </h3>
                 <div className="space-y-3">
                    {[
                       { name: "Late Night Math", users: 12, topic: "Calculus" },
                       { name: "Lo-Fi Study", users: 34, topic: "General" }
                    ].map((room, i) => (
                       <div key={i} className="bg-black/20 backdrop-blur-md rounded-xl p-3 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group/room">
                          <div className="flex justify-between items-center mb-1">
                             <span className="font-bold text-sm text-white">{room.name}</span>
                             <span className="text-[10px] text-green-400 bg-green-900/30 px-1.5 py-0.5 rounded border border-green-500/30">{room.users} {t.listening}</span>
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-xs text-indigo-200">{room.topic}</span>
                             <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 text-white/50 group-hover/room:text-white group-hover/room:bg-indigo-500">{t.joinRoom}</Button>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </Card>

           {/* Trending Topics */}
           <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-5">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                 <Flame className="w-4 h-4 text-orange-500" /> {t.hotTopics}
              </h3>
              <div className="space-y-3">
                 {[
                    { tag: "MidtermPrep", count: "2.4k" },
                    { tag: "PhysicsLab", count: "1.1k" },
                    { tag: "StudyTips", count: "856" },
                    { tag: "MathChallenge", count: "542" }
                 ].map((topic, i) => (
                    <div key={i} className="flex justify-between items-center group cursor-pointer">
                       <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-blue-500 transition-colors">#{topic.tag}</span>
                       <span className="text-xs text-slate-400">{topic.count} posts</span>
                    </div>
                 ))}
              </div>
           </Card>

           {/* Top Contributors */}
           <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-5">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                 <Crown className="w-4 h-4 text-yellow-500" /> {t.topContributors}
              </h3>
              <div className="space-y-4">
                 {[1, 2, 3].map((rank, i) => (
                    <div key={i} className="flex items-center gap-3">
                       <div className="font-bold text-slate-400 w-4">{rank}</div>
                       <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700/50 relative overflow-hidden">
                          <Image src={`https://i.pravatar.cc/150?img=${i + 10}`} alt="User" fill className="object-cover" sizes="32px"/>
                       </div>
                       <div className="flex-1">
                          <div className="text-sm font-bold text-slate-900 dark:text-white">Student {i+1}</div>
                          <div className="text-[10px] text-slate-500">1,240 Helpful votes</div>
                       </div>
                    </div>
                 ))}
              </div>
           </Card>

        </div>
      </div>
    </div>
  );
};
