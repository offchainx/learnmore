'use client'

import React from 'react'
import 'katex/dist/katex.min.css'
import katex from 'katex'
import { normalizeExamcooImageUrl, replaceExamcooLegacyUploadsInMarkdown } from '@/lib/content-pipeline/examcoo-image'

interface MathRendererProps {
  content: string
  block?: boolean
  className?: string
}

/**
 * LaTeX 数学公式渲染组件
 * 支持 inline ($...$) 和 block ($$...$$) 模式
 */
export function MathRenderer({ content, block = false, className = '' }: MathRendererProps) {
  const renderMath = (text: string) => {
    if (!text) return text

    let processed = replaceExamcooLegacyUploadsInMarkdown(text)

    // 处理 block 模式 ($$...$$)
    processed = processed.replace(/\$\$([\s\S]+?)\$\$/g, (match, formula) => {
      try {
        const html = katex.renderToString(formula.trim(), {
          displayMode: true,
          throwOnError: false,
        })
        return `<div class="math-block my-4">${html}</div>`
      } catch (e) {
        console.error('LaTeX render error (block):', e)
        return `<code class="text-red-500">${match}</code>`
      }
    })

    // 处理 inline 模式 ($...$)
    processed = processed.replace(/\$([^$]+?)\$/g, (match, formula) => {
      try {
        const html = katex.renderToString(formula.trim(), {
          displayMode: false,
          throwOnError: false,
        })
        return `<span class="math-inline">${html}</span>`
      } catch (e) {
        console.error('LaTeX render error (inline):', e)
        return `<code class="text-red-500">${match}</code>`
      }
    })

    processed = processed.replace(
      /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g,
      (_match, altText: string, url: string) =>
        `<img src="${normalizeExamcooImageUrl(url) || url}" alt="${altText || '题目图片'}" class="my-4 max-h-[420px] w-auto max-w-full rounded-lg border border-borderTone object-contain" loading="lazy" />`
    )

    return processed
  }

  const processedContent = renderMath(content)

  return (
    <div
      className={`math-content ${className}`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  )
}
