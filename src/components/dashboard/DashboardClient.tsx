"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useApp } from '@/providers/app-provider';

// Import Views
import { DashboardHome } from './DashboardHome';
import { CommunityView } from './views/CommunityView';
import { MyCoursesView } from './views/MyCoursesView';
import { QuestionBankView } from './views/QuestionBankView';
import { LeaderboardView } from './views/LeaderboardView';
import { SettingsView } from './views/SettingsView';
import { AchievementsView } from './views/AchievementsView';

// --- Local Types ---
type View = 'dashboard' | 'courses' | 'questionBank' | 'leaderboard' | 'community' | 'settings' | 'achievements';

type UserProfile = {
  id: string;
  email: string;
  username: string | null;
  avatar: string | null;
  grade: number | null;
  settings: {
    aiPersonality?: string | null;
    difficultyCalibration?: number | null;
  } | null;
};

type DashboardClientProps = {
  user: UserProfile;
};

export const DashboardClient: React.FC<DashboardClientProps> = ({ user }) => {
  const router = useRouter();
  const { t: appT } = useApp(); // Use global context
  const [currentView, setCurrentView] = useState<View>('dashboard');

  // We rely on appT from useApp now, which is fully populated from src/lib/translations
  // But some views expect `t` as a prop.
  // MyCoursesView, QuestionBankView, LeaderboardView take `t`.
  // DashboardHome takes `navigate`.
  
  // Note: appT is the object for the CURRENT language (e.g. translations['en']).
  // So we pass appT directly.

  const renderContent = () => {
    switch(currentView) {
      case 'dashboard': return <DashboardHome navigate={router.push} />;
      case 'courses': return <MyCoursesView t={appT} />;
      case 'questionBank': return <QuestionBankView t={appT} />;
      case 'leaderboard': return <LeaderboardView t={appT} />;
      case 'community': return <CommunityView />;
      case 'settings': return <SettingsView user={user} />;
      case 'achievements': return <AchievementsView />;
      default: return <DashboardHome navigate={router.push} />;
    }
  };

  return (
    <DashboardLayout currentView={currentView} onNavigate={(view) => setCurrentView(view as View)}>
       {renderContent()}
    </DashboardLayout>
  );
};
