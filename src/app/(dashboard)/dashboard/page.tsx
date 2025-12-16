'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  LayoutDashboard, 
  PenTool, 
  MessageCircle, 
  Settings, 
  LogOut, 
  Menu, 
  Bell, 
  Search,
  Zap,
  Trophy,
  Sun,
  Moon,
  ChevronRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

// Import Components
import { SidebarItem } from '@/components/dashboard/SidebarItem';
import { DashboardHome } from '@/components/dashboard/DashboardHome';
import { CommunityView } from '@/components/dashboard/CommunityView';
import { MyCoursesView } from '@/components/dashboard/views/MyCoursesView';
import { QuestionBankView } from '@/components/dashboard/views/QuestionBankView';
import { LeaderboardView } from '@/components/dashboard/views/LeaderboardView';
import { SettingsView } from '@/components/dashboard/views/SettingsView';
import { AchievementsView } from '@/components/dashboard/views/AchievementsView';

// --- Types & Translations ---

type Lang = 'en' | 'zh';
type View = 'dashboard' | 'courses' | 'questionBank' | 'leaderboard' | 'community' | 'settings' | 'achievements';

const translations = {
  en: {
    dashboard: 'Dashboard',
    courses: 'Lessons', 
    questionBank: 'Practice', 
    leaderboard: 'Leaderboard',
    community: 'Community',
    settings: 'Settings',
    logout: 'Log Out',
    welcome: 'Welcome back, Alex! 👋',
    welcomeSub: 'You have 4 tasks due this week. Keep up the momentum!',
    search: 'Search...',
    streak: '12 Day Streak',
    studyTime: 'Study Time',
    questions: 'Questions',
    accuracy: 'Accuracy',
    mistakes: 'Mistakes',
    statsTitle: 'Learning Performance',
    statsSub: 'Overview of your practice and exam performance',
    percentile: 'Percentile Rank',
    practiceAvg: 'Practice Avg',
    mockAvg: 'Mock Exam Avg',
    mySubjects: 'My Subjects',
    viewAll: 'View All',
    continueLearning: 'Continue Learning',
    dailyQuests: 'Daily Quests',
    subjectAnalysis: 'Subject Strength Analysis',
    subjectAnalysisSub: 'Targeted improvement for weak areas',
    math: 'Math',
    physics: 'Physics',
    chemistry: 'Chemistry',
    biology: 'Biology',
    english: 'English',
    chinese: 'Chinese',
    geography: 'Geography', 
    history: 'History', 
    science: 'Science', 
    startLesson: 'Start Lesson',
    dailyInspiration: 'Daily Inspiration',
    generating: 'Painting your daily vibe...',
    regenerate: 'New Vibe',
    mistakeBook: 'Mistake Book',
    practiceMode: 'Practice Mode',
    allQuestions: 'All Questions',
    filters: 'Filters',
    level: 'Level',
    xp: 'XP',
    achievements: 'Achievements',
    badges: 'Badges',
    editProfile: 'Edit Profile',
    notifications: 'Notifications',
    general: 'General',
    security: 'Security',
    rank: 'Rank',
    student: 'Student',
    points: 'Points',
    weekly: 'Weekly',
    allTime: 'All Time',
    courseProgress: 'Course Progress',
    recentActivity: 'Recent Activity',
    solved: 'Solved',
    wrong: 'Wrong',
    reviewNow: 'Review Now',
    advanced: 'Advanced',
    proficient: 'Proficient',
    intermediate: 'Intermediate',
    basic: 'Basic',
    suggestion: 'Needs Practice',
    minLeft: 'min left',
    // Community Translations
    communityTitle: 'Student Hub',
    communitySub: 'Connect, share, and learn together',
    createPost: 'Share your thoughts or ask a question...',
    liveRooms: 'Live Study Rooms',
    hotTopics: 'Trending Topics',
    topContributors: 'Top Contributors',
    feedLatest: 'Latest',
    feedPopular: 'Popular',
    feedUnanswered: 'Unanswered',
    joinRoom: 'Join Room',
    listening: 'Listening',
    postQuestion: 'Question',
    postNote: 'Note',
    postAchievement: 'Achievement',
    // Lessons View Tabs
    toc: 'Table of Contents',
    confidence: 'Confidence',
    notes: 'Notes',
    bookmarks: 'Bookmarks',
    highlights: 'Highlights',
    confidenceHigh: 'High Confidence',
    confidenceMed: 'Medium',
    confidenceLow: 'Needs Review',
    confidenceDesc: 'Focus on topics with low confidence levels first.',
  },
  zh: {
    dashboard: '仪表盘',
    courses: '课程学习', 
    questionBank: '练习', 
    leaderboard: '排行榜',
    community: '社区',
    settings: '设置',
    logout: '退出登录',
    welcome: '欢迎回来，Alex！👋',
    welcomeSub: '本周有4个待办任务，保持好状态！',
    search: '搜索...',
    streak: '12天 连胜',
    studyTime: '学习时长',
    questions: '刷题数',
    accuracy: '正确率',
    mistakes: '错题数',
    statsTitle: '学习成绩统计',
    statsSub: '查看你在练习和考试中的表现',
    percentile: '百分位排名',
    practiceAvg: '练习平均分',
    mockAvg: '模拟考试平均分',
    mySubjects: '我的学科',
    viewAll: '查看全部',
    continueLearning: '继续学习',
    dailyQuests: '每日任务',
    subjectAnalysis: '科目强弱分析',
    subjectAnalysisSub: '针对性提升薄弱环节',
    math: '数学',
    physics: '物理',
    chemistry: '化学',
    biology: '生物',
    english: '英文',
    chinese: '中文/国文', 
    geography: '地理', 
    history: '历史', 
    science: '科学', 
    startLesson: '开始学习',
    dailyInspiration: '每日灵感',
    generating: '正在生成今日氛围...',
    regenerate: '刷新灵感',
    mistakeBook: '错题本',
    practiceMode: '练习模式',
    allQuestions: '全部题目',
    filters: '筛选',
    level: '等级',
    xp: '经验值',
    achievements: '成就系统',
    badges: '徽章',
    editProfile: '编辑资料',
    notifications: '通知设置',
    general: '通用',
    security: '安全',
    rank: '排名',
    student: '学员',
    points: '积分',
    weekly: '本周',
    allTime: '历史',
    courseProgress: '课程进度',
    recentActivity: '最近活动',
    solved: '已解决',
    wrong: '错题',
    reviewNow: '立即复习',
    advanced: '高级',
    proficient: '熟练',
    intermediate: '中级',
    basic: '基础',
    suggestion: '建议加强练习',
    minLeft: '分钟剩余',
    // Community Translations
    communityTitle: '学员社区',
    communitySub: '连接、分享、共同进步',
    createPost: '分享你的想法或提出问题...',
    liveRooms: '实时自习室',
    hotTopics: '热门话题',
    topContributors: '活跃贡献者',
    feedLatest: '最新',
    feedPopular: '热门',
    feedUnanswered: '待解答',
    joinRoom: '加入房间',
    listening: '人在听',
    postQuestion: '提问',
    postNote: '笔记',
    postAchievement: '成就',
    // Lessons View Tabs
    toc: '课程目录',
    confidence: '置信度',
    notes: '我的笔记',
    bookmarks: '书签',
    highlights: '高亮重点',
    confidenceHigh: '完全掌握',
    confidenceMed: '基本理解',
    confidenceLow: '急需复习',
    confidenceDesc: '建议优先复习置信度较低的知识点。',
  }
};

export default function DashboardPage() {
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [lang, setLang] = useState<Lang>('en');
  const [currentView, setCurrentView] = useState<View>('dashboard');
  
  const t = translations[lang];

  useEffect(() => {
    // Check system preference or localStorage in a way that avoids hydration mismatch and sync state warnings
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const isDarkMode = document.documentElement.classList.contains('dark');
        setIsDark(isDarkMode);
      }, 0);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  const toggleLang = () => setLang(prev => prev === 'en' ? 'zh' : 'en');
  
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const renderContent = () => {
    switch(currentView) {
      case 'dashboard': return <DashboardHome t={t} lang={lang} />;
      case 'courses': return <MyCoursesView t={t} />;
      case 'questionBank': return <QuestionBankView t={t} />;
      case 'leaderboard': return <LeaderboardView t={t} />;
      case 'community': return <CommunityView t={t} />;
      case 'settings': return <SettingsView t={t} />;
      case 'achievements': return <AchievementsView t={t} />;
      default: return <DashboardHome t={t} lang={lang} />;
    }
  };

  return (
    // Outer container: Full height, hidden overflow to manage scroll via flex children
    <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex text-slate-900 dark:text-white font-sans transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - FIXED Left Panel */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-out lg:relative lg:translate-x-0 lg:block flex flex-col shadow-xl lg:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center h-20 px-6 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
             <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <BookOpen className="h-4 w-4 text-white" />
             </div>
             <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">LearnMore</span>
          </div>
        </div>
        
        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <SidebarItem icon={LayoutDashboard} label={t.dashboard} active={currentView === 'dashboard'} onClick={() => { setCurrentView('dashboard'); setSidebarOpen(false); }} />
          <SidebarItem icon={BookOpen} label={t.courses} active={currentView === 'courses'} onClick={() => { setCurrentView('courses'); setSidebarOpen(false); }} />
          <SidebarItem icon={PenTool} label={t.questionBank} active={currentView === 'questionBank'} onClick={() => { setCurrentView('questionBank'); setSidebarOpen(false); }} />
          <SidebarItem icon={Trophy} label={t.leaderboard} active={currentView === 'leaderboard'} onClick={() => { setCurrentView('leaderboard'); setSidebarOpen(false); }} />
          <SidebarItem icon={MessageCircle} label={t.community} active={currentView === 'community'} onClick={() => { setCurrentView('community'); setSidebarOpen(false); }} />
        </div>

        {/* Pinned Bottom Section - XP Card, Settings, Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex-shrink-0">
           <div onClick={() => { setCurrentView('achievements'); setSidebarOpen(false); }} className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 relative overflow-hidden group cursor-pointer hover:border-blue-500/50 transition-all shadow-lg">
             <div className="relative z-10">
               <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-sm text-white">{t.level} 12</h4>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
               </div>
               <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                 <span>1,250 XP</span>
                 <span>/ 2,000</span>
               </div>
               <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                 <div className="bg-blue-500 h-1.5 rounded-full w-[65%] shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
               </div>
             </div>
           </div>

           {/* Separator */}
           <div className="h-px bg-slate-200 dark:bg-slate-800 mb-4 mx-2"></div>

           <div className="space-y-1">
              <SidebarItem icon={Settings} label={t.settings} active={currentView === 'settings'} onClick={() => { setCurrentView('settings'); setSidebarOpen(false); }} />
              <SidebarItem icon={LogOut} label={t.logout} onClick={handleLogout} />
           </div>
        </div>
      </aside>

      {/* Main Content Area - Scrollable with Snap */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 flex items-center justify-between px-4 sm:px-8 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300 flex-shrink-0">
          <div className="flex items-center flex-1 max-w-2xl">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 mr-4">
              <Menu className="h-6 w-6" />
            </button>
            <div className="relative w-full max-w-md hidden md:block group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input type="text" className="block w-full pl-10 sm:text-sm bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-xl py-2.5 text-slate-900 dark:text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all" placeholder={t.search} />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-500/10 rounded-full border border-orange-200 dark:border-orange-500/20">
               <Zap className="h-3.5 w-3.5 text-orange-500 dark:text-orange-400 fill-orange-500 dark:fill-orange-400" />
               <span className="text-xs font-bold text-orange-600 dark:text-orange-400">{t.streak}</span>
            </div>
            <button onClick={toggleTheme} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
             <button onClick={toggleLang} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center font-bold text-xs w-9 h-9 border border-slate-200 dark:border-slate-800">
              {lang === 'en' ? 'EN' : '中'}
            </button>
            <button className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-slate-950"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-xl transition-colors" onClick={() => setCurrentView('achievements')}>
              <div className="h-9 w-9 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-800 relative overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=2669&auto=format&fit=crop" alt="User" fill className="object-cover" />
              </div>
              <div className="hidden md:block text-left">
                 <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">Alex Student</p>
                 <p className="text-xs text-slate-500 mt-1">Grade 8</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main Area with Snap */}
        {/* snap-y + snap-mandatory creates the dampening effect */}
        <main className={`flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth ${currentView === 'dashboard' ? 'snap-y snap-mandatory' : ''}`}>
           {renderContent()}
        </main>
      </div>
    </div>
  );
}
