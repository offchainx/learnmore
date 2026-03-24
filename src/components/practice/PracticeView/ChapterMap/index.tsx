import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Compass } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  pageHeroEyebrowClass,
  pageKickerMutedClass,
  pageMetaTextClass,
} from '@/components/shared/pageTypography'
import { PageEmptyState } from '@/components/shared/PageEmptyState'
import { ChapterCard } from './ChapterCard'
import type { DbChapter } from '../types'

interface ChapterProgressSectionProps {
  chapters: DbChapter[]
  isLoading: boolean
  onPreviewChapter?: (chapter: DbChapter) => void
}

const CHAPTERS_PER_PAGE = 4

export const ChapterProgressSection: React.FC<ChapterProgressSectionProps> = ({
  chapters,
  isLoading,
  onPreviewChapter,
}) => {
  const [page, setPage] = useState(0)
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const hasRealChapters = chapters.length > 0

  const totalPages = Math.max(
    1,
    Math.ceil(chapters.length / CHAPTERS_PER_PAGE)
  )
  const visibleChapters = useMemo(
    () =>
      chapters.slice(
        page * CHAPTERS_PER_PAGE,
        (page + 1) * CHAPTERS_PER_PAGE
      ),
    [chapters, page]
  )

  useEffect(() => {
    setPage(0)
  }, [chapters.length])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const handleWheel = (event: WheelEvent) => {
      if (totalPages <= 1) return

      const direction = event.deltaY > 0 ? 1 : -1
      const nextPage = Math.max(0, Math.min(totalPages - 1, page + direction))

      if (nextPage === page) {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      setPage(nextPage)
    }

    section.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      section.removeEventListener('wheel', handleWheel)
    }
  }, [page, totalPages])

  return (
    <div ref={sectionRef} className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div
            className={cn(
              pageHeroEyebrowClass,
              'inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
            )}
          >
            <Compass className="h-3.5 w-3.5" />
            章节地图
          </div>
          <p
            className={cn(
              pageMetaTextClass,
              'mt-2 max-w-xl text-slate-600 dark:text-slate-300'
            )}
          >
            默认展示 4 条，滚动滑鼠滚轮可一次切换下一组章节。
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
          <span
            className={cn(
              pageHeroEyebrowClass,
              'rounded-full bg-slate-100 px-3 py-1 text-slate-500 dark:bg-slate-900 dark:text-slate-400'
            )}
          >
            {chapters.length} 个章节
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[76px] animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/40"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {!hasRealChapters ? (
            <PageEmptyState
              icon={Compass}
              title="当前科目还没有可用章节练习"
              description="章节数据接通后，这里会展示真实章节掌握度和定向练习入口。当前不再注入 mock 章节。"
              className="rounded-[24px] border border-dashed border-amber-200 bg-amber-50/70 px-5 py-7 dark:border-amber-900/40 dark:bg-amber-950/10"
              iconContainerClassName="border-amber-200 bg-white text-amber-600 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300"
              titleClassName="text-base text-amber-900 dark:text-amber-100"
              descriptionClassName="max-w-lg text-xs leading-6 text-amber-700 dark:text-amber-200"
            />
          ) : (
            <div className="space-y-3">
              {visibleChapters.map((chapter, index) => (
                <div
                  key={chapter.id}
                  className="duration-300 animate-in fade-in slide-in-from-right-4 fill-mode-both"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ChapterCard
                    chapter={chapter}
                    absoluteIndex={page * CHAPTERS_PER_PAGE + index}
                    isPreview={false}
                    onPreview={onPreviewChapter}
                  />
                </div>
              ))}
              {visibleChapters.length < CHAPTERS_PER_PAGE &&
                Array.from({
                  length: CHAPTERS_PER_PAGE - visibleChapters.length,
                }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="flex h-[76px] items-center justify-center rounded-2xl border border-dashed border-slate-200/80 bg-slate-50/35 dark:border-slate-800/60 dark:bg-slate-900/20"
                  >
                    <span className={pageKickerMutedClass}>已到列表底部</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
