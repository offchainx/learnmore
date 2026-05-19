'use client'

import React from 'react'
import type { DashboardHeroLayoutPreset } from './heroLayoutPreset'

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

export function DashboardHeroLayoutInspector({
  visible,
  selected,
  preset,
  saving,
  onPresetChange,
  onSave,
}: {
  visible: boolean
  selected: boolean
  preset: DashboardHeroLayoutPreset
  saving: boolean
  onPresetChange: (preset: DashboardHeroLayoutPreset) => void
  onSave: () => void
}) {
  if (!visible) {
    return null
  }

  const patchPreset = (patch: Partial<DashboardHeroLayoutPreset>) => {
    onPresetChange({
      ...preset,
      ...patch,
    })
  }

  return (
    <aside className="fixed right-5 top-5 z-[120] w-[320px] rounded-[24px] border border-[#ebd7c1] bg-white/95 p-4 shadow-[0_26px_60px_-30px_rgba(120,72,32,0.35)] backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#f07d2c]">
            Hero Preset
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
          点击 Hero 卡片后，这里会显示可调参数。当前只接入 desktop preset。
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
              min={720}
              max={1400}
              step={1}
              onChange={(value) =>
                patchPreset({
                  shell: { ...preset.shell, width: value },
                })
              }
            />
            <RangeField
              label="高度"
              value={preset.shell.height}
              min={260}
              max={560}
              step={1}
              onChange={(value) =>
                patchPreset({
                  shell: { ...preset.shell, height: value },
                })
              }
            />
            <RangeField
              label="内容宽度"
              value={preset.contentMaxWidth}
              min={280}
              max={560}
              step={1}
              onChange={(value) => patchPreset({ contentMaxWidth: value })}
            />
          </section>

          <section className="space-y-3 rounded-[18px] bg-[#fbf6ee] p-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#7a6b5d]">
              Artwork
            </div>
            <RangeField
              label="X"
              value={preset.artFrame.x}
              min={-240}
              max={240}
              step={1}
              onChange={(value) =>
                patchPreset({
                  artFrame: { ...preset.artFrame, x: value },
                })
              }
            />
            <RangeField
              label="Y"
              value={preset.artFrame.y}
              min={-240}
              max={240}
              step={1}
              onChange={(value) =>
                patchPreset({
                  artFrame: { ...preset.artFrame, y: value },
                })
              }
            />
            <RangeField
              label="宽度"
              value={preset.artFrame.width}
              min={720}
              max={1400}
              step={1}
              onChange={(value) =>
                patchPreset({
                  artFrame: { ...preset.artFrame, width: value },
                })
              }
            />
            <RangeField
              label="高度"
              value={preset.artFrame.height}
              min={280}
              max={820}
              step={1}
              onChange={(value) =>
                patchPreset({
                  artFrame: { ...preset.artFrame, height: value },
                })
              }
            />
          </section>

          <section className="space-y-3 rounded-[18px] bg-[#fbf6ee] p-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#7a6b5d]">
              CTA
            </div>
            <RangeField
              label="横向偏移"
              value={preset.ctaOffset.x}
              min={-120}
              max={220}
              step={1}
              onChange={(value) =>
                patchPreset({
                  ctaOffset: { ...preset.ctaOffset, x: value },
                })
              }
            />
            <RangeField
              label="纵向偏移"
              value={preset.ctaOffset.y}
              min={-220}
              max={80}
              step={1}
              onChange={(value) =>
                patchPreset({
                  ctaOffset: { ...preset.ctaOffset, y: value },
                })
              }
            />
          </section>
        </div>
      )}
    </aside>
  )
}
