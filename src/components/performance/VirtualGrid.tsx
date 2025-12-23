'use client'

import { useRef, ReactNode } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

interface VirtualGridProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  columns: number
  estimateRowHeight?: number
  gap?: number
  className?: string
}

/**
 * 虚拟网格组件
 * 用于课程卡片、题目列表等网格布局
 *
 * @param items - 列表数据
 * @param renderItem - 渲染函数
 * @param columns - 列数
 * @param estimateRowHeight - 估计每行高度
 * @param gap - 间距 (px)
 */
export function VirtualGrid<T>({
  items,
  renderItem,
  columns = 3,
  estimateRowHeight = 200,
  gap = 16,
  className = '',
}: VirtualGridProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)

  // 计算总行数
  const rowCount = Math.ceil(items.length / columns)

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateRowHeight,
    overscan: 2,
  })

  const virtualRows = rowVirtualizer.getVirtualItems()

  return (
    <div
      ref={parentRef}
      className={`h-full overflow-auto ${className}`}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualRows.map((virtualRow) => {
          const startIndex = virtualRow.index * columns
          const endIndex = Math.min(startIndex + columns, items.length)
          const rowItems = items.slice(startIndex, endIndex)

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${columns}, 1fr)`,
                  gap: `${gap}px`,
                }}
              >
                {rowItems.map((item, colIndex) => {
                  const index = startIndex + colIndex
                  return (
                    <div key={index}>
                      {renderItem(item, index)}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * 响应式虚拟网格
 * 自动适配移动端/桌面端列数
 */
export function ResponsiveVirtualGrid<T>({
  items,
  renderItem,
  estimateRowHeight = 200,
  className = '',
}: Omit<VirtualGridProps<T>, 'columns'>) {
  // 根据屏幕宽度决定列数
  const getColumns = () => {
    if (typeof window === 'undefined') return 1
    const width = window.innerWidth
    if (width < 640) return 1 // 移动端
    if (width < 1024) return 2 // 平板
    return 3 // 桌面端
  }

  return (
    <VirtualGrid
      items={items}
      renderItem={renderItem}
      columns={getColumns()}
      estimateRowHeight={estimateRowHeight}
      className={className}
    />
  )
}

/**
 * 使用示例:
 *
 * <VirtualGrid
 *   items={courseList}
 *   columns={3}
 *   estimateRowHeight={250}
 *   renderItem={(course, index) => (
 *     <CourseCard course={course} />
 *   )}
 * />
 */
