import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { StatsCards } from './components/StatsCards';
import { ReportsTable } from './components/ReportsTable';
import { ReportDetailsDrawer } from './components/ReportDetailsDrawer';
import { Report, ReportStatus, IssueType } from './types';

// Mock Data
const MOCK_REPORTS: Report[] = [
  {
    id: 'R-8823',
    user: {
      id: 'u1',
      name: 'Sarah Jenkins',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBELasUW8C45-IUlDe_7xeOctLZ3Kt1Yh1xjI70tYiq-gOxBUFD81j9suJF3mkS6o7myPFCSRg3Mg7z1lyxgOyK5El3QQwvIoMfWHzb2GlhdVFULKbvMiLrD0lMMvaGkE31flMZVYSHkvp_Qg1z1jXiy-7JuTJuH70kOyxIdSq80EJcXg6TCQqpwwF5M8v3ed09d68bwXEDjJQgQ58oX51S1e9V1A3NoWeEGZk9U6Tz0qqrMc03fAL4heG49bSRXXVoY0ITY4w7d1zG'
    },
    timestamp: '2 mins ago',
    issueType: IssueType.ANSWER_WRONG,
    status: ReportStatus.IN_REVIEW,
    comment: "The correct answer should be Heisenberg's Uncertainty Principle, but the system marked 'B' as correct which is Pauli Exclusion Principle.",
    systemCorrectOptionId: 'B',
    userSuggestedOptionId: 'A',
    question: {
      id: 'Q-8823',
      subject: 'Physics 101',
      text: 'In quantum mechanics, which principle states that position and momentum cannot be simultaneously measured with arbitrarily high precision?',
      options: [
        { id: 'A', text: "Heisenberg's Uncertainty Principle", isCorrect: false },
        { id: 'B', text: "Pauli Exclusion Principle", isCorrect: true },
        { id: 'C', text: "Schrödinger's Cat Paradox", isCorrect: false },
        { id: 'D', text: "Planck's Constant", isCorrect: false },
      ]
    }
  },
  {
    id: 'R-4129',
    user: {
      id: 'u2',
      name: 'David Kim',
      avatar: ''
    },
    timestamp: '15 mins ago',
    issueType: IssueType.TYPO_ERROR,
    status: ReportStatus.PENDING,
    comment: "Spelling mistake in the question text.",
    question: {
      id: 'Q-4129',
      subject: 'Biology 201',
      text: 'The mitochondria is the powerhouse of the cell, responsible for...',
      options: [
        { id: 'A', text: "Respiration", isCorrect: true },
        { id: 'B', text: "Digestion", isCorrect: false },
      ]
    }
  },
  {
    id: 'R-9932',
    user: {
      id: 'u3',
      name: 'Marcus Reid',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOzNeyN7ofxWwh-WFsvvZVjYlpy56wQBAD8p9wnRHxTArwsZWy8ZRACObTNHcpB7HlRGfmJEcRi0DCHQ5aGdaOObvfsLlmwOOwQ_pzqMOv8wlL-LcWGxsty5zQCKv_wXOZdA0INArm54YrYFYj4A_8U0fxUXnIj4k1K4L0EEvP7QANHqOE3qm_OEej6nrMXa-jySHzsUrw3PQav5mJv-4RVxRzOMr07-0JoMnrSgiSd6ZMPdM4BGCkrtyuhNPFghaDGz-cN6XLKkFl'
    },
    timestamp: '1 hour ago',
    issueType: IssueType.IMAGE_MISSING,
    status: ReportStatus.RESOLVED,
    comment: "Diagram is not loading.",
    question: {
      id: 'Q-9932',
      subject: 'Geometry',
      text: 'Calculate the area of the shaded region in the following diagram...',
      options: []
    }
  },
  {
    id: 'R-1120',
    user: {
      id: 'u4',
      name: 'Elena Lopez',
      avatar: ''
    },
    timestamp: '3 hours ago',
    issueType: IssueType.ANSWER_WRONG,
    status: ReportStatus.PENDING,
    comment: "I think Blue is primary.",
    question: {
      id: 'Q-1120',
      subject: 'Art History',
      text: 'Which of the following is NOT a primary color in the additive model?',
      options: []
    }
  }
];

const App: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Initialize selected report to match screenshot
  useEffect(() => {
    setSelectedReport(MOCK_REPORTS[0]);
    setIsDrawerOpen(true);
  }, []);

  // Update HTML class for dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSelectReport = (report: Report) => {
    setSelectedReport(report);
    setIsDrawerOpen(true);
  };

  return (
    <div className="relative h-screen overflow-hidden bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200 font-sans antialiased">
      
      {/* Main Layout Container - gets blurred when drawer is open */}
      <div className={`flex h-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isDrawerOpen ? 'filter blur-sm scale-[0.98] opacity-50 pointer-events-none' : ''}`}>
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto relative z-10 scroll-smooth">
          {/* Ambient Background Blobs */}
          <div className="hidden dark:block absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="hidden dark:block absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-6 py-8 relative z-20">
            <div className="mb-8 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">User Reports Management</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Review, track, and resolve content issues reported by students.</p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
                  <span className="material-icons-outlined mr-2 text-base">file_download</span>
                  Export
                </button>
              </div>
            </div>

            <StatsCards />

            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <div className="relative w-full sm:w-96">
                <span className="material-icons-outlined absolute left-3 top-2.5 text-gray-400 dark:text-gray-500 pointer-events-none">search</span>
                <input 
                  className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all shadow-sm" 
                  placeholder="Search reports by ID, content or user..." 
                  type="text" 
                />
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
                  <span className="material-icons-outlined text-lg">filter_list</span>
                  Filter
                </button>
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
                  <span className="material-icons-outlined text-lg">sort</span>
                  Sort
                </button>
              </div>
            </div>

            <ReportsTable reports={MOCK_REPORTS} onSelectReport={handleSelectReport} />
          </div>
        </main>
      </div>

      {/* Invisible overlay to catch clicks when drawer is open */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 z-40 cursor-default"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      <ReportDetailsDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        report={selectedReport} 
      />

      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 w-12 h-12 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform focus:outline-none focus:ring-4 focus:ring-primary/50"
        >
          <span className="material-icons-outlined">{darkMode ? 'light_mode' : 'dark_mode'}</span>
        </button>
      </div>
    </div>
  );
};

export default App;