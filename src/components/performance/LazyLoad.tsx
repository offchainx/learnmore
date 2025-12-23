'use client'

import { ReactNode, Suspense } from 'react'
import { Loader2 } from 'lucide-react'

interface LazyLoadProps {
  children: ReactNode
  fallback?: ReactNode
  minHeight?: string
}

/**
 * 懒加载包装器组件
 * 用于延迟加载非关键组件,提升初始加载性能
 */
export function LazyLoad({
  children,
  fallback,
  minHeight = '200px'
}: LazyLoadProps) {
  const defaultFallback = (
    <div
      className="flex items-center justify-center w-full"
      style={{ minHeight }}
    >
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  )

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  )
}

/**
 * 骨架屏加载器
 */
export function SkeletonLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-muted rounded w-1/2"></div>
    </div>
  )
}

/**
 * 卡片骨架屏
 */
export function CardSkeleton() {
  return (
    <div className="border border-border rounded-lg p-4 animate-pulse">
      <div className="h-40 bg-muted rounded mb-4"></div>
      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-muted rounded w-1/2"></div>
    </div>
  )
}
