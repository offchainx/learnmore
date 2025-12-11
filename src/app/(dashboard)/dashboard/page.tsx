import { getDashboardStats } from '@/actions/dashboard';
import DashboardClient from './DashboardClient';

export const metadata = {
  title: 'Dashboard - LearnMore',
  description: 'Your learning progress and statistics.',
};

export default async function DashboardPage() {
  const data = await getDashboardStats();

  return <DashboardClient initialData={data} />;
}
