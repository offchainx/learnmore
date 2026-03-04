"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useApp } from '@/providers';
import { DashboardData } from '@/actions/dashboard';

// Import Views
import { DashboardHome } from './DashboardHome';
import { CommunityView } from './views/CommunityView';
import { CoursesView } from '@/components/courses/CoursesView';
import { PracticeView } from '@/components/practice/PracticeView';
import { LeaderboardView } from '@/components/leaderboard/LeaderboardView';
import { SettingsView } from './views/SettingsView';
import { AchievementsView } from '@/components/achievements/AchievementsView';
import { ParentDashboardView } from './views/ParentDashboardView';
import { KnowledgeGraphView } from './views/KnowledgeGraphView';
import { User, UserSettings } from '@prisma/client';

// --- Local Types ---
type View = 'dashboard' | 'courses' | 'questionBank' | 'leaderboard' | 'community' | 'settings' | 'achievements' | 'parent' | 'knowledgeGraph' | 'admin';

type UserProfile = User & { settings: UserSettings | null };

interface DashboardClientProps {
  user: UserProfile;
  initialData: DashboardData;
}

export function DashboardClient({ user, initialData }: DashboardClientProps) {
  const router = useRouter();
  const { t: appT } = useApp();
  // Automatically switch to parent view if user is a parent
  const [currentView, setCurrentView] = useState<View>(user.role === 'PARENT' ? 'parent' : 'dashboard');

  const handleViewChange = (view: string) => {
    // For Settings, Community, Leaderboard, Courses, Practice, Achievements, KnowledgeGraph, and Admin, use real routes
    if (view === 'settings') {
      router.push('/dashboard/settings');
      return;
    }
    if (view === 'community') {
      router.push('/dashboard/community');
      return;
    }
    if (view === 'leaderboard') {
      router.push('/dashboard/leaderboard');
      return;
    }
    if (view === 'courses') {
      router.push('/dashboard/courses');
      return;
    }
    if (view === 'questionBank') {
      router.push('/dashboard/practice');
      return;
    }
    if (view === 'achievements') {
      router.push('/dashboard/achievements');
      return;
    }
    if (view === 'knowledgeGraph') {
      router.push('/dashboard/knowledge-graph');
      return;
    }
    if (view === 'admin') {
      router.push('/admin');
      return;
    }
    // For other views, still use useState (for now)
    setCurrentView(view as View);
  };

  const renderContent = () => {
    // Parent should only see ParentDashboard or Settings
    if (user.role === 'PARENT') {
      switch(currentView) {
        case 'settings': return <SettingsView user={user} />;
        default: return <ParentDashboardView />;
      }
    }

    switch(currentView) {
      case 'dashboard': return <DashboardHome navigate={router.push} onViewChange={handleViewChange} initialData={initialData} user={user} />;
      case 'courses': return <CoursesView t={appT} />;
      case 'questionBank': return <PracticeView t={appT} />;
      case 'leaderboard':
        return (
          <LeaderboardView
            t={appT}
            currentUser={{
              id: user.id,
              username: user.username,
              avatar: user.avatar,
            }}
          />
        );
      case 'community': return <CommunityView />;
      case 'settings': return <SettingsView user={user} />;
      case 'achievements':
        return (
          <AchievementsView
            user={{
              username: user.username,
              avatar: user.avatar,
            }}
            overview={null}
            badges={[]}
          />
        );
      case 'knowledgeGraph': return <KnowledgeGraphView />;
      default: return <DashboardHome navigate={router.push} onViewChange={handleViewChange} initialData={initialData} user={user} />;
    }
  };

  return (
    <DashboardLayout
      currentView={currentView}
      onNavigate={handleViewChange}
      userRole={user.role}
      subscriptionTier={user.subscriptionTier}
      subscriptionEnd={user.subscriptionEnd}
    >
       {renderContent()}
    </DashboardLayout>
  );
};
