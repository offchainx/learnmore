'use client'

import React from 'react'
import { Bold, Italic, FunctionSquare, Calculator } from 'lucide-react'

interface EditorToolbarProps {
  onInsert: (text: string) => void
}

/**
 * 富文本编辑工具栏组件
 * 提供快捷插入 Markdown 和 LaTeX 语法按钮
 */
export function EditorToolbar({ onInsert }: EditorToolbarProps) {
  return (
    <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-700 p-1.5 bg-slate-50 dark:bg-slate-950 rounded-t-md">
      <button
        type="button"
        onClick={() => onInsert('**粗体**')}
        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
        title="粗体"
      >
        <Bold className="h-4 w-4 text-slate-600 dark:text-slate-400" />
      </button>
      <button
        type="button"
        onClick={() => onInsert('*斜体*')}
        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
        title="斜体"
      >
        <Italic className="h-4 w-4 text-slate-600 dark:text-slate-400" />
      </button>
      <div className="w-px h-4 bg-slate-300 dark:border-slate-700 mx-1"></div>
      <button
        type="button"
        onClick={() => onInsert('$x^2$')}
        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
        title="行内公式"
      >
        <FunctionSquare className="h-4 w-4 text-slate-600 dark:text-slate-400" />
      </button>
      <button
        type="button"
        onClick={() => onInsert('\n$$\nx^2 + y^2 = r^2\n$$\n')}
        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
        title="块级公式"
      >
        <Calculator className="h-4 w-4 text-slate-600 dark:text-slate-400" />
      </button>
    </div>
  )
}
