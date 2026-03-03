"use client"

import React, { useEffect, useState } from 'react';
import { StatsCards } from './StatsCards';
import { ReportsTable } from './ReportsTable';
import { ReportDetailsDrawer } from './ReportDetailsDrawer';
import { Header } from './Header';
import { MOCK_REPORTS } from './constants';
import { Report } from './types';

export const ReportsClient: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (!isDrawerOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDrawerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen]);

  const handleSelectReport = (report: Report) => {
    setSelectedReport(report);
    setIsDrawerOpen(true);
  };

  return (
    <div className="relative min-h-full bg-background-light dark:bg-background-dark overflow-hidden rounded-xl">
      {/* Ambient Background Blobs */}
      <div className="hidden dark:block absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="hidden dark:block absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* Main Content Container - gets blurred when drawer is open */}
      <div className={`relative z-10 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] p-6 lg:p-8 ${isDrawerOpen ? 'filter blur-sm scale-[0.98] opacity-50 pointer-events-none' : ''}`}>
        <Header />
        <StatsCards />
        <ReportsTable reports={MOCK_REPORTS} onSelectReport={handleSelectReport} />
      </div>

      {/* Semi-transparent overlay: click or ESC to close drawer */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[2px] transition-opacity duration-300"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      <ReportDetailsDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        report={selectedReport} 
      />
    </div>
  );
};
