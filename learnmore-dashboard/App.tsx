import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { SubjectDistribution } from './components/SubjectDistribution';
import { DifficultyBreakdown } from './components/DifficultyBreakdown';
import { ReviewersList } from './components/ReviewersList';

export default function App() {
  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark relative text-gray-900 dark:text-white">
       {/* Background ambient glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen dark:mix-blend-lighten z-0"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen dark:mix-blend-lighten z-0"></div>

      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <Header />
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 space-y-6 lg:space-y-8">
          <DashboardStats />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SubjectDistribution />
            <DifficultyBreakdown />
          </div>
          
          <ReviewersList />
        </div>
      </main>
    </div>
  );
}