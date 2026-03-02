import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { getDashboardProfile } from '@/actions/user/profile';
import { getDashboardStats } from '@/actions/dashboard';
import { syncCurrentUserToDatabase } from '@/actions/user/auth';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export default async function DashboardPage() {
  const [profile, dashboardData] = await Promise.all([
    getDashboardProfile(),
    getDashboardStats(),
  ]);

  if (!profile) {
    // Check if we have a valid session but missing database record
    // to avoid infinite redirect loop with middleware
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      let dbConnectionIssue = false;
      let dbSchemaIssue = false;
      try {
        await prisma.$queryRaw`SELECT subscription_status FROM users LIMIT 1`;
      } catch (error) {
        const message = error instanceof Error ? error.message.toLowerCase() : '';
        if (message.includes('does not exist') || message.includes('column') || message.includes('table')) {
          dbSchemaIssue = true;
        } else {
          dbConnectionIssue = true;
        }
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
          <div className="max-w-md p-6 bg-white dark:bg-slate-800 rounded-lg shadow-xl">
            <h1 className="text-2xl font-bold mb-4 text-red-500">
              {dbSchemaIssue ? 'Database Schema Issue' : dbConnectionIssue ? 'Database Connection Issue' : 'Account Sync Issue'}
            </h1>
            <p className="mb-2">
              {dbSchemaIssue
                ? 'Your login session is valid, but the database schema is out of sync with the current code.'
                : dbConnectionIssue
                ? 'Your login session is valid, but the app cannot connect to the database right now.'
                : 'Your login session is valid, but your user profile was not found in our database.'}
            </p>
            <div className="text-left text-sm bg-slate-100 dark:bg-slate-950 p-3 rounded mb-4 font-mono overflow-auto">
              <p>User ID: {user.id}</p>
              <p>Email: {user.email}</p>
            </div>
            <p className="text-sm text-slate-500">
              {dbSchemaIssue
                ? 'Please run `npx prisma db push` and restart dev server.'
                : dbConnectionIssue
                ? 'Please verify DATABASE_URL / DIRECT_URL settings and restart dev server.'
                : 'This usually happens if the account creation process was interrupted.'}
            </p>
            <div className="mt-6 flex gap-3 justify-center">
              {!dbConnectionIssue && !dbSchemaIssue && (
                <form action={async () => {
                  'use server';
                  const result = await syncCurrentUserToDatabase();
                  if (result.success) {
                    revalidatePath('/dashboard');
                    redirect('/dashboard');
                  }
                }}>
                  <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors">
                    Fix My Account
                  </button>
                </form>
              )}
              {/* 退出登录按钮 */}
              <form action={async () => {
                'use server';
                const supabase = await createClient();
                await supabase.auth.signOut();
                redirect('/login');
              }}>
                <button type="submit" className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded text-sm font-medium transition-colors">
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      );
    }

    redirect('/login');
  }

  if (!dashboardData) {
    redirect('/login');
  }

  return <DashboardClient user={profile} initialData={dashboardData} />;
}
