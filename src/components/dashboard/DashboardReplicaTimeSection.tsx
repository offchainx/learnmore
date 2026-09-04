'use client'

import Image from 'next/image'
import { Card } from '@/components/ui/card'
import studyTimeSectionIcon from '../../../.codex/artifacts/dashboard-icons/study-time-section-icon.png'
import {
  defaultDashboardTimeLayoutPreset,
  type DashboardTimeLayoutPreset,
} from './timeLayoutPreset'

const subjectStats = [
  { label: '数学', value: '2小时15分', percent: '35%', color: '#2f8bff' },
  { label: '科学', value: '1小时45分', percent: '27%', color: '#24b892' },
  { label: '英语', value: '1小时30分', percent: '23%', color: '#ff6940' },
  { label: '社会', value: '45分', percent: '12%', color: '#ffb930' },
  { label: '其他', value: '15分', percent: '3%', color: '#b6b1aa' },
] as const

function getAverageScale(
  box: { width: number; height: number },
  base: { width: number; height: number }
) {
  const scaleX = box.width / base.width
  const scaleY = box.height / base.height
  return Math.min(Math.max((scaleX + scaleY) / 2, 0.72), 1.75)
}

export function DashboardReplicaTimeCard({
  preset = defaultDashboardTimeLayoutPreset,
  compact = false,
  denseDesktop = false,
}: {
  preset?: DashboardTimeLayoutPreset
  compact?: boolean
  denseDesktop?: boolean
}) {
  const shellHeight = denseDesktop ? 256 : compact ? 292 : preset.shell.height

  if (denseDesktop) {
    return (
      <Card
        className="overflow-hidden rounded-[28px] border border-[#ecd9c4] bg-white/[0.94] p-0 shadow-[0_22px_54px_-34px_rgba(133,79,26,0.24)]"
        style={{
          width: '100%',
          height: `${shellHeight}px`,
        }}
      >
        <div className="relative z-[20] flex h-full min-h-0 flex-col p-3">
          <div
            className="origin-top-left"
            style={{
              transform: `translate(${preset.titleTransform.x}px, ${preset.titleTransform.y}px) scale(${preset.titleTransform.scale})`,
            }}
          >
            <div className="flex items-center gap-3">
              <Image src={studyTimeSectionIcon} alt="学习时长分布图标" width={20} height={20} className="h-5 w-5" />
              <h2 className="text-[17px] font-semibold tracking-tight text-[#242c38]">
                学习时长分布
              </h2>
            </div>
          </div>

          <div className="mt-3 flex min-h-0 flex-1 items-center gap-3">
            <div className="flex w-[114px] shrink-0 items-center justify-center">
              <div className="flex h-[114px] w-[114px] items-center justify-center rounded-full bg-[conic-gradient(#2f8bff_0deg_126deg,#24b892_126deg_223deg,#ff6940_223deg_306deg,#ffb930_306deg_349deg,#b6b1aa_349deg_360deg)]">
                <div className="flex h-[62px] w-[62px] flex-col items-center justify-center rounded-full bg-white text-center shadow-[inset_0_0_0_1px_rgba(236,217,196,0.7)]">
                  <div className="text-[10px] font-semibold text-[#2a3340]">本周</div>
                  <div className="mt-0.5 text-[8px] text-[#4f5966]">6小时30分</div>
                </div>
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
              {subjectStats.map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-[10px_minmax(0,1fr)_58px_auto] items-center gap-[4px] text-[8px]"
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[#35404d]">{item.label}</span>
                  <span className="text-[#6a7480]">{item.value}</span>
                  <span className="font-medium text-[#4e5865]">{item.percent}</span>
                </div>
              ))}
            </div>
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
      <div className={`relative z-[20] flex h-full min-h-0 flex-col ${compact ? 'p-3' : 'p-3.5'}`}>
        <div
          className="origin-top-left"
          style={{
            transform: `translate(${preset.titleTransform.x}px, ${preset.titleTransform.y}px) scale(${preset.titleTransform.scale})`,
          }}
        >
          <div className="flex items-center gap-3">
            <Image src={studyTimeSectionIcon} alt="学习时长分布图标" width={20} height={20} className="h-5 w-5" />
            <h2 className="text-[17px] font-semibold tracking-tight text-[#242c38] sm:text-[18px]">
              学习时长分布
            </h2>
          </div>
        </div>

        <div className={`relative min-h-0 flex-1 ${compact ? 'mt-2' : 'mt-3'}`}>
          <div
            className="absolute"
            style={{
              left: `${preset.panelBoxes.pie.x}px`,
              top: `${preset.panelBoxes.pie.y}px`,
              width: `${preset.panelBoxes.pie.width}px`,
              height: `${preset.panelBoxes.pie.height}px`,
            }}
          >
            <div className="flex h-full w-full items-center justify-center">
              <div
                className="flex h-[104px] w-[104px] items-center justify-center rounded-full bg-[conic-gradient(#2f8bff_0deg_126deg,#24b892_126deg_223deg,#ff6940_223deg_306deg,#ffb930_306deg_349deg,#b6b1aa_349deg_360deg)]"
                style={{
                  transform: `scale(${getAverageScale(preset.panelBoxes.pie, { width: 138, height: 138 })})`,
                }}
              >
                <div className="flex h-[68px] w-[68px] flex-col items-center justify-center rounded-full bg-white text-center shadow-[inset_0_0_0_1px_rgba(236,217,196,0.7)]">
                  <div className="text-[11px] font-semibold text-[#2a3340]">本周</div>
                  <div className="mt-0.5 text-[9px] text-[#4f5966]">6小时30分</div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="absolute"
            style={{
              left: `${preset.panelBoxes.stats.x}px`,
              top: `${preset.panelBoxes.stats.y}px`,
              width: `${preset.panelBoxes.stats.width}px`,
              height: `${preset.panelBoxes.stats.height}px`,
            }}
          >
            <div className="flex h-full w-full flex-col justify-center gap-1.5 px-2 py-1.5">
              <div
                className="flex h-full w-full flex-col justify-center gap-1.5"
                style={{
                  transform: `scale(${getAverageScale(preset.panelBoxes.stats, { width: 224, height: 138 })})`,
                  transformOrigin: 'center center',
                }}
              >
                {subjectStats.map((item) => (
                  <div
                    key={item.label}
                    className="grid grid-cols-[10px_minmax(0,1fr)_68px_auto] items-center gap-[5px] text-[9px]"
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[#35404d]">{item.label}</span>
                    <span className="text-[#6a7480]">{item.value}</span>
                    <span className="font-medium text-[#4e5865]">{item.percent}</span>
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
