import { NextResponse } from 'next/server'
import {
  normalizeDashboardStreakLayoutPreset,
  type DashboardStreakLayoutPreset,
} from '@/components/dashboard/streakLayoutPreset'
import { saveDashboardStreakLayoutPreset } from '@/components/dashboard/streakLayoutPreset.server'
import { canAccessDashboardPreview } from '@/lib/dashboard-preview-access'

export async function POST(request: Request) {
  if (!canAccessDashboardPreview(request.headers)) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }

  try {
    const body = (await request.json()) as unknown
    const preset = normalizeDashboardStreakLayoutPreset(body)
    const savedPreset = await saveDashboardStreakLayoutPreset(
      preset as DashboardStreakLayoutPreset
    )

    return NextResponse.json({
      ok: true,
      preset: savedPreset,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Failed to save streak preset',
      },
      { status: 500 }
    )
  }
}
