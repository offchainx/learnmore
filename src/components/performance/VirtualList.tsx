'use client'

import { useRef, ReactNode } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

interface VirtualListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  estimateSize?: number
  overscan?: number
  className?: string
  itemClassName?: string
}

/**
 * 虚拟列表组件
 * 只渲染可见区域的元素,大幅提升长列表性能
 *
 * @param items - 列表数据
 * @param renderItem - 渲染函数
 * @param estimateSize - 估计每项高度 (默认50px)
 * @param overscan - 预渲染额外项数 (默认5)
 */
export function VirtualList<T>({
  items,
  renderItem,
  estimateSize = 50,
  overscan = 5,
  className = '',
  itemClassName = '',
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  })

  const virtualItems = virtualizer.getVirtualItems()

  return (
    <div
      ref={parentRef}
      className={`h-full overflow-auto ${className}`}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => (
          <div
            key={virtualItem.key}
            data-index={virtualItem.index}
            ref={virtualizer.measureElement}
            className={itemClassName}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * 固定高度虚拟列表 (性能更好)
 */
export function FixedVirtualList<T>({
  items,
  renderItem,
  itemHeight = 50,
  overscan = 5,
  className = '',
}: Omit<VirtualListProps<T>, 'estimateSize'> & { itemHeight?: number }) {
  return (
    <VirtualList
      items={items}
      renderItem={renderItem}
      estimateSize={itemHeight}
      overscan={overscan}
      className={className}
    />
  )
}

/**
 * 使用示例:
 *
 * <VirtualList
 *   items={longList}
 *   estimateSize={80}
 *   renderItem={(item, index) => (
 *     <div className="p-4 border-b">
 *       <h3>{item.title}</h3>
 *       <p>{item.description}</p>
 *     </div>
 *   )}
 * />
 */
