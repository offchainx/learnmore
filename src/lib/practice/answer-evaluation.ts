import { QuestionType } from '@prisma/client'

export type PracticeAnswerValue = string | string[] | number | null | undefined

function hasText(value: string | null | undefined) {
  return typeof value === 'string' && value.trim().length > 0
}

export function hasProvidedPracticeAnswer(answer: PracticeAnswerValue): boolean {
  if (Array.isArray(answer)) {
    return answer.some((item) => String(item).trim().length > 0)
  }

  if (typeof answer === 'number') {
    return Number.isFinite(answer)
  }

  return hasText(answer as string | null | undefined)
}

function normalizeText(value: string) {
  return value.trim().toLowerCase()
}

function normalizeChoiceValue(value: PracticeAnswerValue) {
  return Array.isArray(value) ? value.map((item) => String(item).trim()) : [String(value ?? '').trim()]
}

export function isRelaxedPracticeAnswerCorrect(
  questionType: QuestionType | string,
  userAnswer: PracticeAnswerValue,
  correctAnswer: string | string[] | null | undefined
): boolean {
  if (!hasProvidedPracticeAnswer(userAnswer) || correctAnswer === null || correctAnswer === undefined) {
    return false
  }

  if (questionType === 'FILL_BLANK' || questionType === 'ESSAY') {
    return true
  }

  if (questionType === 'SINGLE_CHOICE' || questionType === 'TRUE_FALSE' || questionType === 'MCQ') {
    const userValue = Array.isArray(userAnswer) ? userAnswer[0] : userAnswer
    const correctValue = Array.isArray(correctAnswer) ? correctAnswer[0] : correctAnswer
    return normalizeText(String(userValue ?? '')) === normalizeText(String(correctValue ?? ''))
  }

  if (questionType === 'MULTIPLE_CHOICE') {
    const actual = normalizeChoiceValue(userAnswer)
    const expected = normalizeChoiceValue(correctAnswer)

    if (actual.length !== expected.length) return false

    const sortedActual = [...actual].sort()
    const sortedExpected = [...expected].sort()
    return sortedActual.every((value, index) => value === sortedExpected[index])
  }

  return false
}
