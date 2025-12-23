import { Metadata } from 'next';
import { getPlatformStats } from '@/actions/marketing';
import { LandingPage } from '@/components/marketing/landing-page';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'LearnMore AI | Your Personal AI Tutor for Middle School',
  description: 'Master your subjects with Knowledge Graph-based adaptive learning. Personalized study paths, instant feedback, and comprehensive diagnostic reports.',
  keywords: ['AI Tutor', 'Adaptive Learning', 'Middle School Education', 'Knowledge Graph', 'Study Guide'],
  openGraph: {
    title: 'LearnMore AI | More Than Just Practice',
    description: 'Knowledge Graph-based adaptive learning that turns every minute into progress.',
    images: ['/og-image.png'],
  },
};

export default async function Home() {
  // Fetch stats from database
  const stats = await getPlatformStats();

  // Check auth status using proper server client with full cookie support
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  // Debug logging (will appear in terminal, not browser console)
  console.log('[Landing Page] Auth Check:', {
    hasUser: !!user,
    userId: user?.id,
    isLoggedIn,
  });

  return (
    <LandingPage
      stats={stats}
      isLoggedIn={isLoggedIn}
    />
  );
}