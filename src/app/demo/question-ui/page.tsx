
import prisma from '@/lib/prisma';
import QuizDemoClient from './QuizDemoClient';

export const dynamic = 'force-dynamic';

export default async function QuestionUIDemoPage() {
  const questions = await prisma.question.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
  });

  // If no questions, we might want to seed or show message. 
  // For now, let's assume seed data exists or empty list is handled.
  
  // Transform to match Question interface if needed.
  // Prisma Question type matches exactly mostly, except Json fields need type assertion if strict.
  // But for passing to client, Next.js serializes JSON automatically.
  
  return <QuizDemoClient questions={questions as unknown as Question[]} />;
}
