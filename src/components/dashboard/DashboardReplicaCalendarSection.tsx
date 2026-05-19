'use client'

import { BookText, Flame } from 'lucide-react'
import { Card } from '@/components/ui/card'
import {
  defaultDashboardCalendarLayoutPreset,
  type DashboardCalendarLayoutPreset,
} from './calendarLayoutPreset'

const calendarRows = [
  { label: '本周', cells: [2, 2, 2, 3, 2, 2, 2] },
  { label: '上周', cells: [2, 2, 3, 4, 2, 1, 2] },
  { label: '两周前', cells: [2, 4, 4, 2, 2, 4, 2] },
  { label: '三周前', cells: [5, 3, 3, 4, 1, 1, 2] },
] as const

const calendarDays = ['一', '二', '三', '四', '五', '六', '日'] as const

function HeatCell({ level }: { level: number }) {
  const colors = ['#fff5e6', '#ffe8c4', '#ffd190', '#ffaf57', '#ff8c27', '#ff6017']
  return (
    <div
      className="h-[18px] w-[18px] rounded-[5px]"
      style={{ backgroundColor: colors[Math.max(0, Math.min(level, colors.length - 1))] }}
    />
  )
}

export function DashboardReplicaCalendarCard({
  preset = defaultDashboardCalendarLayoutPreset,
}: {
  preset?: DashboardCalendarLayoutPreset
}) {
  return (
    <Card
      className="overflow-hidden rounded-[28px] border border-[#ecd9c4] bg-white/[0.94] p-0 shadow-[0_22px_54px_-34px_rgba(133,79,26,0.24)]"
      style={{
        width: `min(100%, ${preset.shell.width}px)`,
        height: `${preset.shell.height}px`,
      }}
    >
      <div className="relative h-full w-full overflow-hidden px-5">
        <div
          className="origin-top-left"
          style={{
            transform: `translate(${preset.titleTransform.x}px, ${preset.titleTransform.y}px) scale(${preset.titleTransform.scale})`,
          }}
        >
          <div className="translate-y-2">
            <div className="flex items-center gap-3">
              <BookText className="h-5 w-5 text-[#f07d2c]" />
              <h2 className="text-[17px] font-semibold tracking-tight text-[#242c38] sm:text-[18px]">
                活动日历
              </h2>
            </div>
          </div>
        </div>

        <div
          className="mt-2 origin-top-left"
          style={{
            transform: `translate(${preset.contentTransform.x}px, ${preset.contentTransform.y}px) scale(${preset.contentTransform.scale})`,
          }}
        >
          <div className="grid grid-cols-[46px_repeat(7,minmax(0,1fr))] gap-x-1.5 gap-y-1.5 text-center text-[12px] text-[#59636f] sm:grid-cols-[52px_repeat(7,minmax(0,1fr))] sm:gap-x-2 sm:text-[13px]">
            <div />
            {calendarDays.map((day) => (
              <div key={day}>{day}</div>
            ))}

            {calendarRows.map((row) => (
              <div key={row.label} className="contents">
                <div className="flex items-center text-left text-[12px] text-[#4d5662] sm:text-[13px]">
                  {row.label}
                </div>
                {row.cells.map((cell, index) => (
                  <div key={`${row.label}-${index}`} className="flex justify-center">
                    <HeatCell level={cell} />
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5 text-[12px] text-[#5f6975]">
              <span>较少</span>
              <div className="flex gap-1.5">
                {[0, 1, 2, 3, 4, 5].map((level) => (
                  <HeatCell key={level} level={level} />
                ))}
              </div>
              <span>较多</span>
            </div>
            <div className="flex -translate-x-[15px] items-center gap-2 rounded-full border border-[#f2d7bc] bg-[#fff6eb] px-3.5 py-1.5 text-[13px] font-medium text-[#ff6a1a]">
              <Flame className="h-5 w-5" />
              连续表现很棒！
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
