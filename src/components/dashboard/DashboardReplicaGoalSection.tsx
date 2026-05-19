'use client'

import Image from 'next/image'
import { Card } from '@/components/ui/card'
import {
  defaultDashboardGoalLayoutPreset,
  type DashboardGoalLayoutPreset,
} from './goalLayoutPreset'

function ReplicaSectionTitle({
  iconSrc,
  iconAlt,
  title,
}: {
  iconSrc: string
  iconAlt: string
  title: string
}) {
  return (
    <div className="flex items-center gap-3">
      <Image src={iconSrc} alt={iconAlt} width={20} height={20} className="h-5 w-5" />
      <h2 className="text-[17px] font-semibold tracking-tight text-[#242c38] sm:text-[18px]">
        {title}
      </h2>
    </div>
  )
}

export function DashboardWeeklyGoalCard({
  copy,
  activeDays,
  preset = defaultDashboardGoalLayoutPreset,
}: {
  copy: (zh: string, en: string) => string
  activeDays: number
  preset?: DashboardGoalLayoutPreset
}) {
  const completedDays = Math.max(0, Math.min(7, activeDays))
  const progress = Math.max(8, Math.round((completedDays / 7) * 100))
  const statusText =
    completedDays >= 5
      ? copy('进展不错！', 'Strong progress!')
      : completedDays >= 3
        ? copy('继续推进', 'Keep going')
        : copy('本周刚起步', 'Just getting started')

  return (
    <Card
      className="overflow-hidden rounded-[28px] border border-[#ecd9c4] bg-white/[0.94] p-0 shadow-[0_22px_54px_-34px_rgba(133,79,26,0.24)]"
      style={{
        width: `min(100%, ${preset.shell.width}px)`,
        height: `${preset.shell.height}px`,
      }}
    >
      <div
        className="flex min-h-0 flex-col"
        style={{ height: '100%' }}
      >
        <div
          className="origin-top-left pl-[30px] pt-[20px]"
          style={{
            transform: `translate(${preset.titleTransform.x}px, ${preset.titleTransform.y}px) scale(${preset.titleTransform.scale})`,
          }}
        >
          <ReplicaSectionTitle
            iconSrc="/preview/goal-assets/goal-title-trophy-imagegen.png"
            iconAlt={copy('本周目标进度图标', 'Weekly goal icon')}
            title={copy('本周目标进度', 'Weekly Goal Progress')}
          />
        </div>

        <div className="mt-[30px] flex flex-col gap-2.5 pl-[30px] sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <div
              style={{
                transform: `translate(${preset.summaryOffset.x}px, ${preset.summaryOffset.y}px)`,
              }}
            >
              <div className="text-[14px] font-medium leading-none text-[#414b57]">
                {statusText}
              </div>
              <div className="mt-2 text-[14px] font-semibold leading-none text-[#ff6d1b]">
                {progress}%
              </div>
              <div className="mt-2 text-[14px] leading-none text-[#4b5663]">
                {copy(
                  `已完成 ${completedDays} / 7 天学习`,
                  `${completedDays} / 7 study days completed`
                )}
              </div>
            </div>
            <div className="mt-[30px] h-[10px] overflow-hidden rounded-full bg-[#f2e5d8]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#ff8b1e_0%,#ff5f18_100%)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div
            className="relative shrink-0 self-center sm:self-auto"
            style={{
              width: `${preset.trophyFrame.width}px`,
              height: `${preset.trophyFrame.height}px`,
              transform: `translate(${preset.trophyFrame.x}px, ${preset.trophyFrame.y}px)`,
            }}
          >
            <Image
              src="/preview/goal-assets/goal-right-trophy-imagegen.png"
              alt={copy('本周目标奖杯插画', 'Weekly goal trophy')}
              fill
              sizes={`${Math.round(preset.trophyFrame.width)}px`}
              className="object-contain object-center"
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
