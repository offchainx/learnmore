import { redirect } from 'next/navigation';
import { getChapterWithStats, getRandomQuestions } from '@/actions/practice/data-service';
import { getCurrentUser } from '@/actions/user/auth';
import DrillInterface from '@/components/practice/chapter-drill/DrillInterface';
import { Problem, UserStats } from '@/components/practice/chapter-drill/types';
import prisma from '@/lib/prisma';

interface PageProps {
  params: Promise<{
    chapterId: string;
  }>;
}

export default async function ChapterDrillPage({ params }: PageProps) {
  const { chapterId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // 1. Fetch Chapter Details
  const chapter = await getChapterWithStats(chapterId, user.id);
  
  if (!chapter) {
    redirect('/dashboard/practice');
  }

  const subject = await prisma.subject.findUnique({
    where: { id: chapter.subjectId },
    select: { name: true }
  });

  // 1.5 Fetch Sibling Chapters for Sidebar
  const siblingChapters = await prisma.chapter.findMany({
    where: { subjectId: chapter.subjectId },
    orderBy: { order: 'asc' },
    select: { id: true, title: true }
  });

  const sidebarChapters = siblingChapters.map(ch => ({
    id: ch.id,
    title: ch.title,
    isCompleted: false, // Todo: fetch real progress
    isLocked: false,
    isActive: ch.id === chapterId
  }));

  // 2. Fetch Questions (Real Data)
  const questions = await getRandomQuestions({
    chapterIds: [chapterId],
    limit: 20, 
    userId: user.id
  });

  // 2.5 FALLBACK: If no questions in DB, provide mock questions for UI testing
  const useMockFallback = questions.length === 0;
  
  const mockProblems: Problem[] = [
    {
      id: "mock-1",
      type: "MULTIPLE_CHOICE",
      level: 3,
      question: "Find the value of x for the following quadratic equation:",
      equation: "2x² − 5x + 3 = 0",
      options: { a: "x = 1, x = 1.5", b: "x = -1, x = -1.5", c: "x = 1, x = -1.5", d: "No real solutions" },
      parsedOptions: ["x = 1, x = 1.5", "x = -1, x = -1.5", "x = 1, x = -1.5", "No real solutions"],
      answer: "a",
      explanation: "Using the quadratic formula $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$.",
      correctIndex: 0
    },
    {
      id: "mock-2",
      type: "MULTIPLE_CHOICE",
      level: 2,
      question: "Solve for x in the following equation:",
      equation: "x² - 4x + 4 = 0",
      options: { a: "x = 2", b: "x = -2", c: "x = 0, x = 4", d: "No real solutions" },
      parsedOptions: ["x = 2", "x = -2", "x = 0, x = 4", "No real solutions"],
      answer: "a",
      explanation: "This is a perfect square: $(x - 2)^2 = 0$, so $x = 2$.",
      correctIndex: 0
    },
    {
      id: "mock-3",
      type: "MULTIPLE_CHOICE",
      level: 4,
      question: "What is the discriminant of the quadratic equation:",
      equation: "3x² + 2x + 5 = 0",
      options: { a: "64", b: "-56", c: "4", d: "0" },
      parsedOptions: ["64", "-56", "4", "0"],
      answer: "b",
      explanation: "The discriminant $D = b^2 - 4ac = 2^2 - 4(3)(5) = 4 - 60 = -56$.",
      correctIndex: 1
    }
  ];

  // 3. Transform to Problem type
  const problems: Problem[] = useMockFallback ? mockProblems : questions.map(q => {
    let parsedOptions: string[] = [];
    if (q.options && typeof q.options === 'object') {
        if (Array.isArray(q.options)) {
            parsedOptions = q.options as string[];
        } else {
            const keys = Object.keys(q.options).sort();
            parsedOptions = keys.map(k => (q.options as Record<string, string>)[k]);
        }
    }

    let correctIndex = 0;
    if (typeof q.answer === 'string') {
        const charCode = q.answer.toLowerCase().charCodeAt(0);
        if (charCode >= 97) { 
            correctIndex = charCode - 97;
        } else if (!isNaN(parseInt(q.answer))) {
            correctIndex = parseInt(q.answer);
        }
    }

    return {
      id: q.id,
      type: q.type,
      level: q.difficulty,
      question: q.content,
      equation: null,
      options: q.options as Record<string, string>,
      parsedOptions,
      answer: q.answer as string,
      explanation: q.explanation,
      correctIndex
    };
  });

  // 4. Initial Stats
  const stats: UserStats = {
    mastery: chapter.stats.masteryLevel,
    sessionTime: "00:00", // Will be client side timer
    streak: user.streak,
    currentProblemIndex: chapter.stats.correctCount, // Roughly
    totalProblems: chapter.stats.questionCount || 20
  };

  return (
    <DrillInterface 
      initialProblems={problems}
      chapterTitle={chapter.title}
      subjectName={subject?.name || 'Subject'}
      initialStats={stats}
      sidebarChapters={sidebarChapters}
    />
  );
}
