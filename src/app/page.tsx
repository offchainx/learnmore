import { Metadata } from 'next';
import { getPlatformStats } from '@/actions/marketing/campaign';
import { LandingPage } from '@/components/marketing/landing-page';

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
  const stats = await getPlatformStats();

  return (
    <LandingPage
      stats={stats}
    />
  );
}
