import { NextResponse } from 'next/server'
import {
  normalizeDashboardCalendarLayoutPreset,
  type DashboardCalendarLayoutPreset,
} from '@/components/dashboard/calendarLayoutPreset'
import { saveDashboardCalendarLayoutPreset } from '@/components/dashboard/calendarLayoutPreset.server'
import { canAccessDashboardPreview } from '@/lib/dashboard-preview-access'

export async function POST(request: Request) {
  if (!canAccessDashboardPreview(request.headers)) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }

  try {
    const body = (await request.json()) as unknown
    const preset = normalizeDashboardCalendarLayoutPreset(body)
    const savedPreset = await saveDashboardCalendarLayoutPreset(
      preset as DashboardCalendarLayoutPreset
    )

    return NextResponse.json({ ok: true, preset: savedPreset })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to save calendar preset',
      },
      { status: 500 }
    )
  }
}
