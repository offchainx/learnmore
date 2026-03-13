'use client'

import { memo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Hexagon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { HiveNode, HiveNodeStatus } from '@/lib/practice/types'
import { cn } from '@/lib/utils'

interface KnowledgeHiveProps {
  nodes: HiveNode[]
  subjectName?: string
  loading?: boolean
  error?: string | null
}

const cardClassName =
  'overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))] text-white shadow-[0_18px_40px_rgba(2,8,23,0.28)]'

/**
 * 蜂巢节点组件
 */
const HiveCell = memo(function HiveCell({
  node,
  onClick
}: {
  node: HiveNode
  onClick: () => void
}) {
  const [showTooltip, setShowTooltip] = useState(false)

  // 根据状态设置样式
  const statusStyles: Record<HiveNodeStatus, string> = {
    strong: 'text-green-500 hover:text-green-400',
    fair: 'text-yellow-500 hover:text-yellow-400',
    weak: 'text-red-500 hover:text-red-400',
    locked: 'text-gray-500 hover:text-gray-400'
  }

  const statusLabels: Record<HiveNodeStatus, string> = {
    strong: '掌握良好',
    fair: '有待加强',
    weak: '需要练习',
    locked: '未开始'
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
          'transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded',
          statusStyles[node.status],
          node.status === 'locked' && 'cursor-not-allowed opacity-60'
        )}
        disabled={node.status === 'locked'}
        aria-label={`${node.chapterTitle} - ${statusLabels[node.status]}`}
      >
        <Hexagon
          className="h-9 w-9 sm:h-10 sm:w-10"
          fill="currentColor"
          strokeWidth={1.5}
        />
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2
                     bg-popover text-popover-foreground text-sm rounded-lg shadow-lg
                     border border-border whitespace-nowrap"
          role="tooltip"
        >
          <div className="font-medium">{node.chapterTitle}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {node.status === 'locked' ? (
              '尚未练习'
            ) : (
              <>
                正确率: {node.correctRate}% · 做题: {node.totalAttempts}次
              </>
            )}
          </div>
          <div className="text-xs mt-1">
            <span
              className={cn(
                'inline-block px-1.5 py-0.5 rounded text-white',
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
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="border-8 border-transparent border-t-popover" />
          </div>
        </div>
      )}
    </div>
  )
})

/**
 * 蜂巢布局行组件
 */
const HiveRow = memo(function HiveRow({
  nodes,
  offset,
  onNodeClick
}: {
  nodes: HiveNode[]
  offset: boolean
  onNodeClick: (node: HiveNode) => void
}) {
  return (
    <div
      className={cn(
        'flex justify-center gap-1',
        offset && 'ml-4 sm:ml-5'
      )}
    >
      {nodes.map((node) => (
        <HiveCell
          key={node.chapterId}
          node={node}
          onClick={() => onNodeClick(node)}
        />
      ))}
    </div>
  )
})

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

  const handleNodeClick = (node: HiveNode) => {
    if (node.status === 'locked') return
    // 跳转到章节练习页面
    router.push(`/dashboard/practice/chapter-drill/${node.chapterId}`)
  }

  // 将节点分成蜂巢布局行 (5-4-5-4 交错模式)
  const distributeToRows = (nodeList: HiveNode[]): HiveNode[][] => {
    const rows: HiveNode[][] = []
    let index = 0
    let rowIndex = 0

    while (index < nodeList.length) {
      // 奇数行 5 个，偶数行 4 个（交错效果）
      const rowSize = rowIndex % 2 === 0 ? 5 : 4
      rows.push(nodeList.slice(index, index + rowSize))
      index += rowSize
      rowIndex++
    }

    return rows
  }

  if (loading) {
    return (
      <Card className={cardClassName}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-white">知识蜂巢</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2">
            {[0, 1, 2].map((row) => (
              <div
                key={row}
                className={cn(
                  'flex gap-2',
                  row % 2 === 1 && 'ml-5'
                )}
              >
                {Array.from({ length: row % 2 === 0 ? 5 : 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-9 rounded bg-slate-700 sm:h-10 sm:w-10" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cardClassName}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-white">知识蜂巢</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-4 text-center text-slate-400">
            {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (nodes.length === 0) {
    return (
      <Card className={cardClassName}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-white">知识蜂巢</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-4 text-center text-slate-400">
            暂无蜂巢数据
          </div>
        </CardContent>
      </Card>
    )
  }

  const rows = distributeToRows(nodes)

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
        <CardTitle className="flex items-center justify-between text-base">
          <span>知识蜂巢</span>
          {subjectName && (
            <span className="text-xs font-normal text-slate-400">
              {subjectName}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {/* 图例 */}
        <div className="mb-3 flex flex-wrap justify-center gap-1.5 text-[10px]">
          <div className="flex items-center gap-1 rounded-full border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-green-200">
            <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
            <span>掌握良好 ({stats.strong})</span>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2 py-0.5 text-yellow-100">
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
            <span>有待加强 ({stats.fair})</span>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-red-100">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span>需要练习 ({stats.weak})</span>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-slate-500/20 bg-slate-500/10 px-2 py-0.5 text-slate-200">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
            <span>未开始 ({stats.locked})</span>
          </div>
        </div>

        {/* 蜂巢网格 */}
        <div className="flex flex-col items-center gap-1 py-1">
          {rows.map((rowNodes, rowIndex) => (
            <HiveRow
              key={rowIndex}
              nodes={rowNodes}
              offset={rowIndex % 2 === 1}
              onNodeClick={handleNodeClick}
            />
          ))}
        </div>

        {/* 底部提示 */}
        <p className="mt-3 text-center text-[11px] text-slate-400">
          点击六边形可进入对应章节练习
        </p>
      </CardContent>
    </Card>
  )
}

// 使用 React.memo 优化性能
const KnowledgeHive = memo(KnowledgeHiveInner)

export default KnowledgeHive
