'use client'

import Image from 'next/image'
import { Card } from '@/components/ui/card'
import pathBackgroundMountain from '../../../.codex/artifacts/path-assets/path-background-mountain.png'
import pathStepActive from '../../../.codex/artifacts/path-assets/path-step-active.png'
import pathStepDone from '../../../.codex/artifacts/path-assets/path-step-done.png'
import pathStepLocked from '../../../.codex/artifacts/path-assets/path-step-locked.png'
import pathStepTreasure from '../../../.codex/artifacts/path-assets/path-step-treasure.png'
import pathTitleIcon from '../../../.codex/artifacts/path-assets/path-title-icon.png'
import {
  defaultDashboardPathLayoutPreset,
  type DashboardPathLayoutPreset,
} from './pathLayoutPreset'

const pathSteps: Array<{
  label: string
  sublabel?: string
  tone: 'done' | 'active' | 'locked' | 'treasure'
  icon: typeof pathStepDone
}> = [
  { label: '起点', tone: 'done', icon: pathStepDone },
  { label: '基础完成', tone: 'done', icon: pathStepDone },
  { label: '第2级', sublabel: '进行中', tone: 'active', icon: pathStepActive },
  { label: '第3级', sublabel: '已锁定', tone: 'locked', icon: pathStepLocked },
  { label: '第4级', sublabel: '已锁定', tone: 'locked', icon: pathStepLocked },
  { label: '大师奖励', sublabel: '等待解锁', tone: 'treasure', icon: pathStepTreasure },
]

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

export function DashboardReplicaPathCard({
  copy,
  preset = defaultDashboardPathLayoutPreset,
}: {
  copy: (zh: string, en: string) => string
  preset?: DashboardPathLayoutPreset
}) {
  return (
    <Card
      className="overflow-hidden rounded-[28px] border border-[#ecd9c4] bg-white/[0.94] p-0 shadow-[0_22px_54px_-34px_rgba(133,79,26,0.24)]"
      style={{
        width: `min(100%, ${preset.shell.width}px)`,
        height: `${preset.shell.height}px`,
      }}
    >
      <div className="relative h-full min-h-0">
        <div
          className="absolute left-[20px] top-[18px] z-30 origin-top-left"
          style={{
            transform: `translate(${preset.titleTransform.x}px, ${preset.titleTransform.y}px) scale(${preset.titleTransform.scale})`,
          }}
        >
          <ReplicaSectionTitle
            iconSrc={pathTitleIcon.src}
            iconAlt={copy('学习路径图标', 'Learning path icon')}
            title={copy('学习路径', 'Learning Path')}
          />
        </div>

        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                transform: `translate3d(0, ${preset.backgroundOffset.y}px, 0)`,
              }}
            >
              <Image
                src={pathBackgroundMountain}
                alt=""
                fill
                sizes="100vw"
                className="object-cover object-bottom opacity-[0.72]"
              />
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(249,253,251,0.44)_0%,rgba(255,250,242,0.16)_100%)]" />
        </div>

        <div className="pointer-events-none absolute inset-x-8 top-[30%]">
          <svg viewBox="0 0 1000 120" preserveAspectRatio="none" className="h-[42px] w-full">
            <path
              d="M 8 62 C 70 18, 132 18, 194 62 S 318 106, 380 62 S 504 18, 566 62 S 690 106, 752 62 S 876 18, 938 62"
              fill="none"
              stroke="#98a873"
              strokeDasharray="6 10"
              strokeLinecap="round"
              strokeWidth="4.5"
              opacity="0.9"
            />
          </svg>
        </div>

        <div className="relative z-10 grid h-full gap-3.5 px-3 pb-3 pt-10 sm:grid-cols-2 desktop:grid-cols-3 2xl:grid-cols-6">
          {pathSteps.map((step) => (
            <div key={step.label} className="relative text-center">
              <div
                className={`relative mx-auto flex items-center justify-center ${
                  step.tone === 'active' || step.tone === 'treasure'
                    ? 'h-[68px] w-[68px]'
                    : 'h-10 w-10'
                }`}
              >
                <Image
                  src={step.icon}
                  alt={step.label}
                  fill
                  sizes={
                    step.tone === 'active' || step.tone === 'treasure' ? '68px' : '40px'
                  }
                  className="object-contain"
                />
              </div>
              <div className="mt-2 text-[11px] font-semibold text-[#2c3541]">{step.label}</div>
              {step.sublabel ? (
                <div
                  className={`mt-1 text-[10px] ${
                    step.tone === 'active'
                      ? 'font-semibold text-[#ff6d18]'
                      : step.tone === 'treasure'
                        ? 'font-semibold text-[#ff7b16]'
                        : 'text-[#74808d]'
                  }`}
                >
                  {step.sublabel}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
