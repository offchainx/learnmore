import { Metadata } from 'next';
import { LaunchContentPage } from '@/components/marketing/LaunchContentPage';

export const preferredRegion = 'sin1';
export const dynamic = 'force-static';
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Learnbank.ai | 独中生的 UEC 初中统考备考 App（内测报名）',
  description:
    'Learnbank.ai 按马来西亚华文独中初中统考（UEC）考纲整理数学、科学、历史、地理的练习与笔记。App 尚未上架，现在开放 iOS 与 Android 内测报名。',
  keywords: ['独中', 'UEC', '初中统考', '马来西亚独中', 'Learnbank.ai', '内测报名', '数学', '科学', '历史', '地理'],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Learnbank.ai | 独中生的 UEC 初中统考备考 App',
    description: '按独中初中统考（UEC）考纲做的练习与笔记。App 尚未上架，现在开放内测报名。',
    images: ['/images/brand/learnbank-og.png'],
  },
};

export default function Home() {
  return <LaunchContentPage kind="home" />
}
