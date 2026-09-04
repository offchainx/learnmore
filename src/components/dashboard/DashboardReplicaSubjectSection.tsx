'use client'

import Image from 'next/image'
import { Card } from '@/components/ui/card'
import subjectSectionIcon from '../../../.codex/artifacts/dashboard-icons/subject-section-icon.png'
import subjectMathIcon from '../../../.codex/artifacts/dashboard-icons/subject-math-icon.png'
import subjectScienceIcon from '../../../.codex/artifacts/dashboard-icons/subject-science-icon.png'
import subjectChineseIcon from '../../../.codex/artifacts/dashboard-icons/subject-chinese-icon.png'
import subjectGeographyIcon from '../../../.codex/artifacts/dashboard-icons/subject-geography-icon.png'
import {
  defaultDashboardSubjectLayoutPreset,
  type DashboardSubjectLayoutPreset,
} from './subjectLayoutPreset'

const subjectCards = [
  { key: 'math', title: '数学', value: '72%', width: '72%', icon: subjectMathIcon, color: '#1f73eb' },
  { key: 'science', title: '科学', value: '68%', width: '68%', icon: subjectScienceIcon, color: '#21b287' },
  { key: 'chinese', title: '中文', value: '76%', width: '76%', icon: subjectChineseIcon, color: '#ff5a2b' },
  { key: 'geography', title: '地理', value: '58%', width: '58%', icon: subjectGeographyIcon, color: '#ffb300' },
] as const

function getAverageScale(
  box: { width: number; height: number },
  base: { width: number; height: number }
) {
  const scaleX = box.width / base.width
  const scaleY = box.height / base.height
  return Math.min(Math.max((scaleX + scaleY) / 2, 0.72), 1.75)
}

export function DashboardReplicaSubjectCard({
  preset = defaultDashboardSubjectLayoutPreset,
  compact = false,
  denseDesktop = false,
}: {
  preset?: DashboardSubjectLayoutPreset
  compact?: boolean
  denseDesktop?: boolean
}) {
  const shellHeight = denseDesktop ? 156 : compact ? 292 : preset.shell.height

  if (denseDesktop) {
    return (
      <Card
        className="overflow-hidden rounded-[28px] border border-[#ecd9c4] bg-white/[0.94] p-0 shadow-[0_22px_54px_-34px_rgba(133,79,26,0.24)]"
        style={{
          width: '100%',
          height: `${shellHeight}px`,
        }}
      >
        <div className="flex h-full min-h-0 flex-col p-3">
          <div
            className="origin-top-left"
            style={{
              transform: `translate(${preset.titleTransform.x}px, ${preset.titleTransform.y}px) scale(${preset.titleTransform.scale})`,
            }}
          >
            <div className="flex items-center gap-3">
              <Image src={subjectSectionIcon} alt="科目进度图标" width={20} height={20} className="h-5 w-5" />
              <h2 className="text-[17px] font-semibold tracking-tight text-[#242c38]">
                科目进度
              </h2>
            </div>
          </div>

          <div className="mt-3 grid min-h-0 flex-1 grid-cols-4 items-start gap-1.5">
            {subjectCards.map((item) => (
              <div
                key={item.key}
                className="flex h-[92px] min-h-0 flex-col rounded-[14px] border border-[#ecd9c4] bg-[linear-gradient(180deg,#fffdfa_0%,#fff8ef_100%)] p-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <Image src={item.icon} alt={`${item.title}图标`} width={28} height={28} className="h-[28px] w-[28px] rounded-[10px]" />
                  <div className="text-right">
                    <div className="text-[8px] font-semibold leading-none text-[#24303b]">{item.title}</div>
                    <div className="mt-0.5 text-[10px] font-semibold leading-none tracking-tight text-[#1f2935]">
                      {item.value}
                    </div>
                  </div>
                </div>
                <div className="mt-auto h-[5px] overflow-hidden rounded-full bg-[#efdfcf]">
                  <div className="h-full rounded-full" style={{ width: item.width, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card
      className="overflow-hidden rounded-[28px] border border-[#ecd9c4] bg-white/[0.94] p-0 shadow-[0_22px_54px_-34px_rgba(133,79,26,0.24)]"
      style={{
        width: `min(100%, ${preset.shell.width}px)`,
        height: `${shellHeight}px`,
      }}
    >
      <div className={`flex h-full min-h-0 flex-col ${compact ? 'p-3' : 'p-3.5'}`}>
        <div
          className="origin-top-left"
          style={{
            transform: `translate(${preset.titleTransform.x}px, ${preset.titleTransform.y}px) scale(${preset.titleTransform.scale})`,
          }}
        >
          <div className="flex items-center gap-3">
            <Image src={subjectSectionIcon} alt="科目进度图标" width={20} height={20} className="h-5 w-5" />
            <h2 className="text-[17px] font-semibold tracking-tight text-[#242c38] sm:text-[18px]">
              科目进度
            </h2>
          </div>
        </div>

        <div className={`relative min-h-0 flex-1 ${compact ? 'mt-1.5' : 'mt-2'}`}>
          {subjectCards.map((item) => {
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
                  className="origin-top-left rounded-[16px] border border-[#ecd9c4] bg-[linear-gradient(180deg,#fffdfa_0%,#fff8ef_100%)] p-1.5"
                  style={{
                    transform: `scale(${getAverageScale(box, { width: 168, height: 84 })})`,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <Image src={item.icon} alt={`${item.title}图标`} width={48} height={48} className="origin-left scale-[0.65] rounded-[14px]" />
                    <div className="text-right">
                      <div className="text-[9px] font-semibold text-[#24303b]">{item.title}</div>
                      <div className="mt-0.5 text-[12px] font-semibold leading-none tracking-tight text-[#1f2935]">
                        {item.value}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 h-[7px] overflow-hidden rounded-full bg-[#efdfcf]">
                    <div className="h-full rounded-full" style={{ width: item.width, backgroundColor: item.color }} />
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
