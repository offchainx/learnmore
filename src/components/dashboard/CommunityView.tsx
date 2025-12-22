import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Plus, ImageIcon, Hash, Heart, MessageSquare, Share2, MoreHorizontal, 
  Mic, Flame, Crown, CheckCircle2, Sparkles, Bot, Search
} from 'lucide-react';

interface Post {
// ... (omitted for brevity, just replacing the top part)
// Actually I need to match exactly. I'll do two replaces.

  id: number;
  author: string;
  avatar: string;
  role: string;
  time: string;
  type: string;
  title: string;
  content: string;
  tags: string[];
  likes: number;
  comments: number;
  solved: boolean | null;
  aiAnswered?: boolean;
  image?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CommunityView = ({ t }: { t: any }) => {
  const [activeTab, setActiveTab] = useState('latest');
  const [aiLoading, setAiLoading] = useState<number | null>(null); // Track which post is loading AI response
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      author: "Sarah Jenkins",
      avatar: "https://i.pravatar.cc/150?u=Sarah",
      role: "Grade 9",
      time: "2h ago",
      type: "question", 
      title: "Help with Quadratic Formula derivation?",
      content: "I'm stuck on the step where we complete the square. Can someone explain why we add (b/2a)^2 to both sides? Here is my work so far...",
      tags: ["Math", "Algebra"],
      likes: 24,
      comments: 5,
      solved: false,
      aiAnswered: false
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
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop",
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
    },
    {
        id: 4,
        author: "Kevin L.",
        avatar: "https://i.pravatar.cc/150?u=Kevin",
        role: "Grade 10",
        time: "10m ago",
        type: "question",
        title: "Difference between mitosis and meiosis?",
        content: "I keep getting them mixed up. What's the easiest way to remember the key differences?",
        tags: ["Biology", "Cells"],
        likes: 2,
        comments: 0,
        solved: false,
        aiAnswered: false
    }
  ]);

  const handleAskAI = async (postId: number, content: string) => {
    setAiLoading(postId);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are a helpful student tutor. Answer this student's question concisely and encouragingly: "${content}"`,
        });
        
        const aiComment = response.text;
        
        // In a real app, this would add a comment or show a modal. 
        // For this demo, we'll mark it as answered and alert the user.
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, aiAnswered: true, comments: p.comments + 1 } : p));
        alert(`AI Tutor says:\n\n${aiComment}`);
    } catch (error) {
        console.error("AI Error", error);
    } finally {
        setAiLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {t.communityTitle} 
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          </h2>
          <p className="text-slate-500">{t.communitySub}</p>
        </div>
        <div className="flex gap-3">
            <div className="relative hidden md:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search discussions..." className="pl-9 pr-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-64" />
            </div>
            <Button variant="glow" className="shadow-blue-500/20">
            <Plus className="w-4 h-4 mr-2" /> New Post
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Feed (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Create Post Widget */}
          <Card className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50">
            <div className="flex gap-4">
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 p-0.5 shrink-0">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
                    <img src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=2669&auto=format&fit=crop" alt="Me" className="w-full h-full object-cover" />
                  </div>
               </div>
               <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder={t.createPost} 
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder-slate-500 transition-all"
                  />
                  <div className="flex justify-between items-center mt-3">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 h-8 px-2 rounded-lg">
                            <ImageIcon className="w-4 h-4 mr-2 text-green-500" /> Photo
                        </Button>
                        <Button variant="ghost" size="sm" className="text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 h-8 px-2 rounded-lg">
                            <Hash className="w-4 h-4 mr-2 text-blue-500" /> Topic
                        </Button>
                      </div>
                      <div className="text-xs text-slate-400 hidden sm:block">
                          AI Suggestion: <span className="text-blue-400 cursor-pointer hover:underline">#HomeworkHelp</span>
                      </div>
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
                 className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                   activeTab === tab 
                   ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-lg shadow-slate-500/20' 
                   : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/50'
                 }`}
               >
                 {t[`feed${tab.charAt(0).toUpperCase() + tab.slice(1)}`]}
                 {tab === 'unanswered' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
               </button>
             ))}
          </div>

          {/* Posts Feed */}
          <div className="space-y-4">
             {posts.map((post) => (
               <Card 
                key={post.id} 
                className={`p-6 transition-all group hover:shadow-lg ${
                    post.type === 'question' 
                        ? 'bg-blue-50/30 dark:bg-indigo-900/20 border-l-4 border-l-indigo-500 border-y border-r border-slate-200 dark:border-indigo-500/20' 
                    : post.type === 'achievement' 
                        ? 'bg-gradient-to-br from-yellow-500/5 to-transparent border border-yellow-500/30' 
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50'
                }`}
               >
                  {/* Post Header */}
                  <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-blue-500/30 transition-all">
                                <img src={post.avatar} alt={post.author} />
                            </div>
                            {post.type === 'achievement' && <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5"><Crown className="w-3 h-3 text-white" /></div>}
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <h3 className="font-bold text-slate-900 dark:text-white text-sm hover:underline cursor-pointer">{post.author}</h3>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-300">{post.role}</span>
                           </div>
                           <p className="text-xs text-slate-400">{post.time}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        {post.type === 'question' && (
                            <span className={`text-xs font-bold px-2 py-1 rounded-full border flex items-center gap-1 ${post.solved ? 'bg-green-100 text-green-600 border-green-200' : 'bg-orange-100 text-orange-600 border-orange-200'}`}>
                                {post.solved ? <CheckCircle2 className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                                {post.solved ? 'Solved' : 'Question'}
                            </span>
                        )}
                        {post.type === 'achievement' && <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full border border-yellow-500/20">{t.postAchievement}</span>}
                        <button className="text-slate-400 hover:text-white p-1 hover:bg-slate-700 rounded transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                     </div>
                  </div>

                  {/* Content */}
                  <div className="mb-4">
                     <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">{post.title}</h4>
                     <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                     {post.image && (
                        <div className="mt-3 rounded-xl overflow-hidden h-64 w-full relative border border-slate-200 dark:border-slate-700">
                           <img src={post.image} alt="Post content" className="absolute inset-0 w-full h-full object-cover" />
                        </div>
                     )}
                  </div>

                  {/* AI Solution Action for Questions */}
                  {post.type === 'question' && !post.solved && (
                      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-300">
                              <Sparkles className="w-4 h-4" />
                              <span>No answers yet? Ask our AI Tutor for a hint.</span>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 text-xs bg-white dark:bg-slate-800 text-blue-500 hover:text-blue-600 shadow-sm"
                            onClick={() => handleAskAI(post.id, post.content)}
                            disabled={aiLoading === post.id}
                          >
                              {aiLoading === post.id ? 'Thinking...' : 'Ask AI'}
                          </Button>
                      </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                     {post.tags.map(tag => (
                        <span key={tag} className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors">#{tag}</span>
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
                     {/* Ask Assistant Button Integration */}
                     {post.type === 'question' && !post.solved && (
                        <button 
                            className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors px-2 py-1 rounded hover:bg-indigo-500/10"
                            onClick={() => handleAskAI(post.id, post.content)}
                        >
                            <Bot className="w-4 h-4" /> Ask Assistant
                        </button>
                     )}
                     <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-green-500 transition-colors ml-auto">
                        <Share2 className="w-4 h-4" />
                     </button>
                  </div>
               </Card>
             ))}
          </div>
        </div>

        {/* Right Column: Sidebar Widgets (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
           
           {/* Live Rooms (Discord Style with Avatar Pile) */}
           <Card className="bg-[#0f111a] border-slate-800 p-5 relative overflow-hidden">
              <div className="flex justify-between items-center mb-4 relative z-10">
                 <h3 className="font-bold text-white flex items-center gap-2">
                    <Mic className="w-4 h-4 text-green-500" /> {t.liveRooms}
                 </h3>
                 <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full animate-pulse border border-green-500/20">Live</span>
              </div>
              
              <div className="space-y-2 relative z-10">
                 {[
                    { name: "Late Night Math", users: 12, topic: "Calculus", avatars: [1,2,3,4] },
                    { name: "Lo-Fi Study", users: 34, topic: "Focus", avatars: [5,6,7] },
                    { name: "Exam Prep: Physics", users: 8, topic: "Mechanics", avatars: [8,9] }
                 ].map((room, i) => (
                    <div key={i} className="group flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer">
                       <div>
                          <div className="font-bold text-sm text-slate-200 group-hover:text-white mb-1">{room.name}</div>
                          <div className="flex items-center gap-2">
                             {/* Visual Avatar Pile */}
                             <div className="flex -space-x-2 mr-1">
                                {room.avatars.map((a, idx) => (
                                    <img 
                                        key={idx} 
                                        src={`https://i.pravatar.cc/150?img=${a+10}`} 
                                        className="w-5 h-5 rounded-full border border-slate-900 ring-1 ring-slate-800" 
                                        alt="User" 
                                    />
                                ))}
                             </div>
                             <span className="text-[10px] text-slate-500">{room.users} online</span>
                          </div>
                       </div>
                       <Button size="sm" variant="ghost" className="h-7 px-3 text-[10px] bg-slate-800 group-hover:bg-blue-600 group-hover:text-white transition-colors">{t.joinRoom}</Button>
                    </div>
                 ))}
              </div>
           </Card>

           {/* Top Contributors (Updated Metric) */}
           <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-5">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                 <Crown className="w-4 h-4 text-yellow-500" /> {t.topContributors}
              </h3>
              <div className="space-y-4">
                 {[
                    { name: "Michael Z.", solved: 142, rank: 1, badge: "Math Wizard" },
                    { name: "Sarah L.", solved: 98, rank: 2, badge: "Physics Pro" },
                    { name: "Jason K.", solved: 85, rank: 3, badge: "Helper" }
                 ].map((user, i) => (
                    <div key={i} className="flex items-center gap-3">
                       <div className={`w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full ${i===0 ? 'bg-yellow-100 text-yellow-700' : i===1 ? 'bg-slate-200 text-slate-700' : 'bg-orange-100 text-orange-700'}`}>{user.rank}</div>
                       <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700/50 overflow-hidden">
                          <img src={`https://i.pravatar.cc/150?img=${i + 20}`} alt="User" />
                       </div>
                       <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</div>
                            {i===0 && <Sparkles className="w-3 h-3 text-yellow-500" />}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-2">
                              <span className="font-bold text-green-500">{user.solved} Questions Solved</span>
                              <span>• {user.badge}</span>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
              <Button fullWidth variant="ghost" className="mt-4 text-xs h-8 text-slate-500">View Leaderboard</Button>
           </Card>

           {/* Trending Topics */}
           <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-5">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                 <Flame className="w-4 h-4 text-orange-500" /> {t.hotTopics}
              </h3>
              <div className="flex flex-wrap gap-2">
                 {[
                    { tag: "MidtermPrep", count: "2.4k" },
                    { tag: "Calculus", count: "1.1k" },
                    { tag: "StudyTips", count: "856" },
                    { tag: "ScienceFair", count: "542" },
                    { tag: "HomeworkHelp", count: "300" }
                 ].map((topic, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer transition-colors flex items-center gap-1 group">
                       #{topic.tag}
                       <span className="text-[9px] text-slate-400 group-hover:text-slate-300">{topic.count}</span>
                    </span>
                 ))}
              </div>
           </Card>

        </div>
      </div>
    </div>
  );
};
