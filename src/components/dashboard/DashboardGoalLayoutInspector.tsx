'use client'

import React from 'react'
import type { DashboardGoalLayoutPreset } from './goalLayoutPreset'

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

export function DashboardGoalLayoutInspector({
  visible,
  selected,
  preset,
  saving,
  onPresetChange,
  onSave,
}: {
  visible: boolean
  selected: boolean
  preset: DashboardGoalLayoutPreset
  saving: boolean
  onPresetChange: (preset: DashboardGoalLayoutPreset) => void
  onSave: () => void
}) {
  if (!visible) {
    return null
  }

  return (
    <aside className="fixed right-5 top-5 z-[120] max-h-[calc(100vh-40px)] w-[320px] overflow-y-auto rounded-[24px] border border-[#ebd7c1] bg-white/95 p-4 shadow-[0_26px_60px_-30px_rgba(120,72,32,0.35)] backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#f07d2c]">
            Goal Preset
          </div>
          <h2 className="mt-1 text-[18px] font-semibold tracking-tight text-[#24303c]">
            Desktop Inspector
          </h2>
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={!selected || saving}
          className="rounded-full bg-[#ff7d19] px-3 py-1.5 text-[12px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? '保存中...' : '保存 preset'}
        </button>
      </div>

      {!selected ? (
        <div className="mt-4 rounded-[18px] border border-dashed border-[#e8d4bf] bg-[#fff8ef] px-4 py-4 text-[13px] leading-6 text-[#5e6976]">
          点击本周目标进度卡片后，这里会显示可调参数。
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <section className="space-y-3 rounded-[18px] bg-[#fbf6ee] p-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#7a6b5d]">
              Card
            </div>
            <RangeField
              label="宽度"
              value={preset.shell.width}
              min={300}
              max={800}
              onChange={(next) =>
                onPresetChange({
                  ...preset,
                  shell: { ...preset.shell, width: next },
                })
              }
            />
            <RangeField
              label="高度"
              value={preset.shell.height}
              min={170}
              max={360}
              onChange={(next) =>
                onPresetChange({
                  ...preset,
                  shell: { ...preset.shell, height: next },
                })
              }
            />
          </section>

          <section className="space-y-3 rounded-[18px] bg-[#fbf6ee] p-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#7a6b5d]">
              Title
            </div>
            <RangeField
              label="X"
              value={preset.titleTransform.x}
              min={-120}
              max={120}
              onChange={(next) =>
                onPresetChange({
                  ...preset,
                  titleTransform: { ...preset.titleTransform, x: next },
                })
              }
            />
            <RangeField
              label="Y"
              value={preset.titleTransform.y}
              min={-40}
              max={60}
              onChange={(next) =>
                onPresetChange({
                  ...preset,
                  titleTransform: { ...preset.titleTransform, y: next },
                })
              }
            />
            <RangeField
              label="缩放"
              value={preset.titleTransform.scale}
              min={0.7}
              max={1.45}
              step={0.01}
              onChange={(next) =>
                onPresetChange({
                  ...preset,
                  titleTransform: { ...preset.titleTransform, scale: next },
                })
              }
            />
          </section>

          <section className="space-y-3 rounded-[18px] bg-[#fbf6ee] p-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#7a6b5d]">
              Summary
            </div>
            <RangeField
              label="X"
              value={preset.summaryOffset.x}
              min={-40}
              max={80}
              onChange={(next) =>
                onPresetChange({
                  ...preset,
                  summaryOffset: { ...preset.summaryOffset, x: next },
                })
              }
            />
            <RangeField
              label="Y"
              value={preset.summaryOffset.y}
              min={-80}
              max={40}
              onChange={(next) =>
                onPresetChange({
                  ...preset,
                  summaryOffset: { ...preset.summaryOffset, y: next },
                })
              }
            />
          </section>

          <section className="space-y-3 rounded-[18px] bg-[#fbf6ee] p-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#7a6b5d]">
              Trophy
            </div>
            <RangeField
              label="X"
              value={preset.trophyFrame.x}
              min={-60}
              max={80}
              onChange={(next) =>
                onPresetChange({
                  ...preset,
                  trophyFrame: { ...preset.trophyFrame, x: next },
                })
              }
            />
            <RangeField
              label="Y"
              value={preset.trophyFrame.y}
              min={-60}
              max={80}
              onChange={(next) =>
                onPresetChange({
                  ...preset,
                  trophyFrame: { ...preset.trophyFrame, y: next },
                })
              }
            />
            <RangeField
              label="宽度"
              value={preset.trophyFrame.width}
              min={80}
              max={200}
              onChange={(next) =>
                onPresetChange({
                  ...preset,
                  trophyFrame: { ...preset.trophyFrame, width: next },
                })
              }
            />
            <RangeField
              label="高度"
              value={preset.trophyFrame.height}
              min={80}
              max={200}
              onChange={(next) =>
                onPresetChange({
                  ...preset,
                  trophyFrame: { ...preset.trophyFrame, height: next },
                })
              }
            />
          </section>
        </div>
      )}
    </aside>
  )
}
