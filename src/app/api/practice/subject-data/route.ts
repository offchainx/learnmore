import { NextRequest, NextResponse } from 'next/server'
import { getPracticeSubjectData } from '@/app/api/practice/_lib/subject-data'
import { createClient } from '@/lib/supabase/server'

export const preferredRegion = 'sin1'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const subjectId = request.nextUrl.searchParams.get('subjectId')
    if (!subjectId) {
      return NextResponse.json({ success: false, error: 'Missing subjectId' }, { status: 400 })
    }

    const data = await getPracticeSubjectData(user.id, subjectId)
    if (!data) {
      return NextResponse.json({ success: false, error: 'Subject not found' }, { status: 404 })
    }

    return NextResponse.json(
      { success: true, data },
      { headers: { 'Cache-Control': 'private, max-age=15, stale-while-revalidate=60' } },
    )
  } catch (error) {
    console.error('Error fetching practice subject data:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
