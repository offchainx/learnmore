import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { getProfile } from '@/actions/profile';
import { getDashboardStats } from '@/actions/dashboard';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const profile = await getProfile();

  if (!profile) {
    // Check if we have a valid session but missing database record
    // to avoid infinite redirect loop with middleware
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
          <div className="max-w-md p-6 bg-white dark:bg-slate-800 rounded-lg shadow-xl">
            <h1 className="text-2xl font-bold mb-4 text-red-500">Account Sync Issue</h1>
            <p className="mb-2">Your login session is valid, but your user profile was not found in our database.</p>
            <div className="text-left text-sm bg-slate-100 dark:bg-slate-950 p-3 rounded mb-4 font-mono overflow-auto">
              <p>User ID: {user.id}</p>
              <p>Email: {user.email}</p>
            </div>
            <p className="text-sm text-slate-500">This usually happens if the account creation process was interrupted.</p>
            <div className="mt-6">
              <form action={async () => {
                'use server';
                const supabase = await createClient();
                await supabase.auth.signOut();
                redirect('/login');
              }}>
                <button type="submit" className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded text-sm font-medium transition-colors">
                  Sign Out & Try Again
                </button>
              </form>
            </div>
          </div>
        </div>
      );
    }

    redirect('/login');
  }

  const dashboardData = await getDashboardStats();

  return <DashboardClient user={profile} initialData={dashboardData} />;
}