import { Metadata } from 'next';
import { LaunchContentPage } from '@/components/marketing/LaunchContentPage';

export const preferredRegion = 'sin1';
export const dynamic = 'force-static';
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Learnbank | 移动学习 App 内测',
  description: 'Learnbank 移动端学习 App 正在进行 iOS 与 Android 内测，首批聚焦数学、科学、历史和地理。',
  keywords: ['Learnbank', '移动学习 App', '内测', '数学练习', '科学练习', '历史', '地理'],
  openGraph: {
    title: 'Learnbank | 移动学习 App 内测',
    description: 'iOS 与 Android 内测，首批聚焦数学、科学、历史和地理。',
    images: ['/images/brand/learnbank-og.png'],
  },
};

export default function Home() {
  return <LaunchContentPage kind="home" />
}
