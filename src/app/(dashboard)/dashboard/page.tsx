import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { getProfile } from '@/actions/profile';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const profile = await getProfile();

  if (!profile) {
    redirect('/login');
  }

  return <DashboardClient user={profile} />;
}