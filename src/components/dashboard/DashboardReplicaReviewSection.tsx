'use client'

import Image, { type StaticImageData } from 'next/image'
import { Card } from '@/components/ui/card'
import reviewEnglishIcon from '../../../.codex/artifacts/review-assets/review-english-icon.png'
import reviewMathIcon from '../../../.codex/artifacts/review-assets/review-math-icon.png'
import reviewScienceIcon from '../../../.codex/artifacts/review-assets/review-science-icon.png'
import reviewSocialIcon from '../../../.codex/artifacts/review-assets/review-social-icon.png'
import reviewTitleIcon from '../../../.codex/artifacts/review-assets/review-title-icon.png'
import {
  defaultDashboardReviewLayoutPreset,
  type DashboardReviewLayoutPreset,
} from './reviewLayoutPreset'

const reviewCards: Array<{
  key: 'math' | 'science' | 'english' | 'social'
  icon: StaticImageData
  title: string
  score: string
  note: string
  accent: string
}> = [
  { key: 'math', icon: reviewMathIcon, title: '代数基础', score: '8/10', note: '做得好！', accent: '#1f73eb' },
  { key: 'science', icon: reviewScienceIcon, title: '物质状态', score: '9/10', note: '太棒了！', accent: '#108f67' },
  { key: 'english', icon: reviewEnglishIcon, title: '比喻语言', score: '7/10', note: '继续加油！', accent: '#ff5f1f' },
  { key: 'social', icon: reviewSocialIcon, title: '古代文明', score: '8/10', note: '做得不错！', accent: '#f29b00' },
] as const

function getAverageScale(
  box: { width: number; height: number },
  base: { width: number; height: number }
) {
  const scaleX = box.width / base.width
  const scaleY = box.height / base.height
  return Math.min(Math.max((scaleX + scaleY) / 2, 0.72), 1.75)
}

export function DashboardReplicaReviewCard({
  preset = defaultDashboardReviewLayoutPreset,
}: {
  preset?: DashboardReviewLayoutPreset
}) {
  return (
    <Card
      className="overflow-hidden rounded-[28px] border border-[#ecd9c4] bg-white/[0.94] p-0 shadow-[0_22px_54px_-34px_rgba(133,79,26,0.24)]"
      style={{
        width: `min(100%, ${preset.shell.width}px)`,
        height: `${preset.shell.height}px`,
      }}
    >
      <div className="relative z-[20] flex h-full min-h-0 flex-col p-3.5">
        <div
          className="origin-top-left"
          style={{
            transform: `translate(${preset.titleTransform.x}px, ${preset.titleTransform.y}px) scale(${preset.titleTransform.scale})`,
          }}
        >
          <div className="flex items-center gap-3">
            <Image src={reviewTitleIcon} alt="最近练习回顾图标" width={20} height={20} className="h-5 w-5" />
            <h2 className="text-[17px] font-semibold tracking-tight text-[#242c38] sm:text-[18px]">
              最近练习回顾
            </h2>
          </div>
        </div>

        <div className="relative mt-[20px] h-[160px] min-h-0">
          {reviewCards.map((item) => {
            const box = preset.cardBoxes[item.key]
            return (
              <div
                key={item.key}
                className="absolute"
                style={{
                  left: `${box.x}px`,
                  top: `${box.y}px`,
                  width: `${box.width}px`,
                  height: `${box.height}px`,
                }}
              >
                <div
                  className="origin-top-left rounded-[20px] border border-[#ecd9c4] bg-[linear-gradient(180deg,#fffdfb_0%,#fff7ed_100%)] px-3 py-3"
                  style={{
                    transform: `scale(${getAverageScale(box, { width: 185, height: 154 })})`,
                  }}
                >
                  <div className="flex items-center justify-center">
                    <Image src={item.icon} alt={item.title} width={58} height={58} className="rounded-[18px]" />
                  </div>
                  <div className="mt-3 text-center text-[10px] font-medium text-[#485363]">{item.title}</div>
                  <div className="mt-3 text-[24px] font-semibold leading-none tracking-tight" style={{ color: item.accent }}>
                    {item.score}
                  </div>
                  <div className="mt-1 text-[9px] font-medium" style={{ color: item.accent }}>
                    {item.note}
                  </div>
                  <div className="mt-2 flex justify-end">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fff2cf] text-[13px]">
                      {item.key === 'english' ? '🙂' : item.key === 'social' ? '🏛️' : '⭐'}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
