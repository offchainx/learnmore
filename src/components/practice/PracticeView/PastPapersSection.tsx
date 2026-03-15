import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronRight, FileText, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  pageCardTitleClass,
  pageHeroEyebrowClass,
  pageKickerMutedClass,
  pageMetaTextClass,
} from '@/components/shared/pageTypography'
import type { DbPastPaper } from './types'

interface PastPaperLibrarySectionProps {
  selectedSubjectId: string
  papers: DbPastPaper[]
  isLoading: boolean
  onPreviewPaper?: (paper: DbPastPaper) => void
}

const PAPERS_PER_PAGE = 4
const MOCK_PAPERS: DbPastPaper[] = [
  {
    id: 'mock-paper-1',
    title: '2024 数学模拟卷',
    sourcePaper: '模拟卷',
    sourceYear: 2024,
    questionCount: 40,
    status: 'PREVIEW',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-paper-2',
    title: '2023 年中评估卷',
    sourcePaper: '校内卷',
    sourceYear: 2023,
    questionCount: 35,
    status: 'PREVIEW',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-paper-3',
    title: '历年真题冲刺组',
    sourcePaper: '题库归档',
    sourceYear: 2022,
    questionCount: 25,
    status: 'PREVIEW',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-paper-4',
    title: '2021 真题热身卷',
    sourcePaper: '公开题库',
    sourceYear: 2021,
    questionCount: 30,
    status: 'PREVIEW',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-paper-5',
    title: '2020 冲刺卷',
    sourcePaper: '题库归档',
    sourceYear: 2020,
    questionCount: 28,
    status: 'PREVIEW',
    updatedAt: new Date().toISOString(),
  },
]

export const PastPaperLibrarySection: React.FC<
  PastPaperLibrarySectionProps
> = ({ selectedSubjectId, papers, isLoading, onPreviewPaper }) => {
  const router = useRouter()
  const hasMockPreview = !isLoading && papers.length === 0
  const displayPapers = hasMockPreview ? MOCK_PAPERS : papers
  const [page, setPage] = useState(0)

  const totalPages = Math.max(
    1,
    Math.ceil(displayPapers.length / PAPERS_PER_PAGE)
  )
  const visiblePapers = useMemo(
    () =>
      displayPapers.slice(page * PAPERS_PER_PAGE, (page + 1) * PAPERS_PER_PAGE),
    [displayPapers, page]
  )

  useEffect(() => {
    setPage(0)
  }, [displayPapers.length])

  const handleStart = (paperId: string) => {
    router.push(
      `/dashboard/practice/past-paper/${paperId}?subjectId=${selectedSubjectId}`
    )
  }

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (totalPages <= 1) return
    event.preventDefault()
    const direction = event.deltaY > 0 ? 1 : -1
    setPage((prev) => Math.max(0, Math.min(totalPages - 1, prev + direction)))
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div
            className={cn(
              pageHeroEyebrowClass,
              'inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300'
            )}
          >
            <FileText className="h-3.5 w-3.5" />
            历年真题
          </div>
          <p
            className={cn(
              pageMetaTextClass,
              'mt-2 max-w-xl text-slate-600 dark:text-slate-300'
            )}
          >
            默认展示 4 条，滚动滑鼠滚轮可一次切换下一组真题。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: totalPages }).map((_, index) => (
              <span
                key={index}
                className={`h-1.5 rounded-full transition-all ${index === page ? 'w-4 bg-slate-900 dark:bg-white' : 'w-1.5 bg-slate-300 dark:bg-slate-700'}`}
              />
            ))}
          </div>
          <div
            className={cn(
              pageHeroEyebrowClass,
              'rounded-full bg-slate-100 px-3 py-1 text-slate-500 dark:bg-slate-900 dark:text-slate-400'
            )}
          >
            {displayPapers.length} 套试卷
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {isLoading && (
          <div className="flex items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-slate-50/90 py-10 text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            正在载入真题库...
          </div>
        )}

        {!isLoading && (
          <div className="space-y-3" onWheel={handleWheel}>
            {visiblePapers.map((paper) => (
              <div
                key={paper.id}
                className="group flex items-center justify-between rounded-[22px] border border-slate-200/80 bg-slate-50/90 p-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_18px_34px_rgba(14,165,233,0.12)] dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-900"
                onClick={() => {
                  if (!hasMockPreview) {
                    if (onPreviewPaper) {
                      onPreviewPaper(paper)
                      return
                    }
                    handleStart(paper.id)
                  }
                }}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div
                      className={cn(
                        pageCardTitleClass,
                        'truncate text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-300'
                      )}
                    >
                      {paper.title}
                    </div>
                    <div
                      className={cn(
                        pageMetaTextClass,
                        'text-slate-500 dark:text-slate-400'
                      )}
                    >
                      {paper.sourceYear ? `${paper.sourceYear} · ` : ''}
                      {paper.sourcePaper ? `${paper.sourcePaper} · ` : ''}
                      {paper.questionCount} 题{hasMockPreview ? ' · 预览' : ''}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={hasMockPreview ? 'outline' : 'ghost'}
                  className="text-slate-400 group-hover:text-blue-500"
                  onClick={(event) => {
                    event.stopPropagation()
                    if (!hasMockPreview) {
                      if (onPreviewPaper) {
                        onPreviewPaper(paper)
                        return
                      }
                      handleStart(paper.id)
                    }
                  }}
                >
                  {hasMockPreview ? '预览' : '开始'}
                  {!hasMockPreview ? (
                    <ChevronRight className="ml-1 h-4 w-4" />
                  ) : null}
                </Button>
              </div>
            ))}
            {visiblePapers.length < PAPERS_PER_PAGE &&
              Array.from({
                length: PAPERS_PER_PAGE - visiblePapers.length,
              }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="flex h-[70px] items-center justify-center rounded-[22px] border border-dashed border-slate-200/80 bg-slate-50/35 dark:border-slate-800/60 dark:bg-slate-900/20"
                >
                  <span className={pageKickerMutedClass}>已到列表底部</span>
                </div>
              ))}
          </div>
        )}

        {hasMockPreview ? (
          <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/80 px-4 py-2.5 text-xs leading-5 text-sky-700 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-200">
            开始做真题后，这里会显示你的真实卷库。当前先用 mock 列表预览排布。
          </div>
        ) : null}
      </div>
    </div>
  )
}
