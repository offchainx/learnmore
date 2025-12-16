'use client';

import React, { useEffect, useState } from 'react';
import { Calculator, Atom, FlaskConical, Languages, LucideIcon } from 'lucide-react';

// --- Types ---
export type TabType = 'toc' | 'confidence' | 'notes' | 'bookmarks' | 'highlights';
export type SubTabType = 'all' | 'notes' | 'bookmarks' | 'highlights';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Section {
  id: string;
  title: string;
  duration: string;
  difficulty: Difficulty;
  isCompleted: boolean;
  isLocked: boolean;
  xp: number;
  userConfidence?: ConfidenceLevel; 
}

export interface Chapter {
  id: string;
  title: string;
  sections: Section[];
}

export interface Subject {
  id: string;
  title: string;
  subTitle: string;
  icon: LucideIcon;
  color: string;
  gradient: string;
  progress: number;
  chapters: Chapter[];
}

// --- Mock Data Helpers ---
export const generateChapters = (subjectId: string): Chapter[] => [
  { 
    id: `${subjectId}-c1`, 
    title: 'Chapter 1: Foundations & Core Concepts', 
    sections: [
      { id: `${subjectId}-1-1`, title: '1.1 Introduction', duration: '10 min', difficulty: 'easy', isCompleted: true, isLocked: false, xp: 20, userConfidence: 'high' },
      { id: `${subjectId}-1-2`, title: '1.2 Advanced Theory', duration: '15 min', difficulty: 'medium', isCompleted: true, isLocked: false, xp: 35, userConfidence: 'medium' },
      { id: `${subjectId}-1-3`, title: '1.3 Practical Applications', duration: '20 min', difficulty: 'hard', isCompleted: false, isLocked: false, xp: 50 },
    ]
  },
  { 
    id: `${subjectId}-c2`, 
    title: 'Chapter 2: Advanced Analysis', 
    sections: [
      { id: `${subjectId}-2-1`, title: '2.1 Data Models', duration: '12 min', difficulty: 'easy', isCompleted: false, isLocked: true, xp: 20, userConfidence: 'low' },
      { id: `${subjectId}-2-2`, title: '2.2 Complex Systems', duration: '18 min', difficulty: 'hard', isCompleted: false, isLocked: false, xp: 45 },
    ]
  },
  { 
    id: `${subjectId}-c3`, 
    title: 'Chapter 3: Mock Exams', 
    sections: [
      { id: `${subjectId}-3-1`, title: 'Mid-Term Simulation', duration: '45 min', difficulty: 'hard', isCompleted: false, isLocked: true, xp: 100 },
    ]
  },
];

export const subjectsData: Record<string, Subject> = {
  math: {
    id: 'math',
    title: 'IGCSE Extended Math',
    subTitle: 'Cambridge International (0580)',
    icon: Calculator,
    color: 'bg-blue-600',
    gradient: 'from-blue-600 to-indigo-600',
    progress: 12,
    chapters: generateChapters('math')
  },
  physics: {
    id: 'physics',
    title: 'IGCSE Physics',
    subTitle: 'Mechanics & Electricity (0625)',
    icon: Atom,
    color: 'bg-purple-600',
    gradient: 'from-purple-600 to-fuchsia-600',
    progress: 45,
    chapters: generateChapters('physics')
  },
  chemistry: {
    id: 'chemistry',
    title: 'IGCSE Chemistry',
    subTitle: 'Organic & Inorganic (0620)',
    icon: FlaskConical,
    color: 'bg-emerald-600',
    gradient: 'from-emerald-600 to-teal-600',
    progress: 28,
    chapters: generateChapters('chemistry')
  },
  english: {
    id: 'english',
    title: 'English Literature',
    subTitle: 'Modern Prose & Drama',
    icon: Languages,
    color: 'bg-pink-600',
    gradient: 'from-pink-600 to-rose-600',
    progress: 60,
    chapters: generateChapters('english')
  }
};

export const mockUserContent = [
  { id: 1, type: 'note', subjectId: 'math', chapter: '1.3 Practical Applications', content: 'Key characteristic: Product differentiation is the main difference between this and perfect competition.', date: '2h ago' },
  { id: 2, type: 'bookmark', subjectId: 'math', chapter: '1.3 Practical Applications', content: 'Resume at 04:23', date: '2h ago' },
  { id: 3, type: 'highlight', subjectId: 'physics', chapter: '1.1 Introduction', content: 'Velocity is a vector quantity, meaning it has both magnitude and direction.', date: '1d ago', color: 'bg-green-200 dark:bg-green-900/40' },
  { id: 4, type: 'note', subjectId: 'physics', chapter: '1.2 Advanced Theory', content: 'Remember: F = ma only applies when mass is constant.', date: '1d ago' },
];

// --- Shared Components ---
interface Particle {
  left: string;
  bg: string;
  duration: string;
  delay: string;
}

export const Confetti = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // 延迟设置 state，避免在 effect 中同步调用被 lint 警告（或使用 setTimeout）
    const timer = setTimeout(() => {
      const newParticles = Array.from({ length: 50 }).map(() => ({
        left: `${Math.random() * 100}%`,
        bg: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'][Math.floor(Math.random() * 5)],
        duration: `${Math.random() * 2 + 1}s`,
        delay: `${Math.random() * 0.5}s`
      }));
      setParticles(newParticles);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden flex justify-center">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute top-0 w-2 h-2 rounded-full animate-confetti"
          style={{
            left: p.left,
            backgroundColor: p.bg,
            animationDuration: p.duration,
            animationDelay: p.delay
          }}
        />
      ))}
      <style jsx global>{`
        @keyframes confetti {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation-name: confetti;
          animation-timing-function: ease-out;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
};
