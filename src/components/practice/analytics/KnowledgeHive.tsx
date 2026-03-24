'use client'

import { memo, useState, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  pageBadgeClass,
  pagePanelClass,
} from '@/components/shared/pageSurfaces'
import {
  pageCardTitleClass,
  pageMetaTextClass,
} from '@/components/shared/pageTypography'
import type { HiveNode, HiveNodeStatus } from '@/lib/practice/types'
import { cn } from '@/lib/utils'

interface KnowledgeHiveProps {
  nodes: HiveNode[]
  subjectName?: string
  loading?: boolean
  error?: string | null
}

type HiveRowSlot =
  | { type: 'node'; node: HiveNode }
  | { type: 'placeholder' }

interface HiveRowData {
  slots: HiveRowSlot[]
  offset: boolean
}

type HiveLayoutMode = 'compact' | 'dense'

interface HiveLayoutConfig {
  slotWidth: number
  slotHeight: number
  horizontalGap: number
  verticalGap: number
  evenRowOffset: number
  rowPattern: [number, number]
}

interface PositionedHiveRow {
  left: number
  top: number
  slots: HiveRowSlot[]
}

const HEXAGON_CLIP_PATH =
  'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'

const HIVE_LAYOUT_CONFIGS: Record<HiveLayoutMode, HiveLayoutConfig> = {
  compact: {
    slotWidth: 40,
    slotHeight: 46,
    horizontalGap: 5,
    verticalGap: 4,
    evenRowOffset: -20,
    rowPattern: [5, 6],
  },
  dense: {
    slotWidth: 34,
    slotHeight: 39,
    horizontalGap: 5,
    verticalGap: 3,
    evenRowOffset: -18,
    rowPattern: [9, 10],
  },
}

const cardClassName = pagePanelClass

/**
 * 蜂巢节点组件
 */
const HiveCell = memo(function HiveCell({
  node,
  slotWidth,
  slotHeight,
  onClick,
}: {
  node: HiveNode
  slotWidth: number
  slotHeight: number
  onClick: () => void
}) {
  const [showTooltip, setShowTooltip] = useState(false)

  // 根据状态设置样式
  const statusStyles: Record<HiveNodeStatus, string> = {
    strong: 'text-green-500 hover:text-green-400',
    fair: 'text-yellow-500 hover:text-yellow-400',
    weak: 'text-red-500 hover:text-red-400',
    locked: 'text-gray-500 hover:text-gray-400',
  }

  const statusLabels: Record<HiveNodeStatus, string> = {
    strong: '掌握良好',
    fair: '有待加强',
    weak: '需要练习',
    locked: '未开始',
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className={cn(
          'transform rounded transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50',
          statusStyles[node.status],
          node.status === 'locked' && 'cursor-not-allowed opacity-60'
        )}
        disabled={node.status === 'locked'}
        aria-label={`${node.chapterTitle} - ${statusLabels[node.status]}`}
        style={{ width: slotWidth, height: slotHeight }}
      >
        <span
          aria-hidden="true"
          className="block h-full w-full bg-current"
          style={{ clipPath: HEXAGON_CLIP_PATH }}
        />
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-lg"
          role="tooltip"
        >
          <div className="font-medium">{node.chapterTitle}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {node.status === 'locked' ? (
              '尚未练习'
            ) : (
              <>
                正确率: {node.correctRate}% · 做题: {node.totalAttempts}次
              </>
            )}
          </div>
          <div className="mt-1 text-xs">
            <span
              className={cn(
                'inline-block rounded px-1.5 py-0.5 text-white',
                node.status === 'strong' && 'bg-green-500',
                node.status === 'fair' && 'bg-yellow-500',
                node.status === 'weak' && 'bg-red-500',
                node.status === 'locked' && 'bg-gray-500'
              )}
            >
              {statusLabels[node.status]}
            </span>
          </div>
          {/* Tooltip arrow */}
          <div className="absolute left-1/2 top-full -mt-px -translate-x-1/2">
            <div className="border-8 border-transparent border-t-popover" />
          </div>
        </div>
      )}
    </div>
  )
})

function createPreferredRows(nodes: HiveNode[]): HiveRowData[] | null {
  if (nodes.length === 15) {
    return [
      {
        slots: nodes
          .slice(0, 5)
          .map((node) => ({ type: 'node' as const, node })),
        offset: true,
      },
      {
        slots: [
          ...nodes
            .slice(5, 10)
            .map((node) => ({ type: 'node' as const, node })),
          { type: 'placeholder' as const },
        ],
        offset: false,
      },
      {
        slots: nodes
          .slice(10, 15)
          .map((node) => ({ type: 'node' as const, node })),
        offset: true,
      },
    ]
  }

  if (nodes.length === 16) {
    return [
      {
        slots: nodes
          .slice(0, 5)
          .map((node) => ({ type: 'node' as const, node })),
        offset: true,
      },
      {
        slots: nodes
          .slice(5, 11)
          .map((node) => ({ type: 'node' as const, node })),
        offset: false,
      },
      {
        slots: nodes
          .slice(11, 16)
          .map((node) => ({ type: 'node' as const, node })),
        offset: true,
      },
    ]
  }

  return null
}

function distributeToRows(nodeList: HiveNode[]): HiveRowData[] {
  const layoutMode = resolveHiveLayoutMode(nodeList)
  const [compactCount, expandedCount] = HIVE_LAYOUT_CONFIGS[layoutMode].rowPattern
  const preferredRows = createPreferredRows(nodeList)
  if (preferredRows) {
    return preferredRows
  }

  const rows: HiveRowData[] = []
  let index = 0
  let rowIndex = 0

  while (index < nodeList.length) {
    const slotCount = rowIndex % 2 === 0 ? compactCount : expandedCount
    const rowNodes = nodeList.slice(index, index + slotCount)
    const slots: HiveRowSlot[] = [
      ...rowNodes.map((node) => ({ type: 'node' as const, node })),
      ...Array.from({ length: slotCount - rowNodes.length }, () => ({
        type: 'placeholder' as const,
      })),
    ]

    rows.push({
      slots,
      offset: rowIndex % 2 === 0,
    })
    index += rowNodes.length
    rowIndex++
  }

  return rows
}

function resolveHiveLayoutMode(nodes: HiveNode[]): HiveLayoutMode {
  return nodes.length >= 40 ? 'dense' : 'compact'
}

function buildPositionedRows(
  rows: HiveRowData[],
  config: HiveLayoutConfig
): {
  rows: PositionedHiveRow[]
  width: number
  height: number
} {
  const stepX = config.slotWidth + config.horizontalGap
  const offsetX = stepX / 2 + config.evenRowOffset
  const rowStepY = config.slotHeight * 0.75 + config.verticalGap

  const measuredRows = rows.map((row, index) => ({
    left: row.offset ? offsetX : 0,
    top: index * rowStepY,
    slots: row.slots,
    width: row.slots.length * stepX + (row.offset ? offsetX : 0),
  }))

  const width = Math.max(...measuredRows.map((row) => row.width))
  const height =
    config.slotHeight + Math.max(0, measuredRows.length - 1) * rowStepY

  return {
    width,
    height,
    rows: measuredRows.map((row) => ({
      top: row.top,
      left: (width - row.width) / 2 + row.left,
      slots: row.slots,
    })),
  }
}

/**
 * 知识蜂巢主组件
 * 显示用户在某科目各章节的掌握度可视化（数据由父组件注入）
 */
function KnowledgeHiveInner({
  nodes,
  subjectName,
  loading = false,
  error = null,
}: KnowledgeHiveProps) {
  const router = useRouter()
  const layoutMode = resolveHiveLayoutMode(nodes)
  const layoutConfig = HIVE_LAYOUT_CONFIGS[layoutMode]

  const handleNodeClick = (node: HiveNode) => {
    if (node.status === 'locked') return
    // 跳转到章节练习页面
    router.push(`/dashboard/practice/chapter-drill/${node.chapterId}`)
  }

  if (loading) {
    const loadingRows = distributeToRows(
      Array.from({
        length: layoutMode === 'dense' ? 38 : 15,
      }).map((_, index) => ({
        chapterId: `loading-${index}`,
        chapterTitle: `loading-${index}`,
        masteryLevel: 0,
        status: 'locked' as const,
        correctRate: 0,
        totalAttempts: 0,
        color: '#6b7280',
      }))
    )
    const positionedLoadingRows = buildPositionedRows(
      loadingRows,
      layoutConfig
    )

    return (
      <Card className={cardClassName}>
        <CardHeader className="pb-2">
          <CardTitle className={pageCardTitleClass}>知识蜂巢</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center pt-2">
            <div
              className="relative"
              style={
                {
                  width: positionedLoadingRows.width,
                  height: positionedLoadingRows.height,
                } as CSSProperties
              }
            >
              {positionedLoadingRows.rows.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="absolute left-0 top-0"
                  style={
                    {
                      width:
                        row.slots.length *
                        (layoutConfig.slotWidth + layoutConfig.horizontalGap),
                      height: layoutConfig.slotHeight,
                      transform: `translate(${row.left}px, ${row.top}px)`,
                    } as CSSProperties
                  }
                >
                  {row.slots.map((slot, slotIndex) => (
                    <div
                      key={
                        slot.type === 'node'
                          ? slot.node.chapterId
                          : `loading-placeholder-${rowIndex}-${slotIndex}`
                      }
                      className="absolute left-0 top-0 flex items-center justify-center"
                      style={
                        {
                          width: layoutConfig.slotWidth,
                          height: layoutConfig.slotHeight,
                          transform: `translateX(${slotIndex * (layoutConfig.slotWidth + layoutConfig.horizontalGap)}px)`,
                        } as CSSProperties
                      }
                    >
                      <Skeleton
                        className="h-full w-full bg-surface-subtle dark:bg-slate-700"
                        style={{ clipPath: HEXAGON_CLIP_PATH }}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cardClassName}>
        <CardHeader className="pb-2">
          <CardTitle className={pageCardTitleClass}>知识蜂巢</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`py-4 text-center ${pageMetaTextClass}`}>{error}</div>
        </CardContent>
      </Card>
    )
  }

  if (nodes.length === 0) {
    return (
      <Card className={cardClassName}>
        <CardHeader className="pb-2">
          <CardTitle className={pageCardTitleClass}>知识蜂巢</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`py-4 text-center ${pageMetaTextClass}`}>
            暂无蜂巢数据
          </div>
        </CardContent>
      </Card>
    )
  }

  const rows = distributeToRows(nodes)
  const positionedRows = buildPositionedRows(rows, layoutConfig)

  // 统计各状态数量
  const stats = nodes.reduce(
    (acc, node) => {
      acc[node.status]++
      return acc
    },
    { strong: 0, fair: 0, weak: 0, locked: 0 } as Record<HiveNodeStatus, number>
  )

  return (
    <Card className={cardClassName}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between gap-3">
          <span>知识蜂巢</span>
          {subjectName && <span className={pageBadgeClass}>{subjectName}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {/* 图例 */}
        <div className="mb-3 flex flex-wrap justify-center gap-1.5 text-[10px]">
          <div className="flex items-center gap-1 rounded-full border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-green-800 dark:text-green-200">
            <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
            <span>掌握良好 ({stats.strong})</span>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2 py-0.5 text-yellow-800 dark:text-yellow-100">
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
            <span>有待加强 ({stats.fair})</span>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-red-700 dark:text-red-100">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span>需要练习 ({stats.weak})</span>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-borderTone bg-surface-subtle px-2 py-0.5 text-text-secondary dark:border-slate-500/20 dark:bg-slate-500/10 dark:text-slate-200">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-400" />
            <span>未开始 ({stats.locked})</span>
          </div>
        </div>

        {/* 蜂巢网格 */}
        <div className="flex justify-center pt-3">
          <div
            className="relative"
            style={
              {
                width: positionedRows.width,
                height: positionedRows.height,
              } as CSSProperties
            }
          >
            {positionedRows.rows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="absolute left-0 top-0"
                style={
                  {
                    width:
                      row.slots.length *
                      (layoutConfig.slotWidth + layoutConfig.horizontalGap),
                    height: layoutConfig.slotHeight,
                    transform: `translate(${row.left}px, ${row.top}px)`,
                  } as CSSProperties
                }
              >
                {row.slots.map((slot, slotIndex) => (
                  <div
                    key={
                      slot.type === 'node'
                        ? slot.node.chapterId
                        : `placeholder-${rowIndex}-${slotIndex}`
                    }
                    className="absolute left-0 top-0 flex items-center justify-center"
                    style={
                      {
                        width: layoutConfig.slotWidth,
                        height: layoutConfig.slotHeight,
                        transform: `translateX(${slotIndex * (layoutConfig.slotWidth + layoutConfig.horizontalGap)}px)`,
                      } as CSSProperties
                    }
                  >
                    {slot.type === 'node' ? (
                      <HiveCell
                        node={slot.node}
                        slotWidth={layoutConfig.slotWidth}
                        slotHeight={layoutConfig.slotHeight}
                        onClick={() => handleNodeClick(slot.node)}
                      />
                    ) : (
                      <div
                        aria-hidden="true"
                        className="h-full w-full opacity-0"
                        style={{ clipPath: HEXAGON_CLIP_PATH }}
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* 底部提示 */}
        <p className={`mt-3 text-center ${pageMetaTextClass}`}>
          点击六边形可进入对应章节练习
        </p>
      </CardContent>
    </Card>
  )
}

// 使用 React.memo 优化性能
const KnowledgeHive = memo(KnowledgeHiveInner)

export default KnowledgeHive
