import { PageHeroShell } from '@/components/shared/PageHeroShell'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type RouteLoadingVariant =
  | 'dashboard'
  | 'courses'
  | 'practice'
  | 'leaderboard'
  | 'community'
  | 'settings'
  | 'achievements'
  | 'admin'

function LoadingHero({
  actionWidth = 'w-28',
  metricCount = 3,
}: {
  actionWidth?: string
  metricCount?: 2 | 3 | 4
}) {
  return (
    <PageHeroShell
      className="border border-borderTone bg-[linear-gradient(135deg,hsl(var(--surface-default))_0%,hsl(var(--surface-muted))_100%)] shadow-surface"
      eyebrow={<Skeleton className="h-6 w-28 rounded-full" />}
      title={<Skeleton className="h-10 w-56 rounded-2xl" />}
      subtitle={<Skeleton className="mt-3 h-4 w-full max-w-2xl rounded-full" />}
      actions={<Skeleton className={cn('h-11 rounded-full', actionWidth)} />}
    >
      <div className={cn('grid gap-3', metricCount === 4 ? 'sm:grid-cols-2 xl:grid-cols-4' : metricCount === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3')}>
        {Array.from({ length: metricCount }).map((_, index) => (
          <Skeleton key={`hero-metric-${index}`} className="h-20 rounded-[24px]" />
        ))}
      </div>
    </PageHeroShell>
  )
}

function LoadingPageBanner({
  actionWidth = 'w-28',
  titleWidth = 'w-56',
  subtitleWidth = 'w-full max-w-2xl',
}: {
  actionWidth?: string
  titleWidth?: string
  subtitleWidth?: string
}) {
  return (
    <PageHeroShell
      className="border border-borderTone bg-[linear-gradient(135deg,hsl(var(--surface-default))_0%,hsl(var(--surface-muted))_100%)] shadow-surface"
      eyebrow={<Skeleton className="h-6 w-28 rounded-full" />}
      title={<Skeleton className={cn('h-10 rounded-2xl', titleWidth)} />}
      subtitle={<Skeleton className={cn('mt-3 h-4 rounded-full', subtitleWidth)} />}
      actions={<Skeleton className={cn('h-11 rounded-full', actionWidth)} />}
    />
  )
}

function LoadingStatGrid({
  columns = 4,
}: {
  columns?: 2 | 3 | 4
}) {
  const gridClass =
    columns === 2
      ? 'sm:grid-cols-2'
      : columns === 3
        ? 'sm:grid-cols-3'
        : 'sm:grid-cols-2 xl:grid-cols-4'

  return (
    <div className={cn('grid gap-3', gridClass)}>
      {Array.from({ length: columns }).map((_, index) => (
        <div
          key={`stat-${index}`}
          className="rounded-[28px] border border-borderTone bg-surface p-5 shadow-surface"
        >
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="mt-4 h-9 w-20 rounded-2xl" />
          <Skeleton className="mt-3 h-3 w-28 rounded-full" />
        </div>
      ))}
    </div>
  )
}

function LoadingPanel({
  className,
  lines = 3,
  footer = false,
}: {
  className?: string
  lines?: number
  footer?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-[28px] border border-borderTone bg-surface p-5 shadow-surface',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-3">
          <Skeleton className="h-5 w-36 rounded-full" />
          <Skeleton className="h-3 w-64 rounded-full" />
        </div>
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>

      <div className="mt-5 space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={`line-${index}`}
            className={cn(
              'h-16 rounded-[22px]',
              index === lines - 1 && lines > 2 ? 'w-11/12' : ''
            )}
          />
        ))}
      </div>

      {footer ? <Skeleton className="mt-5 h-11 w-36 rounded-full" /> : null}
    </div>
  )
}

function LoadingList({
  rows = 6,
}: {
  rows?: number
}) {
  return (
    <div className="rounded-[28px] border border-borderTone bg-surface p-3 shadow-surface">
      <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr] gap-3 px-3 py-3">
        <Skeleton className="h-4 rounded-full" />
        <Skeleton className="h-4 rounded-full" />
        <Skeleton className="h-4 rounded-full" />
        <Skeleton className="h-4 rounded-full" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={`row-${index}`}
            className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr] gap-3 rounded-[22px] border border-borderTone/70 bg-surface-subtle px-3 py-4"
          >
            <Skeleton className="h-4 rounded-full" />
            <Skeleton className="h-4 rounded-full" />
            <Skeleton className="h-4 rounded-full" />
            <Skeleton className="h-4 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

function DashboardVariantSkeleton({
  variant,
}: {
  variant: RouteLoadingVariant
}) {
  if (variant === 'practice') {
    return (
      <div className="space-y-4">
        <LoadingPageBanner actionWidth="w-36" titleWidth="w-48" />
        <div className="rounded-[28px] border border-borderTone bg-surface p-4 shadow-surface">
          <Skeleton className="h-4 w-24 rounded-full" />
          <div className="mt-4 flex flex-wrap gap-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={`practice-chip-${index}`} className="h-10 w-24 rounded-full" />
            ))}
          </div>
        </div>
        <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <LoadingPanel lines={3} footer />
          <div className="space-y-4">
            <LoadingPanel lines={3} />
            <LoadingPanel lines={3} />
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <LoadingPanel lines={2} className="lg:col-span-1" />
          <LoadingPanel lines={2} className="lg:col-span-1" />
          <LoadingPanel lines={2} className="lg:col-span-1" />
        </div>
      </div>
    )
  }

  if (variant === 'leaderboard') {
    return (
      <div className="space-y-4">
        <LoadingPageBanner actionWidth="w-32" titleWidth="w-48" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <LoadingPanel lines={3} />
          <LoadingList rows={7} />
        </div>
      </div>
    )
  }

  if (variant === 'community') {
    return (
      <div className="space-y-4">
        <LoadingPageBanner actionWidth="w-32" titleWidth="w-48" />
        <div className="rounded-[28px] border border-borderTone bg-surface p-4 shadow-surface">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton
                  key={`community-filter-${index}`}
                  className="h-10 w-24 rounded-full"
                />
              ))}
            </div>
            <Skeleton className="h-10 w-32 rounded-full" />
          </div>
        </div>
        <div className="grid gap-4 xl:grid-cols-[0.72fr_1.28fr]">
          <div className="space-y-4">
            <LoadingPanel lines={4} />
            <LoadingPanel lines={3} />
          </div>
          <div className="space-y-4">
            <LoadingPanel lines={3} />
            <LoadingPanel lines={3} />
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'settings') {
    return (
      <div className="space-y-4">
        <LoadingPageBanner actionWidth="w-28" titleWidth="w-44" />
        <div className="grid gap-4 xl:grid-cols-[0.28fr_0.72fr]">
          <div className="rounded-[28px] border border-borderTone bg-surface p-4 shadow-surface">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={`nav-${index}`} className="h-12 rounded-[20px]" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <LoadingPanel lines={3} />
            <div className="grid gap-4 lg:grid-cols-2">
              <LoadingPanel lines={3} />
              <LoadingPanel lines={3} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'achievements') {
    return (
      <div className="space-y-4">
        <LoadingPageBanner actionWidth="w-28" titleWidth="w-48" />
        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <LoadingStatGrid columns={3} />
            <LoadingPanel lines={4} footer />
          </div>
          <div className="space-y-4">
            <LoadingPanel lines={3} />
            <LoadingList rows={5} />
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'admin') {
    return (
      <div className="space-y-4">
        <LoadingPageBanner actionWidth="w-32" titleWidth="w-48" />
        <LoadingStatGrid columns={4} />
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.95fr_0.95fr]">
          <LoadingPanel lines={4} />
          <LoadingPanel lines={3} />
          <LoadingList rows={5} />
        </div>
      </div>
    )
  }

  if (variant === 'courses') {
    return (
      <div className="space-y-4">
        <LoadingPageBanner actionWidth="w-32" titleWidth="w-48" />
        <div className="rounded-[28px] border border-borderTone bg-surface p-4 shadow-surface">
          <Skeleton className="h-4 w-24 rounded-full" />
          <div className="mt-4 flex flex-wrap gap-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={`course-chip-${index}`} className="h-10 w-28 rounded-full" />
            ))}
          </div>
        </div>
        <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
          <LoadingPanel lines={4} footer />
          <LoadingPanel lines={4} />
        </div>
        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <LoadingList rows={4} />
          <LoadingPanel lines={3} footer />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <LoadingHero actionWidth="w-28" metricCount={4} />
      <LoadingStatGrid columns={4} />
      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.85fr]">
        <LoadingPanel lines={3} footer />
        <LoadingPanel lines={3} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_0.85fr]">
        <LoadingPanel lines={3} />
        <LoadingPanel lines={3} />
        <LoadingPanel lines={2} />
      </div>
    </div>
  )
}

export function DashboardRouteLoading({
  currentView,
  variant,
  userRole = 'STUDENT',
}: {
  currentView: string
  variant: RouteLoadingVariant
  userRole?: string
}) {
  const mainClassName =
    variant === 'admin'
      ? 'p-2 sm:p-4'
      : variant === 'practice'
        ? 'px-3 py-3 sm:px-4 sm:py-4 desktop:px-6 desktop:py-4'
        : 'p-4 sm:p-8'
  const showAdminSection = currentView === 'admin' || userRole === 'ADMIN'

  return (
    <div className="dashboard-shell flex h-screen min-w-0 overflow-hidden font-sans text-text-primary dark:text-white">
      <div className="pointer-events-none fixed right-4 top-4 z-[70] hidden desktop:block desktop:right-6">
        <div className="rounded-2xl border border-borderTone bg-surface p-1.5 shadow-surface-md dark:border-borderTone dark:bg-surface">
          <Skeleton className="h-10 w-10 rounded-2xl" />
        </div>
      </div>

      <aside className="dashboard-sidebar-shell hidden h-full w-72 shrink-0 border-r desktop:flex desktop:flex-col">
        <div className="flex h-20 flex-shrink-0 items-center border-b border-borderTone/70 px-6 dark:border-borderTone/70">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-28 rounded-full" />
              <Skeleton className="h-4 w-14 rounded-full" />
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`primary-nav-${index}`}
                className={cn(
                  'rounded-2xl px-4 py-3',
                  index === 0 ? 'bg-surface-selected' : 'bg-transparent'
                )}
              >
                <Skeleton className="h-5 w-full rounded-full" />
              </div>
            ))}
          </div>

          {showAdminSection ? (
            <div className="space-y-2 border-t border-borderTone/70 pt-3 dark:border-borderTone/70">
              <Skeleton className="h-3 w-16 rounded-full" />
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`admin-nav-${index}`} className="rounded-2xl px-4 py-3">
                  <Skeleton className="h-5 w-full rounded-full" />
                </div>
              ))}
            </div>
          ) : null}

          <div className="rounded-2xl border border-borderTone bg-surface p-4 shadow-surface">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-24 rounded-full" />
                <Skeleton className="h-3 w-36 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-borderTone/70 bg-page p-4 dark:border-borderTone/70 dark:bg-page">
          <Skeleton className="mb-3 h-3 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-12 rounded-2xl" />
            <Skeleton className="h-12 rounded-2xl" />
          </div>
        </div>
      </aside>

      <main className={cn('min-w-0 flex-1 overflow-y-auto', mainClassName)}>
        <div data-route-loading={variant}>
        <DashboardVariantSkeleton variant={variant} />
        </div>
      </main>
    </div>
  )
}
