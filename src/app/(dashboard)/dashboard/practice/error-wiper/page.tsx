import { getErrorWiperSession, updateErrorWiperProgress } from '@/actions/practice/error-book';
import { ErrorWiperMode, ErrorBookEntry } from '@/components/practice/modes/ErrorWiperMode';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Brain, ArrowLeft } from 'lucide-react';
import { QuestionType } from '@/components/business/question/types';

export const metadata = {
  title: 'Error Wiper | LearnMore',
  description: 'Gamified error review mode',
};

interface PageProps {
  searchParams: Promise<{
    subjectId?: string
  }>
}

export default async function ErrorWiperPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams
  const subjectId = resolvedSearchParams.subjectId
  
  const session = await getErrorWiperSession(subjectId);

  if (!session.success || !session.data || session.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-400/20 to-blue-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(52,211,153,0.3)]">
           <Brain className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">All Clear!</h2>
        <p className="text-slate-400 mb-8 max-w-md text-lg">
          Your error book is empty. You&apos;ve mastered all your past mistakes! 
          Time to tackle some new challenges.
        </p>
        <Link href="/dashboard/practice">
          <Button size="xl" variant="glow" className="rounded-2xl font-black tracking-widest">
            <ArrowLeft className="w-4 h-4 mr-2" />
            BACK TO PRACTICE
          </Button>
        </Link>
      </div>
    );
  }

  async function handleSessionComplete() {
    'use server';
    redirect('/dashboard/practice');
  }

  // Wrapper to match expected Promise<void> return type
  async function handleUpdateProgress(questionId: string, isCorrect: boolean): Promise<void> {
    'use server';
    await updateErrorWiperProgress(questionId, isCorrect);
  }

  console.log('ErrorWiper Session Data:', JSON.stringify(session.data, null, 2));

  const formattedSession: ErrorBookEntry[] = session.data.map((entry) => ({
    id: entry.id,
    questionId: entry.questionId,
    masteryLevel: entry.masteryLevel,
    question: {
      id: entry.question.id,
      type: entry.question.type as QuestionType,
      content: entry.question.content,
      options: entry.question.options as Record<string, string> | null,
      answer: entry.question.answer as string | string[] | null,
      explanation: entry.question.explanation,
    }
  }));

  return (
    <div className="container mx-auto max-w-4xl min-h-screen lg:py-8">
      <ErrorWiperMode
        initialSession={formattedSession}
        onUpdateProgress={handleUpdateProgress}
        onSessionComplete={handleSessionComplete}
      />
    </div>
  );
}