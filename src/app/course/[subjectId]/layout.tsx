import type { ReactNode } from 'react'
import { redirect, notFound } from 'next/navigation'
import { getCurrentUser } from '@/actions/user/auth'
import { getSubjectDetails } from '@/actions/courses/subject'
import { CourseLayoutClient } from '@/components/business/courses'

export default async function CourseLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ subjectId: string }>
}) {
  const { subjectId } = await params
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const subjectResult = await getSubjectDetails(subjectId)
  if (!subjectResult.success || !subjectResult.data) {
    notFound()
  }

  return (
    <div className="mx-auto w-full max-w-[1680px] px-3 py-2 sm:px-4 sm:py-4">
      <CourseLayoutClient
        subjectId={subjectId}
        chapters={subjectResult.data.chapters}
        title={subjectResult.data.name}
      >
        {children}
      </CourseLayoutClient>
    </div>
  )
}

