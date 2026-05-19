import { readFile } from 'node:fs/promises'
import path from 'node:path'
import Script from 'next/script'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { DashboardVisualReplica } from '@/components/dashboard/DashboardVisualReplica'
import { getDashboardHeroLayoutPreset } from '@/components/dashboard/heroLayoutPreset.server'
import { getDashboardPathLayoutPreset } from '@/components/dashboard/pathLayoutPreset.server'
import { getDashboardStreakLayoutPreset } from '@/components/dashboard/streakLayoutPreset.server'
import { getDashboardTaskLayoutPreset } from '@/components/dashboard/taskLayoutPreset.server'
import { getDashboardGoalLayoutPreset } from '@/components/dashboard/goalLayoutPreset.server'
import { getDashboardProfileLayoutPreset } from '@/components/dashboard/profileLayoutPreset.server'
import { getDashboardCalendarLayoutPreset } from '@/components/dashboard/calendarLayoutPreset.server'
import { getDashboardTimeLayoutPreset } from '@/components/dashboard/timeLayoutPreset.server'
import { getDashboardSubjectLayoutPreset } from '@/components/dashboard/subjectLayoutPreset.server'
import { getDashboardReviewLayoutPreset } from '@/components/dashboard/reviewLayoutPreset.server'
import { canAccessDashboardPreview } from '@/lib/dashboard-preview-access'

export const dynamic = 'force-dynamic'

type DashboardFrozenLayoutSnapshot = {
  shellCornerRadius?: number
  shellBoxes?: unknown
  heroArtFrame?: unknown
  heroCtaOffset?: unknown
  profileAvatarTransform?: unknown
  profileSectionBoxes?: unknown
  reviewCardBoxes?: unknown
  timeTitleTransform?: unknown
  timeStudyPanelBoxes?: unknown
  taskTitleTransform?: unknown
  taskCardBoxes?: unknown
  subjectTitleTransform?: unknown
  reviewTitleTransform?: unknown
  pathTitleTransform?: unknown
  pathBackgroundOffset?: unknown
  subjectCardBoxes?: unknown
}

export default async function DashboardPreviewPage({
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
  const requestHeaders = await headers()

  if (!canAccessDashboardPreview(requestHeaders)) {
    notFound()
  }

  const resolvedSearchParams = await Promise.resolve(searchParams)
  const layoutEditMode =
    resolvedSearchParams?.edit === '1' ||
    resolvedSearchParams?.layoutEdit === '1'

  let initialFrozenLayout: DashboardFrozenLayoutSnapshot | null = null
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

  try {
    const snapshotPath = path.join(
      process.cwd(),
      '.codex/artifacts/page-freeze/latest-page-snapshot.json'
    )
    const rawSnapshot = await readFile(snapshotPath, 'utf8')
    initialFrozenLayout = JSON.parse(rawSnapshot) as DashboardFrozenLayoutSnapshot
  } catch {
    initialFrozenLayout = null
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#fcf7f0]">
      <Script id="preview-cookie-consent" strategy="beforeInteractive">
        {`try { localStorage.setItem('cookie-consent', 'accepted') } catch (error) {}`}
      </Script>
      <DashboardVisualReplica
        shellOnly
        layoutEditMode={layoutEditMode}
        initialFrozenLayout={initialFrozenLayout}
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
      />
    </div>
  )
}
