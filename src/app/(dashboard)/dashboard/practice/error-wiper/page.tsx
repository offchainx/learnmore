import { getErrorWiperSession, updateErrorWiperProgress } from '@/actions/practice/error-book';
import { ErrorWiperSession, ErrorBookEntry } from '@/components/practice/modes/ErrorWiperMode';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Brain, Eraser } from 'lucide-react';
import { QuestionType } from '@/components/business/question';

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
      <div className="mb-8">
        <div className="text-[11px] font-black uppercase tracking-[0.24em] text-rose-600 dark:text-rose-300">Practice Mode</div>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:text-rose-300">
            <Eraser className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">Error Wiper</h1>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              错因修复模式。每道题需要连续答对 3 次，才算真正从错题簿里擦除。
            </p>
          </div>
        </div>
      </div>

      <ErrorWiperSession
        initialSession={formattedSession}
        onUpdateProgress={handleUpdateProgress}
        onSessionComplete={handleSessionComplete}
      />
    </div>
  );
}
