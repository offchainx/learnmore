import { Metadata } from 'next';
import { LaunchContentPage } from '@/components/marketing/LaunchContentPage';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  await params;
  return {
    title: 'Learnbank Updates',
    description: 'Verified Learnbank product updates and beta previews.',
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  await params;
  return <LaunchContentPage kind="updates" />;
}
