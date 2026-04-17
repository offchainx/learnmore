import prisma from '@/lib/prisma'
import { ProcessingStatus } from '@prisma/client'

async function main() {
  const orphanQuestions = await prisma.question.findMany({
    where: {
      sourceFileId: null,
      paperId: { not: null },
    },
    select: {
      id: true,
      paperId: true,
      subjectId: true,
      createdBy: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [{ paperId: 'asc' }, { createdAt: 'asc' }],
  })

  if (orphanQuestions.length === 0) {
    console.log('No orphan questions found.')
    return
  }

  const groups = new Map<
    string,
    typeof orphanQuestions
  >()
  for (const question of orphanQuestions) {
    if (!question.paperId) continue
    const list = groups.get(question.paperId) ?? []
    list.push(question)
    groups.set(question.paperId, list)
  }

  const adminUser =
    (await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true },
    })) ??
    (await prisma.user.findFirst({
      select: { id: true },
    }))

  if (!adminUser?.id) {
    throw new Error('No available uploader user found')
  }

  const summaries: Array<{
    paperId: string
    sourceFileId: string
    questionCount: number
  }> = []

  for (const [paperId, questions] of groups.entries()) {
    const firstQuestion = questions[0]
    const lastQuestion = questions[questions.length - 1]
    const subjectIds = new Set(questions.map((question) => question.subjectId).filter(Boolean))
    if (subjectIds.size !== 1) {
      console.warn(
        `paperId ${paperId} has ${subjectIds.size} subject ids; using the first one.`
      )
    }
    const subjectId = questions[0]?.subjectId ?? null
    if (!subjectId) {
      throw new Error(`paperId ${paperId} has no subjectId`)
    }

    const backfillFileUrl = `backfill://paper/${paperId}`
    let sourceFile = await prisma.sourceFile.findFirst({
      where: { fileUrl: backfillFileUrl },
      select: { id: true },
    })

    if (!sourceFile) {
      const created = await prisma.sourceFile.create({
        data: {
          filename: `paper_${paperId}.html`,
          sourceNote: `Backfilled from orphan questions by paperId ${paperId}`,
          fileUrl: backfillFileUrl,
          fileType: 'html',
          fileSize: 0,
          subjectId,
          uploadedBy: firstQuestion.createdBy ?? adminUser.id,
          status: ProcessingStatus.COMPLETED,
          ocrStatus: ProcessingStatus.SKIPPED,
          createdAt: firstQuestion.createdAt,
          processedAt: lastQuestion.updatedAt,
          importDiagnostics: {
            mode: 'backfill-paper-id',
            paperId,
            recoveredQuestionCount: questions.length,
            recoveredQuestionIds: questions.map((question) => question.id),
            recoveredAt: new Date().toISOString(),
          },
        },
        select: { id: true },
      })
      sourceFile = created
    }

    await prisma.question.updateMany({
      where: {
        id: { in: questions.map((question) => question.id) },
      },
      data: {
        sourceFileId: sourceFile.id,
      },
    })

    summaries.push({
      paperId,
      sourceFileId: sourceFile.id,
      questionCount: questions.length,
    })
  }

  console.log(
    JSON.stringify(
      {
        updatedGroups: summaries.length,
        summaries,
      },
      null,
      2
    )
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
