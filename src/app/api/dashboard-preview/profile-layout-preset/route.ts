import { NextResponse } from 'next/server'
import {
  normalizeDashboardProfileLayoutPreset,
  type DashboardProfileLayoutPreset,
} from '@/components/dashboard/profileLayoutPreset'
import { saveDashboardProfileLayoutPreset } from '@/components/dashboard/profileLayoutPreset.server'
import { canAccessDashboardPreview } from '@/lib/dashboard-preview-access'

export async function POST(request: Request) {
  if (!canAccessDashboardPreview(request.headers)) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }

  try {
    const body = (await request.json()) as unknown
    const preset = normalizeDashboardProfileLayoutPreset(body)
    const savedPreset = await saveDashboardProfileLayoutPreset(
      preset as DashboardProfileLayoutPreset
    )

    return NextResponse.json({ ok: true, preset: savedPreset })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to save profile preset',
      },
      { status: 500 }
    )
  }
}
