'use client'

import { memo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Hexagon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { HiveNode, HiveNodeStatus } from '@/lib/practice/types'
import { cn } from '@/lib/utils'

interface KnowledgeHiveProps {
  userId: string
  subjectId: string
  subjectName?: string
}

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
          className="w-12 h-12 sm:w-14 sm:h-14"
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
        'flex justify-center gap-1 sm:gap-2',
        offset && 'ml-6 sm:ml-7'
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
 * 显示用户在某科目各章节的掌握度可视化
 */
function KnowledgeHiveInner({ userId, subjectId, subjectName }: KnowledgeHiveProps) {
  const router = useRouter()
  const [nodes, setNodes] = useState<HiveNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchData() {
      if (!userId || !subjectId) return

      try {
        setLoading(true)
        setError(null)
        const response = await fetch(
          `/api/practice/knowledge-hive?subjectId=${encodeURIComponent(subjectId)}`,
          {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
          },
        )

        if (!response.ok) {
          throw new Error('Failed to fetch knowledge hive')
        }

        const result = await response.json()
        const data = (result.success && Array.isArray(result.data)) ? result.data : []

        if (!isMounted) return
        setNodes(data)
      } catch (err) {
        if (!isMounted) return
        console.error('Failed to fetch knowledge hive data:', err)
        setError('加载知识蜂巢数据失败')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [userId, subjectId])

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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">知识蜂巢</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2">
            {[0, 1, 2].map((row) => (
              <div
                key={row}
                className={cn(
                  'flex gap-2',
                  row % 2 === 1 && 'ml-7'
                )}
              >
                {Array.from({ length: row % 2 === 0 ? 5 : 4 }).map((_, i) => (
                  <Skeleton key={i} className="w-12 h-12 sm:w-14 sm:h-14 rounded" />
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">知识蜂巢</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (nodes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">知识蜂巢</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            暂无章节数据
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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>知识蜂巢</span>
          {subjectName && (
            <span className="text-sm font-normal text-muted-foreground">
              {subjectName}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 图例 */}
        <div className="flex flex-wrap justify-center gap-4 mb-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-500" />
            <span>掌握良好 ({stats.strong})</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-yellow-500" />
            <span>有待加强 ({stats.fair})</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-500" />
            <span>需要练习 ({stats.weak})</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-gray-500" />
            <span>未开始 ({stats.locked})</span>
          </div>
        </div>

        {/* 蜂巢网格 */}
        <div className="flex flex-col items-center gap-1 py-2">
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
        <p className="text-center text-xs text-muted-foreground mt-4">
          点击六边形可进入对应章节练习
        </p>
      </CardContent>
    </Card>
  )
}

// 使用 React.memo 优化性能
const KnowledgeHive = memo(KnowledgeHiveInner)

export default KnowledgeHive
