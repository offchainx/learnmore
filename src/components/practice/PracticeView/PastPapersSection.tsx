import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronRight, FileText, FileX2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  pageCardTitleClass,
  pageHeroEyebrowClass,
  pageKickerMutedClass,
  pageMetaTextClass,
} from '@/components/shared/pageTypography'
import { PageEmptyState } from '@/components/shared/PageEmptyState'
import type { DbPastPaper } from './types'

interface PastPaperLibrarySectionProps {
  selectedSubjectId: string
  papers: DbPastPaper[]
  isLoading: boolean
  onPreviewPaper?: (paper: DbPastPaper) => void
}

const PAPERS_PER_PAGE = 4

export const PastPaperLibrarySection: React.FC<
  PastPaperLibrarySectionProps
> = ({ selectedSubjectId, papers, isLoading, onPreviewPaper }) => {
  const router = useRouter()
  const [page, setPage] = useState(0)
  const hasRealPapers = papers.length > 0

  const totalPages = Math.max(
    1,
    Math.ceil(papers.length / PAPERS_PER_PAGE)
  )
  const visiblePapers = useMemo(
    () => papers.slice(page * PAPERS_PER_PAGE, (page + 1) * PAPERS_PER_PAGE),
    [papers, page]
  )

  useEffect(() => {
    setPage(0)
  }, [papers.length])

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
            {papers.length} 套试卷
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
          !hasRealPapers ? (
            <PageEmptyState
              icon={FileX2}
              title="当前科目还没有可用真题"
              description="真题库接通后，这里只会显示数据库中的真实试卷。当前不再注入 mock 真题列表。"
              className="rounded-[24px] border border-dashed border-sky-200 bg-sky-50/70 px-5 py-7 dark:border-sky-900/40 dark:bg-sky-950/10"
              iconContainerClassName="border-sky-200 bg-white text-sky-600 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-300"
              titleClassName="text-base text-sky-900 dark:text-sky-100"
              descriptionClassName="max-w-lg text-xs leading-6 text-sky-700 dark:text-sky-200"
            />
          ) : (
            <div className="space-y-3" onWheel={handleWheel}>
              {visiblePapers.map((paper) => (
                <div
                  key={paper.id}
                  className="group flex items-center justify-between rounded-[22px] border border-slate-200/80 bg-slate-50/90 p-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_18px_34px_rgba(14,165,233,0.12)] dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-900"
                  onClick={() => {
                    if (onPreviewPaper) {
                      onPreviewPaper(paper)
                      return
                    }
                    handleStart(paper.id)
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
                        {paper.questionCount} 题
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-slate-400 group-hover:text-blue-500"
                    onClick={(event) => {
                      event.stopPropagation()
                      if (onPreviewPaper) {
                        onPreviewPaper(paper)
                        return
                      }
                      handleStart(paper.id)
                    }}
                  >
                    开始
                    <ChevronRight className="ml-1 h-4 w-4" />
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
          )
        )}
      </div>
    </div>
  )
}
