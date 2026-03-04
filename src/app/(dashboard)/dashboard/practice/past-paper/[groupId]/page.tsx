import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ContentStatus } from '@prisma/client';
import { getCurrentUser } from '@/actions/user/auth';
import prisma from '@/lib/prisma';
import { QuizView } from '@/components/business/quiz/QuizView';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Past Year Paper | LearnMore',
  description: 'Practice real past-year papers from question groups',
};

interface PageProps {
  params: Promise<{
    groupId: string;
  }>;
}

export default async function PastPaperPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const { groupId } = await params;

  const group = await prisma.questionGroup.findUnique({
    where: { id: groupId },
    include: {
      subject: {
        select: { name: true },
      },
      questions: {
        where: {
          status: {
            not: ContentStatus.ARCHIVED,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (!group) {
    redirect('/dashboard/practice');
  }

  const chapterId = group.questions.find(question => question.chapterId)?.chapterId;
  const paperTitle = group.sourcePaper || group.source || 'Past Year Paper';

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{paperTitle}</h1>
        <p className="text-muted-foreground mt-2">
          {group.subject.name}
          {group.sourceYear ? ` • ${group.sourceYear}` : ''}
          {` • ${group.questions.length} Questions`}
        </p>
      </div>

      {group.questions.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-slate-50 dark:bg-slate-900 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            This past paper has no available questions yet.
          </p>
          <Button asChild variant="outline">
            <Link href="/dashboard/practice">Back to Practice Center</Link>
          </Button>
        </div>
      ) : (
        <QuizView chapterId={chapterId || undefined} questions={group.questions} />
      )}
    </div>
  );
}
