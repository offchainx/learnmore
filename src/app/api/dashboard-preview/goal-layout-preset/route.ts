import { NextResponse } from 'next/server'
import {
  normalizeDashboardGoalLayoutPreset,
  type DashboardGoalLayoutPreset,
} from '@/components/dashboard/goalLayoutPreset'
import { saveDashboardGoalLayoutPreset } from '@/components/dashboard/goalLayoutPreset.server'
import { canAccessDashboardPreview } from '@/lib/dashboard-preview-access'

export async function POST(request: Request) {
  if (!canAccessDashboardPreview(request.headers)) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }

  try {
    const body = (await request.json()) as unknown
    const preset = normalizeDashboardGoalLayoutPreset(body)
    const savedPreset = await saveDashboardGoalLayoutPreset(
      preset as DashboardGoalLayoutPreset
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
          error instanceof Error ? error.message : 'Failed to save goal preset',
      },
      { status: 500 }
    )
  }
}
