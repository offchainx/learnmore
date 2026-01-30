import { notFound, redirect } from 'next/navigation'
import { getCurrentUser } from '@/actions/auth'
import prisma from '@/lib/prisma'
import { QuestionEditorForm } from '@/components/admin/QuestionEditorForm'
import type { QuestionWithRelations } from '@/lib/content-pipeline/types'

export default async function QuestionEditPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getCurrentUser()

  if (!user || !['ADMIN', 'TEACHER'].includes(user.role)) {
    redirect('/dashboard')
  }

  const { id } = await params

  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      chapter: {
        include: {
          subject: true,
        },
      },
      group: true,
      tags: { include: { tag: true } },
      knowledgePoints: { include: { kp: true } },
      sourceFiles: true,
      _count: {
        select: {
          attempts: true,
          errorBook: true
        }
      }
    },
  })

  if (!question) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <QuestionEditorForm question={question as unknown as QuestionWithRelations} />
    </div>
  )
}
