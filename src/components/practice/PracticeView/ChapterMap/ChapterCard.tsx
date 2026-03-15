import React from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, Flame, AlertOctagon } from 'lucide-react'
import {
  pageCardTitleClass,
  pageHeroEyebrowClass,
  pageMetaTextClass,
} from '@/components/shared/pageTypography'
import { cn } from '@/lib/utils'
import type { DbChapter } from '../types'

interface ChapterCardProps {
  chapter: DbChapter
  absoluteIndex: number
  isPreview?: boolean
  onPreview?: (chapter: DbChapter) => void
}

export const ChapterCard: React.FC<ChapterCardProps> = ({
  chapter,
  absoluteIndex,
  isPreview = false,
  onPreview,
}) => {
  const router = useRouter()
  const mastery = chapter.stats.masteryLevel
  const stars = mastery >= 80 ? 3 : mastery >= 50 ? 2 : mastery > 0 ? 1 : 0

  // HOT: 7天内 > 10次答题且正确率 < 70%
  const isHotspot =
    (chapter.stats.recentAttempts || 0) > 10 &&
    (chapter.stats.recentCorrectRate || 0) < 70

  // WEAK: 30天正确率 < 60%
  const isWeakness =
    (chapter.stats.monthlyCorrectRate || 0) < 60 &&
    chapter.stats.totalAttempts > 0

  return (
    <Card className="group flex cursor-default items-center justify-between rounded-[24px] border border-slate-200/80 bg-white/95 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-0.5 hover:border-blue-500/30 hover:shadow-[0_18px_34px_rgba(37,99,235,0.12)] dark:border-slate-800/70 dark:bg-slate-900/65 dark:hover:shadow-blue-950/10">
      <div className="flex items-center gap-4">
        <div className="flex w-10 flex-col items-center gap-1">
          <div className={cn(pageHeroEyebrowClass, 'text-slate-400')}>章节</div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            {String(absoluteIndex + 1).padStart(2, '0')}
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center gap-2">
            <h4
              className={cn(
                pageCardTitleClass,
                'line-clamp-1 text-slate-900 dark:text-white'
              )}
            >
              {chapter.title}
            </h4>
            {isHotspot && (
              <span
                className={cn(
                  pageHeroEyebrowClass,
                  'flex items-center gap-1 whitespace-nowrap rounded border border-orange-500/20 bg-orange-500/10 px-1.5 py-0.5 text-orange-500'
                )}
              >
                <Flame className="h-3 w-3 fill-orange-500" /> 高频
              </span>
            )}
            {isWeakness && (
              <span
                className={cn(
                  pageHeroEyebrowClass,
                  'flex items-center gap-1 whitespace-nowrap rounded border border-red-500/20 bg-red-500/10 px-1.5 py-0.5 text-red-500'
                )}
              >
                <AlertOctagon className="h-3 w-3" /> 薄弱
              </span>
            )}
          </div>

          <div className="flex gap-1">
            {[1, 2, 3].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${star <= stars ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200 dark:text-slate-700'}`}
              />
            ))}
            <span className={cn(pageMetaTextClass, 'ml-2 text-slate-400')}>
              掌握 {stars}/3
            </span>
          </div>
        </div>
      </div>

      <Button
        onClick={() => {
          if (!isPreview) {
            if (onPreview) {
              onPreview(chapter)
              return
            }
            router.push(`/dashboard/practice/chapter-drill/${chapter.id}`)
          }
        }}
        size="sm"
        variant={isPreview || stars === 3 ? 'outline' : 'primary'}
        className={
          isPreview
            ? 'rounded-xl border-slate-300 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
            : stars === 3
              ? 'rounded-xl border-green-500/30 text-green-500 hover:bg-green-500/10'
              : 'rounded-xl'
        }
      >
        {isPreview ? '预览' : stars === 3 ? '回顾' : '开始'}
      </Button>
    </Card>
  )
}
