import { NextResponse } from 'next/server'
import {
  normalizeDashboardHomeDesktopLayoutPreset,
  type DashboardHomeDesktopLayoutPreset,
} from '@/components/dashboard/dashboardHomeDesktopLayoutPreset'
import { saveDashboardHomeDesktopLayoutPreset } from '@/components/dashboard/dashboardHomeDesktopLayoutPreset.server'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown
    const preset = normalizeDashboardHomeDesktopLayoutPreset(body)
    const savedPreset = await saveDashboardHomeDesktopLayoutPreset(
      preset as DashboardHomeDesktopLayoutPreset
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
          error instanceof Error
            ? error.message
            : 'Failed to save dashboard desktop layout preset',
      },
      { status: 500 }
    )
  }
}
