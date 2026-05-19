import { NextResponse } from 'next/server'
import {
  normalizeDashboardHeroLayoutPreset,
  type DashboardHeroLayoutPreset,
} from '@/components/dashboard/heroLayoutPreset'
import { saveDashboardHeroLayoutPreset } from '@/components/dashboard/heroLayoutPreset.server'
import { canAccessDashboardPreview } from '@/lib/dashboard-preview-access'

export async function POST(request: Request) {
  if (!canAccessDashboardPreview(request.headers)) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }

  try {
    const body = (await request.json()) as unknown
    const preset = normalizeDashboardHeroLayoutPreset(body)
    const savedPreset = await saveDashboardHeroLayoutPreset(
      preset as DashboardHeroLayoutPreset
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
          error instanceof Error ? error.message : 'Failed to save hero preset',
      },
      { status: 500 }
    )
  }
}
