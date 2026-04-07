import { Suspense } from 'react';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { getDashboardProfile } from '@/actions/user/profile';
import { syncCurrentUserToDatabase } from '@/actions/user/auth';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { DashboardRouteLoading } from '@/components/loading/dashboard-route-loading';

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardRouteLoading currentView="dashboard" variant="dashboard" />}>
      <DashboardPageContent />
    </Suspense>
  );
}

async function DashboardPageContent() {
  const profile = await getDashboardProfile();

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
        <div className="flex min-h-screen flex-col items-center justify-center bg-page p-8 text-center text-text-primary dark:bg-page dark:text-text-primary">
          <div className="max-w-md rounded-lg border border-borderTone bg-surface p-6 shadow-surface dark:border-borderTone dark:bg-surface-subtle dark:shadow-surface-md">
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
            <div className="mb-4 overflow-auto rounded bg-surface-subtle p-3 text-left text-sm font-mono dark:bg-surface">
              <p>User ID: {user.id}</p>
              <p>Email: {user.email}</p>
            </div>
            <p className="text-sm text-text-secondary dark:text-text-secondary">
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
                  <button type="submit" className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
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
                <button type="submit" className="rounded bg-surface-muted px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-subtle dark:bg-surface dark:hover:bg-surface-subtle dark:text-text-primary">
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

  return <DashboardClient user={profile} initialData={null} />;
}
