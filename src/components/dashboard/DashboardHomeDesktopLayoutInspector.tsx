'use client'

import {
  DASHBOARD_HOME_MIN_ASIDE_WIDTH,
  type DashboardHomeDesktopLayoutPreset,
} from './dashboardHomeDesktopLayoutPreset'

function RangeField({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
}) {
  return (
    <label className="block space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12px] font-medium text-[#31404f]">{label}</span>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-8 w-24 rounded-lg border border-[#dfcdb7] bg-white px-2 text-right text-[12px] text-[#24303c] shadow-sm outline-none focus:border-[#ff8a20]"
        />
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-[#ff7d19]"
      />
    </label>
  )
}

type SelectedCard = 'hero' | 'profile' | 'task' | 'path' | 'streak' | 'goal' | null

export function DashboardHomeDesktopLayoutInspector({
  visible,
  selectedCard,
  preset,
  saving,
  onPresetChange,
  onSave,
}: {
  visible: boolean
  selectedCard: SelectedCard
  preset: DashboardHomeDesktopLayoutPreset
  saving: boolean
  onPresetChange: (preset: DashboardHomeDesktopLayoutPreset) => void
  onSave: () => void
}) {
  if (!visible) {
    return null
  }

  return (
    <aside className="fixed right-5 top-5 z-[120] w-[320px] rounded-[24px] border border-[#ebd7c1] bg-white/95 p-4 shadow-[0_26px_60px_-30px_rgba(120,72,32,0.35)] backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#f07d2c]">
            Dashboard Layout
          </div>
          <h2 className="mt-1 text-[18px] font-semibold tracking-tight text-[#24303c]">
            Desktop Inspector
          </h2>
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-full bg-[#ff7d19] px-3 py-1.5 text-[12px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? '保存中...' : '保存 preset'}
        </button>
      </div>

      <div className="mt-4 space-y-4">
        <section className="space-y-3 rounded-[18px] bg-[#fbf6ee] p-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#7a6b5d]">
            Page
          </div>
          <RangeField
            label="页面最大宽度"
            value={preset.pageMaxWidth}
            min={1200}
            max={1800}
            onChange={(value) =>
              onPresetChange({
                ...preset,
                pageMaxWidth: value,
              })
            }
          />
          <RangeField
            label="主栅格间距"
            value={preset.gridGap}
            min={8}
            max={64}
            onChange={(value) =>
              onPresetChange({
                ...preset,
                gridGap: value,
              })
            }
          />
        </section>

        <section className="space-y-3 rounded-[18px] bg-[#fbf6ee] p-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#7a6b5d]">
            {selectedCard === 'profile'
              ? 'Profile'
              : selectedCard === 'task'
                ? 'Task'
                : selectedCard === 'path'
                  ? 'Path'
                  : selectedCard === 'streak'
                    ? 'Streak'
                    : selectedCard === 'goal'
                      ? 'Goal'
                      : 'Hero'}
          </div>
          {selectedCard === 'profile' ? (
            <>
              <RangeField
                label="宽度"
                value={preset.asideWidth}
                min={DASHBOARD_HOME_MIN_ASIDE_WIDTH}
                max={700}
                onChange={(value) =>
                  onPresetChange({
                    ...preset,
                    asideWidth: value,
                  })
                }
              />
              <RangeField
                label="X 偏移"
                value={preset.asideOffsetX}
                min={-160}
                max={160}
                onChange={(value) =>
                  onPresetChange({
                    ...preset,
                    asideOffsetX: value,
                  })
                }
              />
              <RangeField
                label="Y 偏移"
                value={preset.asideOffsetY}
                min={-160}
                max={160}
                onChange={(value) =>
                  onPresetChange({
                    ...preset,
                    asideOffsetY: value,
                  })
                }
              />
              <RangeField
                label="Sticky Top"
                value={preset.asideStickyTop}
                min={0}
                max={80}
                onChange={(value) =>
                  onPresetChange({
                    ...preset,
                    asideStickyTop: value,
                  })
                }
              />
            </>
          ) : selectedCard === 'task' ? (
            <>
              <RangeField
                label="X 偏移"
                value={preset.taskOffsetX}
                min={-160}
                max={160}
                onChange={(value) =>
                  onPresetChange({
                    ...preset,
                    taskOffsetX: value,
                  })
                }
              />
              <RangeField
                label="Y 偏移"
                value={preset.taskOffsetY}
                min={-160}
                max={160}
                onChange={(value) =>
                  onPresetChange({
                    ...preset,
                    taskOffsetY: value,
                  })
                }
              />
            </>
          ) : selectedCard === 'path' ? (
            <>
              <RangeField
                label="X 偏移"
                value={preset.pathOffsetX}
                min={-160}
                max={160}
                onChange={(value) =>
                  onPresetChange({
                    ...preset,
                    pathOffsetX: value,
                  })
                }
              />
              <RangeField
                label="Y 偏移"
                value={preset.pathOffsetY}
                min={-160}
                max={160}
                onChange={(value) =>
                  onPresetChange({
                    ...preset,
                    pathOffsetY: value,
                  })
                }
              />
            </>
          ) : selectedCard === 'streak' ? (
            <>
              <RangeField
                label="X 偏移"
                value={preset.streakOffsetX}
                min={-160}
                max={160}
                onChange={(value) =>
                  onPresetChange({
                    ...preset,
                    streakOffsetX: value,
                  })
                }
              />
              <RangeField
                label="Y 偏移"
                value={preset.streakOffsetY}
                min={-160}
                max={160}
                onChange={(value) =>
                  onPresetChange({
                    ...preset,
                    streakOffsetY: value,
                  })
                }
              />
            </>
          ) : selectedCard === 'goal' ? (
            <>
              <RangeField
                label="X 偏移"
                value={preset.goalOffsetX}
                min={-160}
                max={160}
                onChange={(value) =>
                  onPresetChange({
                    ...preset,
                    goalOffsetX: value,
                  })
                }
              />
              <RangeField
                label="Y 偏移"
                value={preset.goalOffsetY}
                min={-160}
                max={160}
                onChange={(value) =>
                  onPresetChange({
                    ...preset,
                    goalOffsetY: value,
                  })
                }
              />
            </>
          ) : selectedCard === 'hero' ? (
            <>
              <RangeField
                label="X 偏移"
                value={preset.heroOffsetX}
                min={-160}
                max={160}
                onChange={(value) =>
                  onPresetChange({
                    ...preset,
                    heroOffsetX: value,
                  })
                }
              />
              <RangeField
                label="Y 偏移"
                value={preset.heroOffsetY}
                min={-160}
                max={160}
                onChange={(value) =>
                  onPresetChange({
                    ...preset,
                    heroOffsetY: value,
                  })
                }
              />
            </>
          ) : (
            <div className="rounded-[14px] border border-dashed border-[#e8d4bf] bg-[#fff8ef] px-3 py-3 text-[13px] leading-6 text-[#5e6976]">
              点击需要调整的卡片后，再调整对应位置参数。
            </div>
          )}
        </section>
      </div>
    </aside>
  )
}
