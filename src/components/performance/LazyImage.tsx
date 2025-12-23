'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { ImageIcon } from 'lucide-react'

interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
  quality?: number
}

/**
 * 懒加载图片组件
 * 使用 Intersection Observer API 实现视口内才加载
 */
export function LazyImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fill = false,
  sizes,
  quality = 75,
}: LazyImageProps) {
  const [isInView, setIsInView] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 优先级图片直接加载
    if (priority) {
      setTimeout(() => setIsInView(true), 0)
      return
    }

    // 使用 Intersection Observer 检测图片是否进入视口
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '50px', // 提前50px开始加载
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [priority])

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden bg-muted ${className}`}
      style={!fill && width && height ? { width, height } : undefined}
    >
      {/* 占位符 */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
        </div>
      )}

      {/* 实际图片 */}
      {isInView && (
        <Image
          src={src}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          sizes={sizes}
          quality={quality}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
        />
      )}
    </div>
  )
}

/**
 * 响应式图片组件
 * 根据屏幕尺寸加载不同分辨率的图片
 */
export function ResponsiveImage({
  src,
  alt,
  className = '',
  priority = false,
}: Omit<LazyImageProps, 'width' | 'height'>) {
  return (
    <LazyImage
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className={className}
      priority={priority}
    />
  )
}
