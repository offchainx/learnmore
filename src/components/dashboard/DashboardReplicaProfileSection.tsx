'use client'

import Image from 'next/image'
import { Flame, Medal, Star } from 'lucide-react'
import { Card } from '@/components/ui/card'
import profileAvatarGenerated from '../../../.codex/artifacts/profile-assets/profile-avatar-generated.png'
import profileBadgeGenerated from '../../../.codex/artifacts/profile-assets/profile-badge-generated.png'
import {
  defaultDashboardProfileLayoutPreset,
  type DashboardProfileLayoutPreset,
} from './profileLayoutPreset'

type ProfileUser = {
  displayName?: string | null
}

function ScaledSection({
  box,
  base,
  children,
}: {
  box: { x: number; y: number; width: number; height: number }
  base: { width: number; height: number }
  children: React.ReactNode
}) {
  const scaleX = box.width / base.width
  const scaleY = box.height / base.height

  return (
    <div
      className="absolute"
      style={{
        left: `${box.x}px`,
        top: `${box.y}px`,
        width: `${box.width}px`,
        height: `${box.height}px`,
      }}
    >
      <div className="relative h-full w-full overflow-hidden">
        <div
          className="origin-top-left"
          style={{
            width: `${base.width}px`,
            height: `${base.height}px`,
            transform: `scale(${scaleX}, ${scaleY})`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export function DashboardReplicaProfileCard({
  user,
  xp,
  streak,
  preset = defaultDashboardProfileLayoutPreset,
}: {
  user: ProfileUser
  xp: number
  streak: number
  preset?: DashboardProfileLayoutPreset
}) {
  const displayName = user.displayName?.trim() || 'Alex'

  return (
    <Card
      className="overflow-hidden rounded-[28px] border border-[#ecd9c4] bg-white/[0.94] p-0 shadow-[0_22px_54px_-34px_rgba(133,79,26,0.24)]"
      style={{
        width: `min(100%, ${preset.shell.width}px)`,
        height: `${preset.shell.height}px`,
      }}
    >
      <div className="relative h-full w-full">
        <ScaledSection
          box={preset.sectionBoxes.avatar}
          base={{ width: 178.871, height: 136.902 }}
        >
          <div className="relative h-full w-full min-w-0 min-h-0 overflow-hidden">
            <div className="absolute inset-y-0 right-0 w-px bg-[#ecd9c4]" />
            <div className="absolute left-0 top-0 h-[112px] w-[112px]">
              <Image
                src={profileAvatarGenerated}
                alt="用户头像"
                fill
                sizes="112px"
                className="object-contain"
              />
            </div>
          </div>
        </ScaledSection>

        <ScaledSection
          box={preset.sectionBoxes.greeting}
          base={{ width: 374.192, height: 114.625 }}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[16px] font-semibold tracking-tight text-[#252d38]">
              <span>嗨，{displayName}!</span>
              <span className="text-[16px]">👋</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#d7ebd8] bg-[#f5fff6] px-2.5 py-1 text-[12px] font-medium text-[#3e5d45]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fff7dc] text-[#2ebf69] shadow-[0_8px_18px_-14px_rgba(53,160,84,0.45)]">
                <Medal className="h-3.5 w-3.5" />
              </span>
              好奇探索者
            </div>
          </div>
        </ScaledSection>

        <ScaledSection
          box={preset.sectionBoxes.stats}
          base={{ width: 261.93, height: 101.035 }}
        >
          <div className="flex min-w-0 flex-col justify-center gap-2 text-[15px] text-[#2d3641]">
            <div className="flex items-center gap-2 font-semibold">
              <Star className="h-5 w-5 fill-[#ffbf2f] text-[#ef8a1f]" />
              <span>
                {xp}{' '}
                <span className="text-[13px] font-medium text-[#68727e]">XP</span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 font-semibold whitespace-nowrap">
                <Flame className="h-5 w-5 text-[#ff6d1b]" />
                <span>{streak}天</span>
              </div>
              <div className="mt-1 pl-7 text-[13px] text-[#69727f] whitespace-nowrap">
                连续学习
              </div>
            </div>
          </div>
        </ScaledSection>

        <ScaledSection
          box={preset.sectionBoxes.badge}
          base={{ width: 156.184, height: 171.793 }}
        >
          <div className="relative h-full w-full">
            <Image
              src={profileBadgeGenerated}
              alt="成就徽章"
              fill
              sizes="156px"
              className="object-contain"
            />
          </div>
        </ScaledSection>
      </div>
    </Card>
  )
}
