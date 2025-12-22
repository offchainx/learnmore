import { Metadata } from 'next';
import { getPlatformStats } from '@/actions/marketing';
import { LandingPage } from '@/components/marketing/landing-page';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

  // Check auth status
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  return (
    <LandingPage 
      stats={stats} 
      isLoggedIn={isLoggedIn} 
    />
  );
}