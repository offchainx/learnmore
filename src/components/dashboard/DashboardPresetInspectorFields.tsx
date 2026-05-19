'use client'

import React from 'react'

export function RangeField({
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

export function InspectorPanel({
  visible,
  selected,
  saving,
  presetLabel,
  children,
  onSave,
}: {
  visible: boolean
  selected: boolean
  saving: boolean
  presetLabel: string
  children: React.ReactNode
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
            {presetLabel}
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
          点击对应卡片后，这里会显示可调参数。
        </div>
      ) : (
        <div className="mt-4 space-y-4">{children}</div>
      )}
    </aside>
  )
}

export function SectionBlock({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3 rounded-[18px] bg-[#fbf6ee] p-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#7a6b5d]">
        {title}
      </div>
      {children}
    </section>
  )
}
