import { getErrorWiperSession, submitErrorWiperSession } from '@/actions/practice/error-book';
import { getCurrentUser } from '@/actions/user/auth';
import { ErrorWiperSession, ErrorBookEntry } from '@/components/practice/modes/ErrorWiperMode';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Brain } from 'lucide-react';
import { QuestionType } from '@/components/business/question';
import { getEffectiveTier } from '@/lib/permissions/engine';

export const metadata = {
  title: 'Error Wiper | LearnMore',
  description: 'Gamified error review mode',
};

interface PageProps {
  searchParams: Promise<{
    subjectId?: string
    autostart?: string
  }>
}

export default async function ErrorWiperPage({ searchParams }: PageProps) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const resolvedSearchParams = await searchParams
  const subjectId = resolvedSearchParams.subjectId
  const autoStart = resolvedSearchParams.autostart === '1'
  const effectiveTier = getEffectiveTier(user)
  const practiceCenterHref = subjectId
    ? `/dashboard/practice?subjectId=${encodeURIComponent(subjectId)}`
    : '/dashboard/practice'
  
  const session = await getErrorWiperSession(subjectId);

  if (!session.success || !session.data || session.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-400/20 to-blue-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(52,211,153,0.3)]">
           <Brain className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">当前没有待修复错题</h2>
        <p className="text-slate-400 mb-8 max-w-md text-lg">
          你的错题簿暂时已经清空，当前没有需要继续擦除的历史错题。
        </p>
        <Link href={practiceCenterHref}>
          <Button size="xl" variant="primary" className="rounded-2xl font-black tracking-widest">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回练习中心
          </Button>
        </Link>
      </div>
    );
  }

  async function handleSessionComplete() {
    'use server';
    redirect(practiceCenterHref);
  }

  // Wrapper to match expected Promise<void> return type
  async function handleSubmitWiperSession(input: {
    attempts: Array<{ questionId: string; isCorrect: boolean }>
    duration: number
    clientSessionId: string
  }) {
    'use server';
    return submitErrorWiperSession({
      attempts: input.attempts,
      duration: input.duration,
      subjectId,
      clientSessionId: input.clientSessionId,
    });
  }

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
      group: entry.question.group
        ? {
            id: entry.question.group.id,
            title: entry.question.group.title ?? null,
            material: entry.question.group.material,
            imageUrls: Array.isArray(entry.question.group.imageUrls)
              ? entry.question.group.imageUrls
              : [],
          }
        : null,
    }
  }));

  return (
    <div className="mx-auto w-full max-w-[1680px] px-3 py-2 sm:px-4 sm:py-4">
      <ErrorWiperSession
        initialSession={formattedSession}
        autoStart={autoStart}
        subjectId={subjectId}
        userTier={effectiveTier}
        onSubmitSession={handleSubmitWiperSession}
        onSessionComplete={handleSessionComplete}
      />
    </div>
  );
}
