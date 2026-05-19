import { DashboardClient } from '@/components/dashboard/DashboardClient'
import { getDashboardShellProfile } from '@/actions/user/profile'
import { syncCurrentUserToDatabase } from '@/actions/user/auth'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getOnboardingStatus } from '@/lib/auth/onboarding'
import { triggerOnboardingReminderNotification } from '@/actions/notification/triggers'
import { getDashboardHeroLayoutPreset } from '@/components/dashboard/heroLayoutPreset.server'
import { getDashboardHomeDesktopLayoutPreset } from '@/components/dashboard/dashboardHomeDesktopLayoutPreset.server'
import { getDashboardTaskLayoutPreset } from '@/components/dashboard/taskLayoutPreset.server'
import { getDashboardPathLayoutPreset } from '@/components/dashboard/pathLayoutPreset.server'
import { getDashboardStreakLayoutPreset } from '@/components/dashboard/streakLayoutPreset.server'
import { getDashboardGoalLayoutPreset } from '@/components/dashboard/goalLayoutPreset.server'
import { getDashboardProfileLayoutPreset } from '@/components/dashboard/profileLayoutPreset.server'
import { getDashboardCalendarLayoutPreset } from '@/components/dashboard/calendarLayoutPreset.server'
import { getDashboardTimeLayoutPreset } from '@/components/dashboard/timeLayoutPreset.server'
import { getDashboardSubjectLayoutPreset } from '@/components/dashboard/subjectLayoutPreset.server'
import { getDashboardReviewLayoutPreset } from '@/components/dashboard/reviewLayoutPreset.server'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?:
    | {
        edit?: string
        layoutEdit?: string
      }
    | Promise<{
        edit?: string
        layoutEdit?: string
      }>
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams)
  const layoutEditMode =
    resolvedSearchParams?.edit === '1' ||
    resolvedSearchParams?.layoutEdit === '1'

  return <DashboardPageContent layoutEditMode={layoutEditMode} />
}

async function DashboardPageContent({
  layoutEditMode,
}: {
  layoutEditMode: boolean
}) {
  const profile = await getDashboardShellProfile()

  if (!profile) {
    // Check if we have a valid session but missing database record
    // to avoid infinite redirect loop with middleware
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      let dbConnectionIssue = false
      let dbSchemaIssue = false
      try {
        await prisma.$queryRaw`SELECT subscription_status FROM users LIMIT 1`
      } catch (error) {
        const message =
          error instanceof Error ? error.message.toLowerCase() : ''
        if (
          message.includes('does not exist') ||
          message.includes('column') ||
          message.includes('table')
        ) {
          dbSchemaIssue = true
        } else {
          dbConnectionIssue = true
        }
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-page p-8 text-center text-text-primary dark:bg-page dark:text-text-primary">
          <div className="max-w-md rounded-lg border border-borderTone bg-surface p-6 shadow-surface dark:border-borderTone dark:bg-surface-subtle dark:shadow-surface-md">
            <h1 className="mb-4 text-2xl font-bold text-red-500">
              {dbSchemaIssue
                ? 'Database Schema Issue'
                : dbConnectionIssue
                  ? 'Database Connection Issue'
                  : 'Account Sync Issue'}
            </h1>
            <p className="mb-2">
              {dbSchemaIssue
                ? 'Your login session is valid, but the database schema is out of sync with the current code.'
                : dbConnectionIssue
                  ? 'Your login session is valid, but the app cannot connect to the database right now.'
                  : 'Your login session is valid, but your user profile was not found in our database.'}
            </p>
            <div className="mb-4 overflow-auto rounded bg-surface-subtle p-3 text-left font-mono text-sm dark:bg-surface">
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
            <div className="mt-6 flex justify-center gap-3">
              {!dbConnectionIssue && !dbSchemaIssue && (
                <form
                  action={async () => {
                    'use server'
                    const result = await syncCurrentUserToDatabase()
                    if (result.success) {
                      revalidatePath('/dashboard')
                      redirect('/dashboard')
                    }
                  }}
                >
                  <button
                    type="submit"
                    className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Fix My Account
                  </button>
                </form>
              )}
              {/* 退出登录按钮 */}
              <form
                action={async () => {
                  'use server'
                  const supabase = await createClient()
                  await supabase.auth.signOut()
                  redirect('/login')
                }}
              >
                <button
                  type="submit"
                  className="rounded bg-surface-muted px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-subtle dark:bg-surface dark:text-text-primary dark:hover:bg-surface-subtle"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      )
    }

    redirect('/login')
  }

  const onboardingStatus = getOnboardingStatus({
    legalConsentAcceptedAt: profile.legalConsentAcceptedAt,
    displayName: profile.displayName,
    school: profile.school,
    grade: profile.grade,
    onboardingCompletedAt: profile.onboardingCompletedAt,
    onboardingStep: profile.onboardingStep,
  })

  if (onboardingStatus.route !== '/dashboard') {
    void triggerOnboardingReminderNotification(
      profile.id,
      onboardingStatus.route
    )
  }

  const heroLayoutPreset = await getDashboardHeroLayoutPreset()
  const taskLayoutPreset = await getDashboardTaskLayoutPreset()
  const pathLayoutPreset = await getDashboardPathLayoutPreset()
  const streakLayoutPreset = await getDashboardStreakLayoutPreset()
  const goalLayoutPreset = await getDashboardGoalLayoutPreset()
  const profileLayoutPreset = await getDashboardProfileLayoutPreset()
  const calendarLayoutPreset = await getDashboardCalendarLayoutPreset()
  const timeLayoutPreset = await getDashboardTimeLayoutPreset()
  const subjectLayoutPreset = await getDashboardSubjectLayoutPreset()
  const reviewLayoutPreset = await getDashboardReviewLayoutPreset()
  const homeDesktopLayoutPreset = await getDashboardHomeDesktopLayoutPreset()

  return (
    <DashboardClient
      user={profile}
      initialData={null}
      heroLayoutPreset={heroLayoutPreset}
      taskLayoutPreset={taskLayoutPreset}
      pathLayoutPreset={pathLayoutPreset}
      streakLayoutPreset={streakLayoutPreset}
      goalLayoutPreset={goalLayoutPreset}
      profileLayoutPreset={profileLayoutPreset}
      calendarLayoutPreset={calendarLayoutPreset}
      timeLayoutPreset={timeLayoutPreset}
      subjectLayoutPreset={subjectLayoutPreset}
      reviewLayoutPreset={reviewLayoutPreset}
      homeDesktopLayoutPreset={homeDesktopLayoutPreset}
      layoutEditMode={layoutEditMode}
    />
  )
}
