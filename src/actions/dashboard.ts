'use server'

import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/actions/user/auth'
import dayjs from 'dayjs'
import { ensureDailyTasks } from '@/actions/gamification/daily-tasks'
import { calculateLevel, calculateNextLevelXp } from '@/lib/gamification'
import {
  DailyTask,
  LeaderboardPeriod,
  PracticeMode,
  UserAccountStatus,
  UserRole,
} from '@prisma/client'
import { getEffectiveTier } from '@/lib/permissions/engine'
import type { UserWithOverrides } from '@/lib/permissions/engine'
import { getRetentionDate } from '@/lib/permissions/prisma-scope'
import { getSubjectChapters } from '@/actions/practice/data-service'
import type { SubjectChaptersResult } from '@/lib/practice/types'
import { startOfWeek } from 'date-fns'
import { runAfterTask } from '@/lib/server/run-after-task'
import { logPerf } from '@/lib/perf-log'

export type DashboardOverviewWindow = '7D' | '30D'
export type DashboardModuleStatus = 'ready' | 'empty' | 'excluded'

export interface DashboardCollectionModule<T> {
  status: DashboardModuleStatus
  items: T[]
  note?: string
}

export interface DashboardLeaderboardModule {
  status: DashboardModuleStatus
  percentile: number | null
  peerAverageAccuracy: number | null
  userAccuracy: number
  note?: string
}

export interface DashboardData {
  stats: {
    studyTime: string
    questions: number
    accuracy: number
    mistakes: number
    streak: number
    level: number
    xp: number
    nextLevelXp: number
  }
  overviewByWindow: Record<
    DashboardOverviewWindow,
    {
      studyTime: string
      questions: number
      accuracy: number
      activeDays: number
    }
  >
  learningPath: DashboardCollectionModule<{
    id: string
    chapterId: string
    subjectId: string
    title: string
    subject: string
    reason: string
    href: string
    recommendationType: 'weakness' | 'next' | 'review'
    progress: number
  }>
  recentPractice: DashboardCollectionModule<{
    id: string
    title: string
    subject: string
    subjectId: string | null
    mode: PracticeMode
    href: string
    chapterId: string | null
    paperId: string | null
    difficulty: 'EASY' | 'MEDIUM' | 'HARD' | null
    questionCount: number | null
    score: number
    totalQuestions: number
    correctCount: number
    duration: number | null
    createdAt: Date
  }>
  subjectProgress: DashboardCollectionModule<{
    subjectId: string
    subjectName: string
    overallMastery: number
    chapterCount: number
    totalAttempts: number
    chapters: {
      chapterId: string
      chapterTitle: string
      masteryLevel: number
      questionCount: number
      totalAttempts: number
    }[]
  }>
  dailyTasks: DashboardCollectionModule<DailyTask>
  weaknesses: DashboardCollectionModule<{
    chapterId: string
    chapterTitle: string
    subjectId: string
    subjectName: string
    correctRate: number
    masteryLevel: number
    totalAttempts: number
  }>
  leaderboard: DashboardLeaderboardModule
}

function formatHours(totalSeconds: number): string {
  return (totalSeconds / 3600).toFixed(1)
}

function sumStudySeconds(
  records: Array<{ duration: number | null }>
): number {
  return records.reduce((sum, record) => sum + Math.max(0, record.duration ?? 0), 0)
}

function buildOverviewWindow(
  attempts: Array<{ createdAt: Date; isCorrect: boolean }>,
  examDurations: Array<{ createdAt: Date; duration: number | null }>,
  activityEvents: Array<{ occurredAt: Date }>,
  since: Date
): {
  studyTime: string
  questions: number
  accuracy: number
  activeDays: number
} {
  const filteredAttempts = attempts.filter(
    (attempt) => attempt.createdAt >= since
  )
  const correctAttempts = filteredAttempts.filter(
    (attempt) => attempt.isCorrect
  ).length
  const activeDays = new Set(
    activityEvents
      .filter((event) => event.occurredAt >= since)
      .map((event) =>
        dayjs(event.occurredAt).format('YYYY-MM-DD')
      )
  ).size
  const totalStudySeconds = examDurations
    .filter((record) => record.createdAt >= since)
    .reduce((sum, record) => sum + (record.duration ?? 0), 0)

  return {
    studyTime: formatHours(totalStudySeconds),
    questions: filteredAttempts.length,
    accuracy:
      filteredAttempts.length > 0
        ? Math.round((correctAttempts / filteredAttempts.length) * 100)
        : 0,
    activeDays,
  }
}

function buildActivityEvents(input: {
  examRecords: Array<{ createdAt: Date }>
  completedLessons: Array<{ updatedAt: Date }>
}): Array<{ occurredAt: Date }> {
  return [
    ...input.examRecords.map((record) => ({
      occurredAt: record.createdAt,
    })),
    ...input.completedLessons.map((lesson) => ({
      occurredAt: lesson.updatedAt,
    })),
  ]
}

async function loadDashboardSubjectResults(
  userId: string
): Promise<SubjectChaptersResult[]> {
  const startedAt = performance.now()
  const subjects = await prisma.subject.findMany({
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
    },
  })

  const subjectResults: SubjectChaptersResult[] = []
  for (const subject of subjects) {
    try {
      const result = await getSubjectChapters(subject.id, userId)
      if (result && result.chapters.length > 0) {
        subjectResults.push(result)
      }
    } catch (error) {
      console.warn('[Dashboard] Failed to load subject chapters:', {
        subjectId: subject.id,
        userId,
        error,
      })
    }
  }

  logPerf('loadDashboardSubjectResults', startedAt, {
    userId,
    subjects: subjects.length,
    matched: subjectResults.length,
  })
  return subjectResults
}

function buildSubjectProgress(
  subjectResults: SubjectChaptersResult[]
): DashboardData['subjectProgress'] {
  const subjectItems = subjectResults
    .map((result) => {
      const totalAttempts = result.chapters.reduce(
        (sum, chapter) => sum + chapter.stats.totalAttempts,
        0
      )
      const correctCount = result.chapters.reduce(
        (sum, chapter) => sum + chapter.stats.correctCount,
        0
      )
      const overallMastery =
        totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0

      return {
        subjectId: result.subjectId,
        subjectName: result.subjectName,
        overallMastery,
        chapterCount: result.chapters.length,
        totalAttempts,
        chapters: result.chapters.map((chapter) => ({
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          masteryLevel: chapter.stats.masteryLevel,
          questionCount: chapter.stats.questionCount,
          totalAttempts: chapter.stats.totalAttempts,
        })),
      }
    })
    .filter((subject) => subject.totalAttempts > 0)
    .sort((a, b) => {
      if (b.totalAttempts !== a.totalAttempts) {
        return b.totalAttempts - a.totalAttempts
      }
      if (a.overallMastery !== b.overallMastery) {
        return a.overallMastery - b.overallMastery
      }
      return a.subjectName.localeCompare(b.subjectName, 'zh-Hans-CN')
    })

  return {
    status: subjectItems.length > 0 ? 'ready' : 'empty',
    items: subjectItems,
    note:
      subjectItems.length === 0
        ? '用户尚未形成可展示的学科答题样本。'
        : undefined,
  }
}

function buildWeaknesses(
  subjectResults: SubjectChaptersResult[]
): DashboardData['weaknesses'] {
  const weaknessItems = subjectResults
    .flatMap((result) =>
      result.chapters.map((chapter) => ({
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        subjectId: result.subjectId,
        subjectName: result.subjectName,
        correctRate: chapter.stats.masteryLevel,
        masteryLevel:
          chapter.stats.masteryLevel >= 80
            ? 3
            : chapter.stats.masteryLevel >= 60
              ? 2
              : chapter.stats.masteryLevel > 0
                ? 1
                : 0,
        totalAttempts: chapter.stats.totalAttempts,
      }))
    )
    .filter((chapter) => chapter.totalAttempts >= 5 && chapter.correctRate < 70)
    .sort((a, b) => {
      if (a.correctRate !== b.correctRate) {
        return a.correctRate - b.correctRate
      }
      if (b.totalAttempts !== a.totalAttempts) {
        return b.totalAttempts - a.totalAttempts
      }
      return a.chapterTitle.localeCompare(b.chapterTitle, 'zh-Hans-CN')
    })
    .slice(0, 6)

  return {
    status: weaknessItems.length > 0 ? 'ready' : 'empty',
    items: weaknessItems,
    note:
      weaknessItems.length === 0
        ? '当前没有达到薄弱点阈值的章节，或样本量不足。'
        : undefined,
  }
}

function buildLearningPath(
  subjectResults: SubjectChaptersResult[]
): DashboardData['learningPath'] {
  const activeSubjects = subjectResults
    .map((result) => ({
      ...result,
      totalAttempts: result.chapters.reduce(
        (sum, chapter) => sum + chapter.stats.totalAttempts,
        0
      ),
    }))
    .filter((result) => result.totalAttempts > 0 && result.chapters.length > 0)
    .sort((a, b) => {
      if (b.totalAttempts !== a.totalAttempts) {
        return b.totalAttempts - a.totalAttempts
      }
      return a.subjectName.localeCompare(b.subjectName, 'zh-Hans-CN')
    })

  if (activeSubjects.length === 0) {
    return {
      status: 'empty',
      items: [],
      note: '完成首次练习后，这里会出现章节推荐和下一步建议。',
    }
  }

  const candidates: Array<
    DashboardData['learningPath']['items'][number] & {
      priority: number
      subjectRank: number
      chapterOrder: number
    }
  > = []

  activeSubjects.forEach((result, subjectRank) => {
    const chapters = [...result.chapters].sort((a, b) => a.order - b.order)
    const attemptedChapters = chapters.filter(
      (chapter) => chapter.stats.totalAttempts > 0
    )

    if (attemptedChapters.length === 0) {
      return
    }

    const weakestChapter = [...attemptedChapters]
      .filter(
        (chapter) =>
          chapter.stats.totalAttempts >= 5 && chapter.stats.masteryLevel < 70
      )
      .sort((a, b) => {
        if (a.stats.masteryLevel !== b.stats.masteryLevel) {
          return a.stats.masteryLevel - b.stats.masteryLevel
        }
        if (b.stats.totalAttempts !== a.stats.totalAttempts) {
          return b.stats.totalAttempts - a.stats.totalAttempts
        }
        return a.order - b.order
      })[0]

    const lastAttemptedOrder = attemptedChapters.reduce(
      (maxOrder, chapter) => Math.max(maxOrder, chapter.order),
      -1
    )
    const nextChapter = chapters.find(
      (chapter) =>
        chapter.order > lastAttemptedOrder &&
        chapter.stats.questionCount > 0 &&
        chapter.stats.totalAttempts === 0
    )
    const reviewChapter = [...attemptedChapters].sort((a, b) => {
      if (a.stats.masteryLevel !== b.stats.masteryLevel) {
        return a.stats.masteryLevel - b.stats.masteryLevel
      }
      if (b.stats.totalAttempts !== a.stats.totalAttempts) {
        return b.stats.totalAttempts - a.stats.totalAttempts
      }
      return a.order - b.order
    })[0]

    if (weakestChapter) {
      const weakRate =
        weakestChapter.stats.monthlyCorrectRate ??
        weakestChapter.stats.recentCorrectRate ??
        weakestChapter.stats.masteryLevel

      candidates.push({
        id: weakestChapter.id,
        chapterId: weakestChapter.id,
        subjectId: result.subjectId,
        title: weakestChapter.title,
        subject: result.subjectName,
        reason: `优先补弱 · 近阶段正确率 ${weakRate}%`,
        href: `/dashboard/practice/chapter-drill/${weakestChapter.id}?autostart=1`,
        recommendationType: 'weakness',
        progress: weakestChapter.stats.masteryLevel,
        priority: 0,
        subjectRank,
        chapterOrder: weakestChapter.order,
      })
    }

    if (nextChapter) {
      candidates.push({
        id: `${result.subjectId}:${nextChapter.id}:next`,
        chapterId: nextChapter.id,
        subjectId: result.subjectId,
        title: nextChapter.title,
        subject: result.subjectName,
        reason: '继续推进 · 下一章建议直接开练',
        href: `/dashboard/practice/chapter-drill/${nextChapter.id}?autostart=1`,
        recommendationType: 'next',
        progress: 0,
        priority: 1,
        subjectRank,
        chapterOrder: nextChapter.order,
      })
    }

    if (!weakestChapter && !nextChapter && reviewChapter) {
      candidates.push({
        id: `${result.subjectId}:${reviewChapter.id}:review`,
        chapterId: reviewChapter.id,
        subjectId: result.subjectId,
        title: reviewChapter.title,
        subject: result.subjectName,
        reason:
          reviewChapter.stats.masteryLevel >= 80
            ? '稳定巩固 · 保持这一章的熟练度'
            : `继续巩固 · 当前掌握度 ${reviewChapter.stats.masteryLevel}%`,
        href: `/dashboard/practice/chapter-drill/${reviewChapter.id}?autostart=1`,
        recommendationType: 'review',
        progress: reviewChapter.stats.masteryLevel,
        priority: 2,
        subjectRank,
        chapterOrder: reviewChapter.order,
      })
    }
  })

  const dedupedItems = candidates
    .sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority
      }
      if (a.subjectRank !== b.subjectRank) {
        return a.subjectRank - b.subjectRank
      }
      return a.chapterOrder - b.chapterOrder
    })
    .filter(
      (candidate, index, allCandidates) =>
        allCandidates.findIndex(
          (item) => item.chapterId === candidate.chapterId
        ) === index
    )
    .slice(0, 4)
    .map(({ priority, subjectRank, chapterOrder, ...item }) => item)

  return {
    status: dedupedItems.length > 0 ? 'ready' : 'empty',
    items: dedupedItems,
    note:
      dedupedItems.length === 0
        ? '当前没有可推荐的章节练习，请先到练习中心完成一次答题。'
        : undefined,
  }
}

function bucketDifficulty(
  values: number[]
): DashboardData['recentPractice']['items'][number]['difficulty'] {
  if (values.length === 0) return null

  const average =
    values.reduce((sum, difficulty) => sum + difficulty, 0) / values.length

  if (average <= 2) return 'EASY'
  if (average >= 4) return 'HARD'
  return 'MEDIUM'
}

function parseMockExamDifficulty(
  title: string | null | undefined
): DashboardData['recentPractice']['items'][number]['difficulty'] {
  if (!title) return null
  const matched = title.match(/\b(EASY|MEDIUM|HARD)\b/i)
  if (!matched) return null
  const normalized = matched[1].toUpperCase()
  return normalized === 'EASY' || normalized === 'MEDIUM' || normalized === 'HARD'
    ? normalized
    : null
}

function buildRecentPracticeHref(input: {
  mode: PracticeMode
  subjectId: string | null
  chapterId: string | null
  paperId: string | null
  difficulty: DashboardData['recentPractice']['items'][number]['difficulty']
  questionCount: number
}): string {
  const { mode, subjectId, chapterId, paperId, difficulty, questionCount } = input

  switch (mode) {
    case 'SMART_DRILL':
      return subjectId
        ? `/dashboard/practice/smart-drill?subjectId=${encodeURIComponent(subjectId)}&autostart=1`
        : '/dashboard/practice'
    case 'ERROR_WIPER':
      return subjectId
        ? `/dashboard/practice/error-wiper?subjectId=${encodeURIComponent(subjectId)}&autostart=1`
        : '/dashboard/practice/error-wiper'
    case 'MOCK_EXAM': {
      if (!subjectId) return '/dashboard/practice/mock-arena'

      const params = new URLSearchParams({
        subjectId,
        autostart: '1',
      })
      if (difficulty) {
        params.set('difficulty', difficulty)
      }
      if (questionCount > 0) {
        params.set('questionCount', String(questionCount))
      }
      return `/dashboard/practice/mock-arena?${params.toString()}`
    }
    case 'CHAPTER_DRILL':
      return chapterId
        ? `/dashboard/practice/chapter-drill/${chapterId}?autostart=1`
        : subjectId
          ? `/dashboard/practice?subjectId=${encodeURIComponent(subjectId)}`
          : '/dashboard/practice'
    case 'PAST_PAPER':
      return paperId
        ? `/dashboard/practice/past-paper/${paperId}${subjectId ? `?subjectId=${encodeURIComponent(subjectId)}&autostart=1` : '?autostart=1'}`
        : subjectId
          ? `/dashboard/practice?subjectId=${encodeURIComponent(subjectId)}`
          : '/dashboard/practice'
    default:
      return '/dashboard/practice'
  }
}

async function buildLeaderboardCard(
  user: Awaited<ReturnType<typeof getCurrentUser>>,
  userAccuracy: number,
  minDate: Date
): Promise<DashboardLeaderboardModule> {
  const startedAt = performance.now()
  if (!user?.grade) {
    logPerf('buildLeaderboardCard', startedAt, {
      userId: user?.id ?? null,
      status: 'excluded',
    })
    return {
      status: 'excluded',
      percentile: null,
      peerAverageAccuracy: null,
      userAccuracy,
      note: '缺少年级资料，当前无法参与同年级排行榜。',
    }
  }

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const entriesStartedAt = performance.now()
  const cohortEntries = await prisma.leaderboardEntry.findMany({
    where: {
      period: LeaderboardPeriod.WEEKLY,
      weekStart,
      user: {
        grade: user.grade,
        role: UserRole.STUDENT,
        status: UserAccountStatus.ACTIVE,
      },
    },
    orderBy: { score: 'desc' },
    select: {
      userId: true,
      score: true,
    },
  })
  logPerf('buildLeaderboardCard.entries', entriesStartedAt, {
    userId: user.id,
    cohortSize: cohortEntries.length,
  })

  if (cohortEntries.length === 0) {
    return {
      status: 'empty',
      percentile: null,
      peerAverageAccuracy: null,
      userAccuracy,
      note: '当前周榜还没有同年级数据。',
    }
  }

  const userRankIndex = cohortEntries.findIndex(
    (entry) => entry.userId === user.id
  )

  if (userRankIndex === -1) {
    return {
      status: 'empty',
      percentile: null,
      peerAverageAccuracy: null,
      userAccuracy,
      note: '完成一组练习并获得 XP 后即可进入同年级排行榜。',
    }
  }

  const cohortUserIds = cohortEntries.map((entry) => entry.userId)
  const statsStartedAt = performance.now()
  const cohortAttemptStats = await prisma.userAttempt.groupBy({
    by: ['userId', 'isCorrect'],
    where: {
      userId: { in: cohortUserIds },
      createdAt: { gte: minDate },
    },
    _count: {
      _all: true,
    },
  })
  logPerf('buildLeaderboardCard.attemptStats', statsStartedAt, {
    userId: user.id,
    cohortSize: cohortUserIds.length,
    rows: cohortAttemptStats.length,
  })

  const attemptsByUser = new Map<string, { total: number; correct: number }>()
  for (const stat of cohortAttemptStats) {
    const existing = attemptsByUser.get(stat.userId) ?? { total: 0, correct: 0 }
    existing.total += stat._count._all
    if (stat.isCorrect) {
      existing.correct += stat._count._all
    }
    attemptsByUser.set(stat.userId, existing)
  }

  const peerAccuracies = Array.from(attemptsByUser.values())
    .filter((entry) => entry.total > 0)
    .map((entry) => Math.round((entry.correct / entry.total) * 100))

  const peerAverageAccuracy =
    peerAccuracies.length > 0
      ? Math.round(
          peerAccuracies.reduce((sum, value) => sum + value, 0) /
            peerAccuracies.length
        )
      : null

  return {
    status: 'ready',
    percentile: Math.max(
      1,
      Math.round(((userRankIndex + 1) / cohortEntries.length) * 100)
    ),
    peerAverageAccuracy,
    userAccuracy,
    note: `当前同年级周榜共有 ${cohortEntries.length} 位学生。`,
  }
}

export async function getDashboardStats(): Promise<DashboardData | null> {
  const startedAt = performance.now()
  const user = await getCurrentUser()
  if (!user) {
    logPerf('getDashboardStats', startedAt, { status: 'no-user' })
    return null
  }

  const ensureStartedAt = performance.now()
  runAfterTask(async () => {
    await ensureDailyTasks(user.id)
  }, 'dashboard-ensure-daily-tasks')
  logPerf('getDashboardStats.ensureDailyTasks.scheduled', ensureStartedAt, {
    userId: user.id,
  })

  const tier = getEffectiveTier(user as UserWithOverrides)
  const minDate = getRetentionDate(tier)
  const today = dayjs().startOf('day')
  const nextDay = dayjs().startOf('day').add(1, 'day')
  const thirtyDaysAgo = dayjs().subtract(30, 'day').startOf('day').toDate()
  const sevenDaysAgo = dayjs().subtract(7, 'day').startOf('day').toDate()

  const dailyTasksStartedAt = performance.now()
  const dailyTasks = await prisma.dailyTask.findMany({
    where: {
      userId: user.id,
      date: {
        gte: today.toDate(),
        lt: nextDay.toDate(),
      },
    },
    orderBy: { type: 'asc' },
  })
  logPerf('getDashboardStats.dailyTasks', dailyTasksStartedAt, {
    userId: user.id,
    rows: dailyTasks.length,
  })

  const attemptsStartedAt = performance.now()
  const attemptsInRetention = await prisma.userAttempt.findMany({
    where: {
      userId: user.id,
      createdAt: { gte: minDate },
    },
    select: {
      createdAt: true,
      isCorrect: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  logPerf('getDashboardStats.attemptsInRetention', attemptsStartedAt, {
    userId: user.id,
    rows: attemptsInRetention.length,
  })

  const examRecordsStartedAt = performance.now()
  const examRecordsInRetention = await prisma.examRecord.findMany({
    where: {
      userId: user.id,
      createdAt: { gte: minDate },
    },
    select: {
      createdAt: true,
      duration: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  logPerf('getDashboardStats.examRecordsInRetention', examRecordsStartedAt, {
    userId: user.id,
    rows: examRecordsInRetention.length,
  })

  const completedLessonsStartedAt = performance.now()
  const completedLessonsInRetention = await prisma.userProgress.findMany({
    where: {
      userId: user.id,
      isCompleted: true,
      updatedAt: { gte: minDate },
    },
    select: {
      updatedAt: true,
    },
    orderBy: { updatedAt: 'desc' },
  })
  logPerf('getDashboardStats.completedLessonsInRetention', completedLessonsStartedAt, {
    userId: user.id,
    rows: completedLessonsInRetention.length,
  })

  const recentPracticeStartedAt = performance.now()
  const recentPractice = await prisma.examRecord.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      subject: {
        select: {
          name: true,
        },
      },
      attempts: {
        select: {
          question: {
            select: {
              chapterId: true,
              paperId: true,
              difficulty: true,
            },
          },
        },
      },
    },
  })
  logPerf('getDashboardStats.recentPractice', recentPracticeStartedAt, {
    userId: user.id,
    rows: recentPractice.length,
  })

  const subjectResultsStartedAt = performance.now()
  const subjectResults = await loadDashboardSubjectResults(user.id)
  logPerf('getDashboardStats.subjectResults', subjectResultsStartedAt, {
    userId: user.id,
    subjects: subjectResults.length,
  })

  const totalAttempts = attemptsInRetention.length
  const correctAttempts = attemptsInRetention.filter((attempt) => attempt.isCorrect).length
  const mistakeCount = totalAttempts - correctAttempts
  const accuracy =
    totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0
  const leaderboardStartedAt = performance.now()
  const leaderboardData = await buildLeaderboardCard(user, accuracy, minDate)
  logPerf('getDashboardStats.leaderboard', leaderboardStartedAt, {
    userId: user.id,
    status: leaderboardData.status,
  })
  const studyHours = formatHours(sumStudySeconds(examRecordsInRetention))
  const level = calculateLevel(user.xp ?? 0)
  const nextLevelXp = calculateNextLevelXp(level)
  const activityEvents = buildActivityEvents({
    examRecords: examRecordsInRetention,
    completedLessons: completedLessonsInRetention,
  })
  const recentPracticeItems = recentPractice.map((record) => {
    const attemptQuestions = record.attempts.map((attempt) => attempt.question)
    const chapterId =
      record.chapterId ?? attemptQuestions.find((question) => question.chapterId)?.chapterId ?? null
    const paperId =
      attemptQuestions.find((question) => question.paperId)?.paperId ?? null
    const derivedDifficulty = bucketDifficulty(
      attemptQuestions
        .map((question) => question.difficulty)
        .filter((difficulty): difficulty is number => Number.isInteger(difficulty))
    )
    const difficulty =
      record.mode === 'MOCK_EXAM'
        ? parseMockExamDifficulty(record.title) ?? derivedDifficulty
        : derivedDifficulty

    return {
      id: record.id,
      title: record.title || '未命名练习',
      subject: record.subject?.name ?? '未分类',
      subjectId: record.subjectId ?? null,
      mode: record.mode,
      href: buildRecentPracticeHref({
        mode: record.mode,
        subjectId: record.subjectId ?? null,
        chapterId,
        paperId,
        difficulty,
        questionCount: record.totalQuestions,
      }),
      chapterId,
      paperId,
      difficulty,
      questionCount: record.totalQuestions,
      score: Math.round(record.score),
      totalQuestions: record.totalQuestions,
      correctCount: record.correctCount,
      duration: record.duration,
      createdAt: record.createdAt,
    }
  })
  const result: DashboardData = {
    stats: {
      studyTime: studyHours,
      questions: totalAttempts,
      accuracy,
      mistakes: mistakeCount,
      streak: user.streak ?? 0,
      level,
      xp: user.xp ?? 0,
      nextLevelXp,
    },
    overviewByWindow: {
      '7D': buildOverviewWindow(
        attemptsInRetention,
        examRecordsInRetention,
        activityEvents,
        sevenDaysAgo
      ),
      '30D': buildOverviewWindow(
        attemptsInRetention,
        examRecordsInRetention,
        activityEvents,
        thirtyDaysAgo
      ),
    },
    learningPath: buildLearningPath(subjectResults),
    recentPractice: {
      status: recentPracticeItems.length > 0 ? 'ready' : 'empty',
      items: recentPracticeItems,
    },
    subjectProgress: buildSubjectProgress(subjectResults),
    dailyTasks: {
      status: dailyTasks.length > 0 ? 'ready' : 'empty',
      items: dailyTasks,
    },
    weaknesses: buildWeaknesses(subjectResults),
    leaderboard: leaderboardData,
  }
  logPerf('getDashboardStats.total', startedAt, {
    userId: user.id,
    subjectCount: subjectResults.length,
    dailyTaskCount: dailyTasks.length,
  })
  return result
}
