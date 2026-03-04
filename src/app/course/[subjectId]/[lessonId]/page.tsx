import { notFound } from 'next/navigation'

export default async function LessonPage({
  params: _params,
}: {
  params: Promise<{ subjectId: string; lessonId: string }>;
}) {
  void _params
  notFound()
}
