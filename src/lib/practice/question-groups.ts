import type { Prisma, Question } from '@prisma/client'

export const practiceQuestionGroupSelect = {
  id: true,
  title: true,
  material: true,
  imageUrls: true,
} satisfies Prisma.QuestionGroupSelect

export const practiceQuestionWithGroupInclude = {
  group: {
    select: practiceQuestionGroupSelect,
  },
} satisfies Prisma.QuestionInclude

export type PracticeQuestionGroupData = Prisma.QuestionGroupGetPayload<{
  select: typeof practiceQuestionGroupSelect
}>

export type PracticeQuestionRecord = Question & {
  group?: PracticeQuestionGroupData | null
}

export function toQuestionMaterialGroup(
  group: PracticeQuestionGroupData | null | undefined
) {
  if (!group) return null
  return {
    id: group.id,
    title: group.title ?? null,
    material: group.material,
    imageUrls: Array.isArray(group.imageUrls) ? group.imageUrls : [],
  }
}
