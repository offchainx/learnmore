import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/actions/user/auth'
import { getAllSubjects } from '@/actions/courses/subject'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const result = await getAllSubjects()
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to fetch subjects' },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { success: true, data: result.data || [] },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    )
  } catch (error) {
    console.error('Error fetching subjects:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
