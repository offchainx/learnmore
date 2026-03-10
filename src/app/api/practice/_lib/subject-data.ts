import { getAllSubjects } from '@/actions/courses/subject'
import { getSubjectChapters } from '@/actions/practice/data-service'
import { getPastPapersBySubject } from '@/actions/practice/past-papers'
import { getExamForecastData, getKnowledgeHiveData } from '@/actions/practice/statistics'
import { unstable_cache } from 'next/cache'
import { SUBJECT_DEFINITIONS, SUBJECT_KEYS, resolveSubjectKeyFromName } from '@/lib/subjects'
import prisma from '@/lib/prisma'

export interface PracticeSubjectDataPayload {
  chapters: NonNullable<Awaited<ReturnType<typeof getSubjectChapters>>>['chapters']
  pastPapers: NonNullable<Awaited<ReturnType<typeof getPastPapersBySubject>>['data']>
  knowledgeHive: Awaited<ReturnType<typeof getKnowledgeHiveData>>
  examForecast: Awaited<ReturnType<typeof getExamForecastData>>
}

interface SubjectLite {
  id: string
  key: string
  name: string
}

interface PracticeSubjectCatalog {
  subjects: Array<{ id: string; key: string; name: string; icon: string | null }>
  defaultSubjectId: string
}

function normalizePracticeSubjects(
  rawSubjects: Array<{ id: string; key?: string | null; name: string; icon?: string | null; order?: number | null }>,
): Array<{ id: string; key: string; name: string; icon: string | null }> {
  const byKey = new Map<string, { id: string; key: string; name: string; icon: string | null }>()

  for (const subject of rawSubjects) {
    const resolvedKey = subject.key && SUBJECT_KEYS.includes(subject.key as (typeof SUBJECT_KEYS)[number])
      ? subject.key
      : resolveSubjectKeyFromName(subject.name)

    if (!resolvedKey) continue
    if (byKey.has(resolvedKey)) continue

    byKey.set(resolvedKey, {
      id: subject.id,
      key: resolvedKey,
      name: subject.name,
      icon: subject.icon ?? null,
    })
  }

  return SUBJECT_DEFINITIONS
    .map((definition) => byKey.get(definition.key))
    .filter((subject): subject is { id: string; key: string; name: string; icon: string | null } => Boolean(subject))
}

function resolveDefaultSubjectId(subjects: SubjectLite[]): string {
  if (subjects.length === 0) return ''

  const preferredSubject = subjects.find((subject) => subject.key === 'math')

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

async function queryPracticeSubjectCatalog(): Promise<PracticeSubjectCatalog> {
  const subjectsResult = await getAllSubjects()
  let subjects = Array.isArray(subjectsResult.data)
    ? normalizePracticeSubjects(subjectsResult.data)
    : []

  if (!subjectsResult.success || subjects.length === 0) {
    console.warn(
      '[practice/bootstrap] getAllSubjects failed, fallback to direct query:',
      subjectsResult.error || 'unknown error',
    )

    const fallbackRows = await prisma.subject.findMany({
      select: { id: true, key: true, name: true, icon: true, order: true },
      orderBy: { order: 'asc' },
    })
    subjects = normalizePracticeSubjects(fallbackRows)
  }

  if (subjects.length === 0) {
    throw new Error(subjectsResult.error || 'Failed to load subjects')
  }

  const defaultSubjectId = resolveDefaultSubjectId(subjects)

  return {
    subjects,
    defaultSubjectId,
  }
}

const getCachedPracticeSubjectCatalog = unstable_cache(
  async () => queryPracticeSubjectCatalog(),
  ['practice:subject-catalog:v2'],
  { revalidate: 3600, tags: ['practice-subject-catalog'] },
)

export async function getPracticeBootstrapData(
  userId: string,
  options?: { includeSubjectData?: boolean },
) {
  const catalog = await getCachedPracticeSubjectCatalog()
  const includeSubjectData = options?.includeSubjectData ?? false
  const subjectData = includeSubjectData && catalog.defaultSubjectId
    ? await getPracticeSubjectData(userId, catalog.defaultSubjectId)
    : null

  return {
    subjects: catalog.subjects,
    defaultSubjectId: catalog.defaultSubjectId,
    subjectData,
  }
}
