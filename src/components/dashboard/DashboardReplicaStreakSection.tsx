'use client'

import Image from 'next/image'
import { Card } from '@/components/ui/card'
import streakCampfireImage from '../../../.codex/artifacts/streak-assets/streak-campfire.png'
import streakTitleIcon from '../../../.codex/artifacts/streak-assets/streak-title-icon.png'
import {
  defaultDashboardStreakLayoutPreset,
  type DashboardStreakLayoutPreset,
} from './streakLayoutPreset'

const streakDays = ['一', '二', '三', '四', '五', '六', '日', '一', '二', '三', '四', '五', '六', '日']

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

export function DashboardStreakCard({
  copy,
  streak,
  preset = defaultDashboardStreakLayoutPreset,
}: {
  copy: (zh: string, en: string) => string
  streak: number
  preset?: DashboardStreakLayoutPreset
}) {
  const visibleStreak = Math.max(0, streak)
  const filledDays = Math.min(visibleStreak, streakDays.length)

  return (
    <Card
      className="overflow-hidden rounded-[28px] border border-[#ecd9c4] bg-white/[0.94] p-0 shadow-[0_22px_54px_-34px_rgba(133,79,26,0.24)]"
      style={{
        width: `min(100%, ${preset.shell.width}px)`,
        height: `${preset.shell.height}px`,
      }}
    >
      <div
        className="relative min-h-0"
        style={{ height: '100%' }}
      >
        <div
          className="absolute left-[20px] top-[18px] z-20 origin-top-left"
          style={{
            transform: `translate(${preset.titleTransform.x}px, ${preset.titleTransform.y}px) scale(${preset.titleTransform.scale})`,
          }}
        >
          <ReplicaSectionTitle
            iconSrc={streakTitleIcon.src}
            iconAlt={copy('连续性图标', 'Streak icon')}
            title={copy('连续性', 'Streak')}
          />
        </div>

        <div className="absolute inset-x-0 top-0 z-0 rounded-[20px] bg-[linear-gradient(180deg,#fff9f0_0%,#fffdf7_100%)] px-4 pb-4 pt-11">
          <div className="relative min-h-[122px]">
            <div className="flex translate-x-[30px] items-start gap-3 pr-[176px]">
              <div className="min-w-0 flex-1">
                <div className="text-[40px] font-semibold leading-none tracking-tight text-[#ff6b1c]">
                  <span className="inline-flex items-end gap-1 whitespace-nowrap">
                    <span>{visibleStreak}</span>
                    <span className="pb-1 text-[18px]">{copy('天', 'd')}</span>
                  </span>
                </div>
                <div className="mt-2 text-[13px] font-semibold leading-none text-[#24303b]">
                  {copy('连续学习', 'Continuous learning')}
                </div>
                <div className="mt-1.5 text-[13px] font-semibold leading-none text-[#24303b]">
                  {visibleStreak > 0
                    ? copy('表现很棒！', 'Great consistency!')
                    : copy('从今天开始点亮第一天', 'Start your first streak today')}
                </div>
              </div>
            </div>

            <div
              className="absolute z-10"
              style={{
                left: `${preset.campfireFrame.x}px`,
                top: `${preset.campfireFrame.y}px`,
                width: `${preset.campfireFrame.width}px`,
                height: `${preset.campfireFrame.height}px`,
              }}
            >
              <Image
                src={streakCampfireImage}
                alt={copy('连续学习火堆插画', 'Streak campfire')}
                fill
                sizes={`${Math.round(preset.campfireFrame.width)}px`}
                className="object-contain object-center"
              />
            </div>

            <div className="mt-[30px] rounded-[14px] border border-[#ecd9c4] bg-white/82 px-2 py-1">
              <div className="flex items-center justify-between text-[10px] text-[#67727e]">
                {streakDays.map((day, index) => (
                  <span key={`${day}-${index}`}>{day}</span>
                ))}
              </div>
              <div className="mt-[5px] flex items-center justify-between gap-[2px]">
                {streakDays.map((_, index) => (
                  <div
                    key={index}
                    className={`flex h-3 w-3 items-center justify-center rounded-full text-[7px] ${
                      index < filledDays
                        ? 'bg-[#ff8b1f] text-white'
                        : 'bg-[#e7e1d9] text-[#999490]'
                    }`}
                  >
                    {index < filledDays ? '✓' : ''}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
