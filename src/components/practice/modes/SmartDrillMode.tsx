'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ContentStatus, QuestionType } from '@prisma/client'
import { getSmartDrillQuestions } from '@/actions/practice/recommendation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, ArrowRight, BrainCircuit, Clock3, Radar, RefreshCcw, Sparkles, Target } from 'lucide-react'
import { PracticeModeShell } from '@/components/practice/modes/shared/PracticeModeShell'
import { PracticeHeader } from '@/components/practice/modes/shared/PracticeHeader'
import { PracticeEmptyState } from '@/components/practice/modes/shared/PracticeEmptyState'
import SmartDrillContinuousSession from '@/components/practice/modes/SmartDrillContinuousSession'
import type { TierKey } from '@/lib/permissions/types'
import type { PracticeQuestionRecord } from '@/lib/practice/question-groups'

interface SmartDrillSessionProps {
  userId: string
  subjectId: string
  enableMockPreview?: boolean
  autoStart?: boolean
  userTier?: TierKey
}

function createMockQuestion(
  overrides: Partial<PracticeQuestionRecord> &
    Pick<PracticeQuestionRecord, 'id' | 'content' | 'type' | 'answer'>
): PracticeQuestionRecord {
  const {
    id,
    type,
    content,
    answer,
    ...restOverrides
  } = overrides

  return {
    id,
    curriculum: 'UEC',
    grade: 8,
    chapterId: 'mock-smart-chapter',
    subjectId: 'mock-smart-subject',
    groupId: null,
    difficulty: 3,
    type,
    content,
    options: null,
    answer,
    explanation: overrides.explanation ?? '这是一条用于 Smart Drill 视觉预览的 mock 解析。',
    contentHash: null,
    createdAt: new Date('2026-03-11T00:00:00.000Z'),
    createdBy: null,
    reviewedAt: new Date('2026-03-11T00:00:00.000Z'),
    reviewedBy: null,
    publishedAt: new Date('2026-03-11T00:00:00.000Z'),
    publishedBy: null,
    qualityScore: 92,
    reportCount: 0,
    status: ContentStatus.PUBLISHED,
    updatedAt: new Date('2026-03-11T00:00:00.000Z'),
    sourceFileId: null,
    assetUrl: null,
    imageUrls: [],
    source: 'Smart Drill Mock Preview',
    tags: ['smart-drill', 'mock-preview'],
    isPastPaper: false,
    paperId: null,
    deletedAt: null,
    deletedBy: null,
    deleteReason: null,
    group: null,
    ...restOverrides,
  }
}

const MOCK_SMART_DRILL_QUESTIONS: PracticeQuestionRecord[] = [
  createMockQuestion({
    id: 'mock-smart-1',
    type: QuestionType.SINGLE_CHOICE,
    content: '已知函数 `f(x)=2x+3`，那么 `f(4)` 的值是？',
    options: {
      A: '9',
      B: '10',
      C: '11',
      D: '12',
    },
    answer: 'C',
    explanation: '代入 `x=4` 得 `2(4)+3=11`，所以答案是 C。',
    difficulty: 2,
    chapterId: 'mock-linear-functions',
  }),
  createMockQuestion({
    id: 'mock-smart-2',
    type: QuestionType.MULTIPLE_CHOICE,
    content: '下列哪些式子是二次表达式？',
    options: {
      A: '`x^2 + 1`',
      B: '`3x + 2`',
      C: '`2x^2 - x`',
      D: '`7`',
    },
    answer: ['A', 'C'],
    explanation: '二次表达式最高次幂为 2，因此 A 和 C 符合。',
    difficulty: 3,
    chapterId: 'mock-quadratic',
  }),
  createMockQuestion({
    id: 'mock-smart-3',
    type: QuestionType.FILL_BLANK,
    content: '若直角三角形两条直角边分别为 3 和 4，则斜边长为 ____ 。',
    answer: '5',
    explanation: '根据勾股定理：`3^2 + 4^2 = 5^2`。',
    difficulty: 2,
    chapterId: 'mock-geometry',
  }),
  createMockQuestion({
    id: 'mock-smart-4',
    type: QuestionType.SINGLE_CHOICE,
    content: '一次方程 `3x-6=9` 的解是？',
    options: {
      A: '`x=3`',
      B: '`x=4`',
      C: '`x=5`',
      D: '`x=6`',
    },
    answer: 'C',
    explanation: '移项得 `3x=15`，所以 `x=5`。',
    difficulty: 2,
    chapterId: 'mock-linear-equations',
  }),
  createMockQuestion({
    id: 'mock-smart-5',
    type: QuestionType.SINGLE_CHOICE,
    content: '一组数据 `2, 4, 4, 5, 7` 的平均数是？',
    options: {
      A: '4',
      B: '4.2',
      C: '4.4',
      D: '4.6',
    },
    answer: 'C',
    explanation: '总和为 `22`，共有 5 个数，所以平均数为 `22/5=4.4`。',
    difficulty: 3,
    chapterId: 'mock-statistics',
  }),
]

export default function SmartDrillSession({ userId, subjectId, enableMockPreview = false, autoStart = false, userTier = 'STARTER' }: SmartDrillSessionProps) {
  const router = useRouter()
  const practiceCenterHref = `/dashboard/practice?subjectId=${encodeURIComponent(subjectId)}`
  const [questions, setQuestions] = useState<PracticeQuestionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [sessionVersion, setSessionVersion] = useState(0)
  const [previewMode, setPreviewMode] = useState(enableMockPreview)

  useEffect(() => {
    let isMounted = true

    async function fetchQuestions() {
      if (previewMode) {
        setLoading(false)
        setError(null)
        setHasStarted(false)
        setQuestions(MOCK_SMART_DRILL_QUESTIONS)
        return
      }

      try {
        setLoading(true)
        setError(null)
        setHasStarted(false)
        const data = await getSmartDrillQuestions(userId, subjectId, 10)

        if (!isMounted) return

        if (!data || data.length === 0) {
          setQuestions([])
          setError('No questions found for this subject. Try picking a different subject or difficulty.')
        } else {
          setQuestions(data)
        }
      } catch (err) {
        if (!isMounted) return
        setQuestions([])
        setError(`Failed to load questions: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchQuestions()

    return () => { isMounted = false }
  }, [userId, subjectId, sessionVersion, previewMode])

  useEffect(() => {
    if (!autoStart) return
    if (loading || error || questions.length === 0) return
    setHasStarted(true)
  }, [autoStart, loading, error, questions.length])

  const estimatedMinutes = useMemo(() => Math.max(6, Math.round(questions.length * 1.2)), [questions.length])
  const chapterCoverageCount = useMemo(() => {
    const chapterIds = new Set(questions.map(question => question.chapterId).filter(Boolean))
    return chapterIds.size
  }, [questions])
  const averageDifficulty = useMemo(() => {
    if (questions.length === 0) return 0
    const difficultySum = questions.reduce((sum, question) => sum + (question.difficulty ?? 0), 0)
    return Math.round((difficultySum / questions.length) * 10) / 10
  }, [questions])
  const trainingFocusLabel = averageDifficulty >= 4
    ? 'Higher intensity'
    : averageDifficulty >= 2.5
      ? 'Balanced difficulty'
      : 'Warm-up intensity'

  const handleRefreshPack = () => {
    if (previewMode) {
      setQuestions(MOCK_SMART_DRILL_QUESTIONS)
      setHasStarted(false)
      return
    }
    setSessionVersion(prev => prev + 1)
  }

  if (loading) {
    return (
      <PracticeModeShell maxWidthClassName="max-w-4xl">
        <div className="space-y-4">
          <Skeleton className="h-[260px] w-full rounded-[30px]" />
          <div className="grid gap-4 tablet:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-[132px] w-full rounded-[26px]" />
            ))}
          </div>
          <Skeleton className="h-[380px] w-full rounded-[28px]" />
        </div>
      </PracticeModeShell>
    )
  }

  if (error) {
    return (
      <PracticeModeShell maxWidthClassName="max-w-4xl">
        <PracticeEmptyState
          theme="cyan"
          icon={AlertCircle}
          title="当前无法生成 Smart Drill 题组"
          description={error}
          primaryActionLabel={previewMode ? '重新加载 Mock 题组' : '查看 Mock 渲染'}
          primaryAction={() => {
            if (previewMode) {
              handleRefreshPack()
              return
            }
            setPreviewMode(true)
            setHasStarted(false)
          }}
          secondaryActionLabel="返回练习中心"
          secondaryAction={() => router.push(practiceCenterHref)}
          tertiaryActionLabel={previewMode ? '切回真实题组' : '刷新推荐题组'}
          tertiaryAction={() => {
            if (previewMode) {
              setPreviewMode(false)
              setHasStarted(false)
              return
            }
            handleRefreshPack()
          }}
        />
      </PracticeModeShell>
    )
  }

  if (!hasStarted) {
    return (
      <PracticeModeShell maxWidthClassName="max-w-4xl">
        <PracticeHeader
          theme="cyan"
          badge={previewMode ? 'Smart Drill Mock Preview' : 'Smart Drill Setup'}
          title={previewMode ? 'Smart Drill 视觉预览题组' : '开启一轮个性化精准训练'}
          description={
            previewMode
              ? '当前展示的是本地 mock 题组，用来预览 Smart Drill 的启动页、做题页和结果页效果，不会写入正式训练记录。'
              : '这组题会优先覆盖近期薄弱章节，并补充一部分未做过的新题，适合在进入章节训练或模拟考试前快速校准状态。'
          }
          icon={Radar}
          stats={[
            { label: 'Questions', value: questions.length, icon: Target },
            { label: 'Estimate', value: `${estimatedMinutes} min`, icon: Clock3 },
            { label: 'Focus', value: trainingFocusLabel, icon: BrainCircuit },
          ]}
        >
          <div className="grid gap-4 tablet:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-300/80">Why this pack</div>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                {previewMode ? (
                  <>
                    <li>覆盖单选、多选、填空三种常见题型。</li>
                    <li>模拟不同章节与不同难度，方便看布局层次。</li>
                    <li>结果页会保留本地成绩，但不会提交正式记录。</li>
                  </>
                ) : (
                  <>
                    <li>优先收口最近答错较多的章节。</li>
                    <li>补充新题，避免只在旧题上形成错觉熟练。</li>
                    <li>题目数量控制在一轮可完成的长度，适合高频复训。</li>
                  </>
                )}
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-300/80">Coverage</div>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="flex items-center justify-between">
                  <span>章节覆盖</span>
                  <span className="font-bold text-white">{chapterCoverageCount || 1} 个章节</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>平均难度</span>
                  <span className="font-bold text-white">{averageDifficulty || '--'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>推荐节奏</span>
                  <span className="font-bold text-white">{previewMode ? '统一答题页完整走一轮' : '整组完成后一次性交卷'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button className="rounded-2xl bg-cyan-400 px-5 py-6 text-sm font-black text-slate-950 hover:bg-cyan-300" onClick={() => setHasStarted(true)}>
              {previewMode ? '开始 Mock 预览' : '开始 Smart Drill'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" className="rounded-2xl border-white/10 bg-white/5 px-5 py-6 text-white hover:bg-white/10 hover:text-white" onClick={handleRefreshPack}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              {previewMode ? '重置 Mock 题组' : '刷新推荐题组'}
            </Button>
            <Button
              variant="ghost"
              className="rounded-2xl px-5 py-6 text-white/80 hover:bg-white/8 hover:text-white"
              onClick={() => {
                setPreviewMode((prev) => !prev)
                setHasStarted(false)
              }}
            >
              {previewMode ? '切回真实题组' : '查看 Mock 渲染'}
            </Button>
          </div>
        </PracticeHeader>

        <div className="grid gap-4 tablet:grid-cols-3">
          <Card className="rounded-[26px] border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-5">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">Recommended Use</div>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {previewMode ? '适合快速看启动页的密度、卡片层次和首屏信息排布。' : '适合日常训练开场、刷完章节后的快速校准，以及模拟前的短时热身。'}
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-[26px] border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-5">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">Feedback Rhythm</div>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {previewMode ? '预览时也能完整走做题流程，方便直接看统一答题页、右侧状态栏和结果页的质感。' : '整组题会全部铺开，用户可以顺着往下做，最后一次性交卷，避免频繁切页。'}
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-[26px] border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">
                <Sparkles className="h-3.5 w-3.5" />
                Outcome
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {previewMode ? '结果页会显示本地成绩、题目分布和教练建议，但不会写入正式训练记录。' : '结束后会保存本轮正确率，并给出继续加练还是切到其他模式的建议。'}
              </p>
            </CardContent>
          </Card>
        </div>
      </PracticeModeShell>
    )
  }

  return (
    <PracticeModeShell maxWidthClassName="max-w-[1680px]">
      <SmartDrillContinuousSession
        key={`${subjectId}-${sessionVersion}-${previewMode ? 'preview' : 'live'}`}
        questions={questions}
        userId={userId}
        subjectId={subjectId}
        title="Smart Drill"
        persistSession={!previewMode}
        previewMode={previewMode}
        userTier={userTier}
        onRestart={() => {
          setHasStarted(false)
        }}
        onExit={() => router.push(practiceCenterHref)}
      />
    </PracticeModeShell>
  )
}
