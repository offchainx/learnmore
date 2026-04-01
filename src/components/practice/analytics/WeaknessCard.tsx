import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertOctagon, Play } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { PageEmptyState } from '@/components/shared/PageEmptyState'
import { SectionBlockHeader } from '@/components/shared/SectionBlockHeader'
import {
  pageInteractiveRowClass,
  pagePanelClass,
} from '@/components/shared/pageSurfaces'
import {
  pageCardTitleClass,
  pageKickerClass,
  pageMetaTextClass,
} from '@/components/shared/pageTypography'
import {
  pageCardPaddingCompactClass,
  pageListGapClass,
  pageListItemMinHeightClass,
} from '@/components/shared/pageSpacing'
import { useRoutePrefetcher } from '@/lib/hooks'
import type { ChapterWithStats } from '@/lib/practice/types'

interface WeaknessCardProps {
  chapters: ChapterWithStats[]
}

const WEAKNESS_PER_PAGE = 4

export const WeaknessCard = ({ chapters }: WeaknessCardProps) => {
  const router = useRouter()
  const prefetchRoute = useRoutePrefetcher()

  const weaknesses = chapters
    .filter(
      (chapter) =>
        chapter.stats.totalAttempts >= 5 && chapter.stats.masteryLevel < 70
    )
    .sort((a, b) => a.stats.masteryLevel - b.stats.masteryLevel)

  const [page, setPage] = useState(0)
  const totalPages = Math.max(
    1,
    Math.ceil(weaknesses.length / WEAKNESS_PER_PAGE)
  )
  const visibleWeaknesses = useMemo(
    () =>
      weaknesses.slice(
        page * WEAKNESS_PER_PAGE,
        (page + 1) * WEAKNESS_PER_PAGE
      ),
    [weaknesses, page]
  )

  useEffect(() => {
    setPage(0)
  }, [weaknesses.length])

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (totalPages <= 1) return
    event.preventDefault()
    const direction = event.deltaY > 0 ? 1 : -1
    setPage((prev) => Math.max(0, Math.min(totalPages - 1, prev + direction)))
  }

  return (
    <Card className={`${pagePanelClass} ${pageCardPaddingCompactClass}`}>
      <div className="flex items-start justify-between gap-3">
        <SectionBlockHeader
          title={
            <span className={`flex items-center gap-2 ${pageCardTitleClass}`}>
              <AlertOctagon className="h-4 w-4 text-rose-400" />
              薄弱点快修
            </span>
          }
          description="默认展示 4 条，滚动滑鼠滚轮可切到下一组需优先补强的章节。"
          className="flex-1"
        />
        <span className="rounded-full border border-borderTone bg-surface-subtle px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary dark:border-borderTone dark:bg-surface-subtle dark:text-text-secondary">
          {weaknesses.length} 条
        </span>
      </div>

      {weaknesses.length === 0 ? (
        <PageEmptyState
          title="当前没有明显薄弱点"
          description="继续保持训练节奏，系统会在出现连续失分章节时优先提示你回来补强。"
          className="mt-4"
        />
      ) : (
        <>
          <div className="mt-4 flex gap-1">
            {Array.from({ length: totalPages }).map((_, index) => (
              <span
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === page
                    ? 'w-4 bg-primary dark:bg-primary'
                    : 'w-1.5 bg-[hsl(var(--border-default))] dark:bg-[hsl(var(--border-default))]'
                }`}
              />
            ))}
          </div>

          <div className={`mt-4 ${pageListGapClass}`} onWheel={handleWheel}>
            {visibleWeaknesses.map((chapter) => (
              <button
                key={chapter.id}
                type="button"
                onMouseEnter={() =>
                  prefetchRoute(`/dashboard/practice/chapter-drill/${chapter.id}`)
                }
                onFocus={() =>
                  prefetchRoute(`/dashboard/practice/chapter-drill/${chapter.id}`)
                }
                onClick={() =>
                  router.push(`/dashboard/practice/chapter-drill/${chapter.id}`)
                }
                className={`${pageInteractiveRowClass} ${pageListItemMinHeightClass} justify-between`}
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className={`truncate ${pageCardTitleClass}`}>
                    {chapter.title}
                  </div>
                  <div className={`mt-1 ${pageKickerClass}`}>
                    掌握度 {chapter.stats.masteryLevel}% · 最近{' '}
                    {chapter.stats.recentAttempts} 次练习
                  </div>
                  <div className={`mt-1 ${pageMetaTextClass}`}>
                    共作答 {chapter.stats.totalAttempts}{' '}
                    次，建议先回到章节训练修复高频失分点。
                  </div>
                </div>

                <span className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-surface">
                  去补强
                  <Play className="ml-1 h-3 w-3 fill-current" />
                </span>
              </button>
            ))}

            {visibleWeaknesses.length < WEAKNESS_PER_PAGE
              ? Array.from({
                  length: WEAKNESS_PER_PAGE - visibleWeaknesses.length,
                }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className={`flex ${pageListItemMinHeightClass} items-center justify-center rounded-[22px] border border-dashed border-borderTone bg-surface-subtle dark:border-borderTone dark:bg-surface-subtle`}
                  >
                    <span className={pageKickerClass}>已到列表底部</span>
                  </div>
                ))
              : null}
          </div>
        </>
      )}
    </Card>
  )
}
