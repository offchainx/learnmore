'use client'

import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

type AnchorId =
  | 'practice-subject-selector'
  | 'practice-mode-grid'
  | 'practice-left-stack'
  | 'practice-secondary-grid'
  | 'practice-chapter-card'
  | 'practice-pastpaper-card'
  | 'practice-coach-knowledge'
  | 'practice-coach-forecast'
  | 'practice-coach-weakness'

type AnchorRect = {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}

type PairConfig =
  | {
      id: string
      kind: 'vertical'
      from: AnchorId
      to: AnchorId
      label: string
    }
  | {
      id: string
      kind: 'horizontal'
      from: AnchorId
      to: AnchorId
      label: string
    }

const PAIRS: PairConfig[] = [
  {
    id: 'selector-to-mode',
    kind: 'vertical',
    from: 'practice-subject-selector',
    to: 'practice-mode-grid',
    label: 'selector → 练习模式',
  },
  {
    id: 'mode-to-secondary',
    kind: 'vertical',
    from: 'practice-mode-grid',
    to: 'practice-secondary-grid',
    label: '练习模式 → 下方分区',
  },
  {
    id: 'chapter-to-paper',
    kind: 'horizontal',
    from: 'practice-chapter-card',
    to: 'practice-pastpaper-card',
    label: '章节地图 ↔ 历年题',
  },
  {
    id: 'left-to-coach',
    kind: 'horizontal',
    from: 'practice-left-stack',
    to: 'practice-coach-knowledge',
    label: '左侧内容 ↔ 教练面板',
  },
  {
    id: 'coach-knowledge-to-forecast',
    kind: 'vertical',
    from: 'practice-coach-knowledge',
    to: 'practice-coach-forecast',
    label: '知识蜂巢 → 考试预测',
  },
  {
    id: 'coach-forecast-to-weakness',
    kind: 'vertical',
    from: 'practice-coach-forecast',
    to: 'practice-coach-weakness',
    label: '考试预测 → 薄弱点',
  },
]

const ANCHOR_IDS: AnchorId[] = [
  'practice-subject-selector',
  'practice-mode-grid',
  'practice-left-stack',
  'practice-secondary-grid',
  'practice-chapter-card',
  'practice-pastpaper-card',
  'practice-coach-knowledge',
  'practice-coach-forecast',
  'practice-coach-weakness',
]

function readAnchorRect(id: AnchorId): AnchorRect | null {
  const node = document.querySelector<HTMLElement>(
    `[data-layout-anchor="${id}"]`
  )
  if (!node) return null
  const rect = node.getBoundingClientRect()
  return {
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
  }
}

function formatPx(value: number) {
  return `${Math.max(0, Math.round(value))}px`
}

export function PracticeSpacingDebugOverlay({ enabled }: { enabled: boolean }) {
  const [anchors, setAnchors] = useState<Record<AnchorId, AnchorRect | null>>(
    () => ({
      'practice-subject-selector': null,
      'practice-mode-grid': null,
      'practice-left-stack': null,
      'practice-secondary-grid': null,
      'practice-chapter-card': null,
      'practice-pastpaper-card': null,
      'practice-coach-knowledge': null,
      'practice-coach-forecast': null,
      'practice-coach-weakness': null,
    })
  )

  const refresh = () => {
    setAnchors({
      'practice-subject-selector': readAnchorRect('practice-subject-selector'),
      'practice-mode-grid': readAnchorRect('practice-mode-grid'),
      'practice-left-stack': readAnchorRect('practice-left-stack'),
      'practice-secondary-grid': readAnchorRect('practice-secondary-grid'),
      'practice-chapter-card': readAnchorRect('practice-chapter-card'),
      'practice-pastpaper-card': readAnchorRect('practice-pastpaper-card'),
      'practice-coach-knowledge': readAnchorRect('practice-coach-knowledge'),
      'practice-coach-forecast': readAnchorRect('practice-coach-forecast'),
      'practice-coach-weakness': readAnchorRect('practice-coach-weakness'),
    })
  }

  useEffect(() => {
    if (!enabled) return

    refresh()

    const onResize = () => refresh()
    const onScroll = () => refresh()
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll, { passive: true })

    const observer = new ResizeObserver(() => refresh())
    for (const id of ANCHOR_IDS) {
      const node = document.querySelector<HTMLElement>(
        `[data-layout-anchor="${id}"]`
      )
      if (node) observer.observe(node)
    }

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll)
      observer.disconnect()
    }
  }, [enabled])

  const items = useMemo(() => {
    return PAIRS.map((pair) => {
      const from = anchors[pair.from]
      const to = anchors[pair.to]
      if (!from || !to) return null

      if (pair.kind === 'vertical') {
        const gap = to.top - from.bottom
        if (gap < 0) return null
        const left = Math.min(from.left, to.left) + 12
        const top = from.bottom + gap / 2
        return {
          ...pair,
          gap,
          left,
          top,
          lineLeft: left + 56,
          lineTop: from.bottom,
          lineHeight: gap,
        }
      }

      const gap = to.left - from.right
      if (gap < 0) return null
      const top = Math.min(from.top, to.top) + 12
      const left = from.right + gap / 2
      return {
        ...pair,
        gap,
        left,
        top,
        lineLeft: from.right,
        lineTop: top + 10,
        lineWidth: gap,
      }
    })
  }, [anchors])

  if (!enabled) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[80]">
      <div className="absolute right-4 top-4 w-[280px] rounded-2xl border border-borderTone/80 bg-white/90 p-3 text-[11px] text-text-secondary shadow-[0_20px_45px_rgba(15,23,42,0.14)] backdrop-blur">
        <div className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-text-tertiary">
          Layout Debug
        </div>
        <div className="space-y-1.5">
          {items.map((item) =>
            item ? (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2"
              >
                <span className="truncate text-text-secondary">
                  {item.label}
                </span>
                <span className="rounded-full bg-surface-subtle px-2 py-0.5 font-semibold text-text-primary">
                  {formatPx(item.gap)}
                </span>
              </div>
            ) : null
          )}
        </div>
      </div>

      {items.map((item) =>
        item ? (
          <div key={item.id}>
            {item.kind === 'vertical' ? (
              <>
                <div
                  className="absolute w-px bg-primary/25"
                  style={{
                    left: item.lineLeft,
                    top: item.lineTop,
                    height: item.lineHeight,
                  }}
                />
                <div
                  className={cn(
                    'absolute rounded-full border border-primary/20 bg-white/95 px-2 py-1 text-[10px] font-bold text-primary shadow-[0_8px_18px_rgba(249,115,22,0.12)]'
                  )}
                  style={{ left: item.left, top: item.top - 10 }}
                >
                  {formatPx(item.gap)}
                </div>
              </>
            ) : (
              <>
                <div
                  className="absolute h-px bg-primary/25"
                  style={{
                    left: item.lineLeft,
                    top: item.lineTop,
                    width: item.lineWidth,
                  }}
                />
                <div
                  className={cn(
                    'absolute rounded-full border border-primary/20 bg-white/95 px-2 py-1 text-[10px] font-bold text-primary shadow-[0_8px_18px_rgba(249,115,22,0.12)]'
                  )}
                  style={{ left: item.left - 18, top: item.top }}
                >
                  {formatPx(item.gap)}
                </div>
              </>
            )}
          </div>
        ) : null
      )}
    </div>
  )
}
