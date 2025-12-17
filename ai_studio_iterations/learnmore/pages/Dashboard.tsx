
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useApp } from '../contexts/AppContext';

// Import Views
import { DashboardHome } from '../components/dashboard/DashboardHome';
import { CommunityView } from '../components/dashboard/views/CommunityView';
import { MyCoursesView } from '../components/dashboard/views/MyCoursesView';
import { QuestionBankView } from '../components/dashboard/views/QuestionBankView';
import { LeaderboardView } from '../components/dashboard/views/LeaderboardView';
import { SettingsView } from '../components/dashboard/views/SettingsView';
import { AchievementsView } from '../components/dashboard/views/AchievementsView';

// --- Local Types ---
type View = 'dashboard' | 'courses' | 'questionBank' | 'leaderboard' | 'community' | 'settings' | 'achievements';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t: appT } = useApp(); // Use global context
  const [currentView, setCurrentView] = useState<View>('dashboard');

  // Fallback for local translations if 'ms' is not defined in the local object yet
  const localT = translations[lang as keyof typeof translations] || translations['en'];

  const renderContent = () => {
    switch(currentView) {
      case 'dashboard': return <DashboardHome navigate={navigate} />;
      case 'courses': return <MyCoursesView t={localT} />;
      case 'questionBank': return <QuestionBankView t={localT} />;
      case 'leaderboard': return <LeaderboardView t={localT} />;
      case 'community': return <CommunityView />;
      case 'settings': return <SettingsView />;
      case 'achievements': return <AchievementsView t={localT} />;
      default: return <DashboardHome navigate={navigate} />;
    }
  };

  return (
    <DashboardLayout currentView={currentView} onNavigate={(view) => setCurrentView(view as View)}>
       {renderContent()}
    </DashboardLayout>
  );
};

// Re-including the translation object locally for compatibility during this refactor phase.
// In a full production app, this would move to `src/locales/en.ts` etc.
const translations = {
  en: {
    dashboard: 'Dashboard',
    courses: 'Lessons', 
    practice: 'Practice',
    leaderboard: 'Leaderboard',
    community: 'Community',
    settings: 'Settings',
    logout: 'Log Out',
    welcome: 'Welcome back, Alex!',
    dailyInspiration: 'Daily Vibe',
    questionBank: 'Practice',
    mySubjects: 'My Courses',
    todaysMission: "Today's Mission",
    missionSub: "AI-Generated Priorities",
    studyTime: 'Study Time',
    streak: 'Streak',
    questions: 'Questions',
    accuracy: 'Accuracy',
    mistakes: 'Mistakes',
    communityTitle: 'Student Hub',
    communitySub: 'Connect, share, and learn together',
    createPost: 'Share your thoughts...',
    feedLatest: 'Latest',
    feedPopular: 'Popular',
    feedUnanswered: 'Unanswered',
    liveRooms: 'Live Rooms',
    topContributors: 'Top Contributors',
    hotTopics: 'Trending Topics',
    joinRoom: 'Join',
    postAchievement: 'Achievement',
    confidenceLow: "Low Confidence",
    confidenceMed: "Medium",
    confidenceHigh: "High",
    common: { viewAll: "View All" }
  },
  zh: {
    dashboard: '仪表盘',
    courses: '课程学习', 
    practice: '练习',
    leaderboard: '排行榜',
    community: '社区',
    settings: '设置',
    logout: '退出登录',
    welcome: '欢迎回来，Alex！',
    dailyInspiration: '每日灵感',
    questionBank: '练习中心',
    mySubjects: '我的课程',
    todaysMission: "今日任务",
    missionSub: "AI 生成的优先级任务",
    studyTime: '本周时长',
    streak: '连胜天数',
    questions: '完成题数',
    accuracy: '正确率',
    mistakes: '错题数',
    communityTitle: '学员社区',
    communitySub: '连接、分享、共同进步',
    createPost: '分享你的想法...',
    feedLatest: '最新',
    feedPopular: '热门',
    feedUnanswered: '待解答',
    liveRooms: '实时自习室',
    topContributors: '活跃贡献者',
    hotTopics: '热门话题',
    joinRoom: '加入',
    postAchievement: '成就',
    confidenceLow: "低置信度",
    confidenceMed: "中等",
    confidenceHigh: "高置信度",
    common: { viewAll: "查看全部" }
  },
  ms: {
    dashboard: 'Papan Pemuka',
    courses: 'Pelajaran',
    practice: 'Latihan',
    leaderboard: 'Carta Kedudukan',
    community: 'Komuniti',
    settings: 'Tetapan',
    logout: 'Log Keluar',
    welcome: 'Selamat Kembali, Alex!',
    dailyInspiration: 'Inspirasi Harian',
    questionBank: 'Pusat Latihan',
    mySubjects: 'Kursus Saya',
    todaysMission: "Misi Hari Ini",
    missionSub: "Keutamaan Dijana AI",
    studyTime: 'Masa Belajar',
    streak: 'Jalur',
    questions: 'Soalan',
    accuracy: 'Ketepatan',
    mistakes: 'Kesilapan',
    communityTitle: 'Hab Pelajar',
    communitySub: 'Berhubung, berkongsi, dan belajar bersama',
    createPost: 'Kongsi pemikiran anda...',
    feedLatest: 'Terkini',
    feedPopular: 'Popular',
    feedUnanswered: 'Belum Dijawab',
    liveRooms: 'Bilik Langsung',
    topContributors: 'Penyumbang Utama',
    hotTopics: 'Topik Trending',
    joinRoom: 'Sertai',
    postAchievement: 'Pencapaian',
    confidenceLow: "Keyakinan Rendah",
    confidenceMed: "Sederhana",
    confidenceHigh: "Tinggi",
    common: { viewAll: "Lihat Semua" }
  }
};

export default Dashboard;
