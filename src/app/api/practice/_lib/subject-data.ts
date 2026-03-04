import { getAllSubjects } from '@/actions/courses/subject'
import { getSubjectChapters } from '@/actions/practice/data-service'
import { getPastPapersBySubject } from '@/actions/practice/past-papers'
import { getExamForecastData, getKnowledgeHiveData } from '@/actions/practice/statistics'

export interface PracticeSubjectDataPayload {
  chapters: NonNullable<Awaited<ReturnType<typeof getSubjectChapters>>>['chapters']
  pastPapers: NonNullable<Awaited<ReturnType<typeof getPastPapersBySubject>>['data']>
  knowledgeHive: Awaited<ReturnType<typeof getKnowledgeHiveData>>
  examForecast: Awaited<ReturnType<typeof getExamForecastData>>
}

interface SubjectLite {
  id: string
  name: string
}

function resolveDefaultSubjectId(subjects: SubjectLite[]): string {
  if (subjects.length === 0) return ''

  const preferredSubject = subjects.find((subject) => {
    const lowerName = subject.name.toLowerCase()
    return (
      lowerName.includes('math') ||
      lowerName.includes('数学') ||
      lowerName.includes('mathematics')
    )
  })

  return preferredSubject?.id ?? subjects[0].id
}

export async function getPracticeSubjectData(
  userId: string,
  subjectId: string,
): Promise<PracticeSubjectDataPayload | null> {
  const [subjectChaptersResult, pastPapersResult, knowledgeHiveResult, examForecastResult] = await Promise.all([
    getSubjectChapters(subjectId, userId),
    getPastPapersBySubject(subjectId, 12),
    getKnowledgeHiveData(userId, subjectId),
    getExamForecastData(userId, subjectId),
  ])

  if (!subjectChaptersResult) {
    return null
  }

  return {
    chapters: subjectChaptersResult.chapters,
    pastPapers: pastPapersResult.success && Array.isArray(pastPapersResult.data)
      ? pastPapersResult.data
      : [],
    knowledgeHive: knowledgeHiveResult,
    examForecast: examForecastResult,
  }
}

export async function getPracticeBootstrapData(userId: string) {
  const subjectsResult = await getAllSubjects()
  if (!subjectsResult.success) {
    throw new Error(subjectsResult.error || 'Failed to load subjects')
  }

  const subjects = Array.isArray(subjectsResult.data)
    ? subjectsResult.data.map((subject) => ({ id: subject.id, name: subject.name, icon: subject.icon ?? null }))
    : []

  const defaultSubjectId = resolveDefaultSubjectId(subjects)
  const subjectData = defaultSubjectId
    ? await getPracticeSubjectData(userId, defaultSubjectId)
    : null

  return {
    subjects,
    defaultSubjectId,
    subjectData,
  }
}
