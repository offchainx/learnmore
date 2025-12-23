'use client'

import { ReactNode } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

interface PinchZoomImageProps {
  children: ReactNode
  minScale?: number
  maxScale?: number
  showControls?: boolean
  className?: string
}

export function PinchZoomImage({
  children,
  minScale = 1,
  maxScale = 4,
  showControls = true,
  className = '',
}: PinchZoomImageProps) {
  return (
    <TransformWrapper
      initialScale={1}
      minScale={minScale}
      maxScale={maxScale}
      doubleClick={{
        mode: 'toggle', // 双击切换缩放
        step: 0.7,
      }}
      wheel={{
        step: 0.1,
      }}
      pinch={{
        step: 5,
      }}
      panning={{
        velocityDisabled: true, // 禁用惯性滚动,避免误操作
      }}
    >
      {({ zoomIn, zoomOut, resetTransform }) => (
        <div className={`relative ${className}`}>
          {/* 缩放控制按钮 (仅在 showControls 为 true 时显示) */}
          {showControls && (
            <div className="absolute top-2 right-2 z-10 flex gap-2">
              <button
                onClick={() => zoomIn()}
                className="p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-md hover:bg-background transition-colors"
                aria-label="放大"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => zoomOut()}
                className="p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-md hover:bg-background transition-colors"
                aria-label="缩小"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => resetTransform()}
                className="p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-md hover:bg-background transition-colors"
                aria-label="重置"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 可缩放内容区域 */}
          <TransformComponent
            wrapperClass="w-full h-full"
            contentClass="w-full h-full"
          >
            {children}
          </TransformComponent>

          {/* 使用提示 (首次使用时显示) */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap">
              双指捏合缩放 · 双击切换
            </div>
          </div>
        </div>
      )}
    </TransformWrapper>
  )
}
