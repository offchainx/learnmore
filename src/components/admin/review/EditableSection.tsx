'use client'

import React from 'react'
import { Pencil, Save, X } from 'lucide-react'

interface EditableSectionProps {
  title: string
  isEditing: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  children: React.ReactNode
}

/**
 * 可编辑区域包装器组件
 * 提供统一的编辑/保存/取消操作界面
 */
export function EditableSection({
  title,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  children,
}: EditableSectionProps) {
  return (
    <section
      className={`
      relative border rounded-xl shadow-sm p-6 transition-all duration-200 group
      ${
        isEditing
          ? 'bg-white dark:bg-slate-900 border-blue-500 ring-2 ring-blue-500/20'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }
    `}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </h3>
        {!isEditing ? (
          <button
            type="button"
            onClick={onEdit}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center text-xs font-medium"
          >
            <Pencil className="h-3 w-3 mr-1" />
            编辑
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs px-3 py-1.5 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-3 w-3 inline mr-1" />
              取消
            </button>
            <button
              type="button"
              onClick={onSave}
              className="text-xs px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium shadow-sm flex items-center transition-colors"
            >
              <Save className="h-3 w-3 mr-1" />
              保存
            </button>
          </div>
        )}
      </div>
      <div className={isEditing ? 'mt-2' : ''}>{children}</div>
    </section>
  )
}
