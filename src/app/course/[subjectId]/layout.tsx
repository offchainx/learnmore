import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

export default async function CourseLayout({
  children: _children,
  params: _params,
}: {
  children: ReactNode,
  params: Promise<{ subjectId: string }>,
}) {
  void _children
  void _params
  notFound()
}
