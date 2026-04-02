import { Metadata } from 'next';
import { getCachedPlatformStats } from '@/lib/cache/sitewide';
import { LandingPage } from '@/components/marketing/landing-page';
import { createServerPerfLogger } from '@/lib/observability/perf';

export const preferredRegion = 'sin1';
export const dynamic = 'force-static';
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'LearnMore AI | Your Personal AI Tutor for Middle School',
  description: 'Master your subjects with adaptive AI learning. Personalized study paths, instant feedback, and comprehensive diagnostic reports.',
  keywords: ['AI Tutor', 'Adaptive Learning', 'Middle School Education', 'Adaptive Learning', 'Study Guide'],
  openGraph: {
    title: 'LearnMore AI | More Than Just Practice',
    description: 'Adaptive AI learning that turns every minute into progress.',
    images: ['/og-image.png'],
  },
};

export default async function Home() {
  const metrics = createServerPerfLogger('/');

  const stats = await getCachedPlatformStats();

  metrics.done({
    activeStudents: stats.activeStudents,
    questionsSolved: stats.questionsSolved,
  });

  return (
    <LandingPage
      stats={stats}
    />
  );
}
