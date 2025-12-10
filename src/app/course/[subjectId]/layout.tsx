import { Header } from '@/components/business/Header';
import { CourseLayoutClient } from '@/components/business/CourseLayoutClient';

// Mock Data
const MOCK_CHAPTERS = [
  {
    id: 'chapter-1',
    title: 'Chapter 1: Introduction',
    children: [
      { id: 'lesson-1-1', title: '1.1 Getting Started', isCompleted: true },
      { id: 'lesson-1-2', title: '1.2 Setup Environment', isCompleted: true },
      { id: 'lesson-1-3', title: '1.3 First Program', isCompleted: false },
    ],
  },
  {
    id: 'chapter-2',
    title: 'Chapter 2: Basic Concepts',
    children: [
      { id: 'lesson-2-1', title: '2.1 Variables', isLocked: true },
      { id: 'lesson-2-2', title: '2.2 Functions', isLocked: true },
    ],
  },
];

export default function CourseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 overflow-hidden">
        <CourseLayoutClient chapters={MOCK_CHAPTERS} title="Introduction to React">
            {children}
        </CourseLayoutClient>
      </div>
    </div>
  );
}