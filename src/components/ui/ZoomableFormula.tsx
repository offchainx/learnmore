'use client'

import { PinchZoomImage } from './PinchZoomImage'
import { useEffect, useState } from 'react'
import 'katex/dist/katex.min.css'

interface ZoomableFormulaProps {
  latex: string
  displayMode?: boolean
  className?: string
}

/**
 * 可缩放的数学公式组件
 * 支持 LaTeX 渲染 + 捏合缩放
 */
export function ZoomableFormula({
  latex,
  displayMode = false,
  className = '',
}: ZoomableFormulaProps) {
  const [html, setHtml] = useState<string>('')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    // 动态导入 katex (仅客户端)
    import('katex')
      .then((katex) => {
        const rendered = katex.default.renderToString(latex, {
          displayMode,
          throwOnError: false,
          strict: false,
        })
        setHtml(rendered)
      })
      .catch((err) => {
        console.error('KaTeX rendering error:', err)
        setError('公式渲染失败')
      })
  }, [latex, displayMode])

  if (error) {
    return <span className="text-destructive">{error}</span>
  }

  return (
    <PinchZoomImage
      minScale={1}
      maxScale={4}
      showControls={true}
      className={className}
    >
      <div className="p-4 bg-card rounded-lg border border-border">
        {html ? (
          <div
            className={`select-none ${displayMode ? 'text-center' : 'inline-block'}`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <span className="text-muted-foreground">加载中...</span>
        )}
      </div>
    </PinchZoomImage>
  )
}
