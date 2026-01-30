'use client'

import React, { useState, useEffect } from 'react'
import { MathRenderer } from './MathRenderer'
import { EditorToolbar } from './EditorToolbar'
import { EditableSection } from './EditableSection'
import { QuestionReviewData, QuestionOption } from '@/types/content-pipeline'
import { PlusCircle, X, CheckCircle, Eye, EyeOff, Image } from 'lucide-react'

interface QuestionPanelProps {
  data: QuestionReviewData
  onUpdate: (data: QuestionReviewData) => void
}

/**
 * 题目审核面板（左侧）
 * 支持查看和编辑题干、选项、解析
 */
export function QuestionPanel({ data, onUpdate }: QuestionPanelProps) {
  const [editingSection, setEditingSection] = useState<'stem' | 'options' | 'explanation' | null>(
    null
  )
  const [tempData, setTempData] = useState<QuestionReviewData>(data)
  const [showOriginal, setShowOriginal] = useState(false)

  // 重置临时数据
  useEffect(() => {
    if (editingSection) {
      setTempData(JSON.parse(JSON.stringify(data)))
    }
  }, [editingSection, data])

  const handleSave = () => {
    onUpdate(tempData)
    setEditingSection(null)
  }

  const handleCancel = () => {
    setEditingSection(null)
  }

  // 文本插入辅助函数
  const insertText = (field: 'stem' | 'explanation', text: string) => {
    const el = document.getElementById(`${field}-textarea`) as HTMLTextAreaElement
    if (!el) return

    const start = el.selectionStart
    const end = el.selectionEnd
    const currentVal = field === 'stem' ? tempData.stem : tempData.explanation.text
    const newVal = currentVal.substring(0, start) + text + currentVal.substring(end)

    if (field === 'stem') {
      setTempData((prev) => ({ ...prev, stem: newVal }))
    } else {
      setTempData((prev) => ({
        ...prev,
        explanation: { ...prev.explanation, text: newVal },
      }))
    }

    // 恢复光标位置
    setTimeout(() => {
      el.selectionStart = el.selectionEnd = start + text.length
      el.focus()
    }, 0)
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 scroll-smooth bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto space-y-6 pb-20">
        {/* 题干部分 */}
        <EditableSection
          title="题目题干"
          isEditing={editingSection === 'stem'}
          onEdit={() => setEditingSection('stem')}
          onSave={handleSave}
          onCancel={handleCancel}
        >
          {editingSection === 'stem' ? (
            <div className="border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 focus-within:ring-2 focus-within:ring-blue-500/20">
              <EditorToolbar onInsert={(t) => insertText('stem', t)} />
              <textarea
                id="stem-textarea"
                className="w-full p-4 bg-transparent border-0 focus:ring-0 text-sm font-mono text-slate-800 dark:text-slate-200 min-h-[150px] resize-y focus:outline-none"
                value={tempData.stem}
                onChange={(e) => setTempData({ ...tempData, stem: e.target.value })}
              />
              <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  公式补充（可选）
                </label>
                <input
                  type="text"
                  className="w-full text-xs p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  value={tempData.stemEquation || ''}
                  onChange={(e) => setTempData({ ...tempData, stemEquation: e.target.value })}
                  placeholder="例如: r = (3t^2 - 4t)i + (t^3 - 2t)j"
                />
              </div>
            </div>
          ) : (
            <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-base leading-relaxed">
              <MathRenderer content={data.stem} />
              {data.stemEquation && (
                <div className="my-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-center shadow-inner">
                  <MathRenderer content={`$$${data.stemEquation}$$`} className="text-lg" />
                </div>
              )}
              {data.stemFooter && (
                <div className="mt-4">
                  <MathRenderer content={data.stemFooter} />
                </div>
              )}
            </div>
          )}
        </EditableSection>

        {/* 选项部分 */}
        <EditableSection
          title="选项与答案"
          isEditing={editingSection === 'options'}
          onEdit={() => setEditingSection('options')}
          onSave={handleSave}
          onCancel={handleCancel}
        >
          {editingSection === 'options' ? (
            <div className="space-y-3">
              {tempData.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="correct-opt"
                    checked={opt.isCorrect}
                    onChange={() =>
                      setTempData({
                        ...tempData,
                        options: tempData.options.map((o) => ({
                          ...o,
                          isCorrect: o.id === opt.id,
                        })),
                      })
                    }
                    className="w-4 h-4 text-green-600 focus:ring-green-500 border-slate-300 dark:border-slate-600 cursor-pointer"
                  />
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">
                      {opt.id}
                    </span>
                    <input
                      type="text"
                      value={opt.value}
                      onChange={(e) => {
                        const newOptions = [...tempData.options]
                        newOptions[idx].value = e.target.value
                        setTempData({ ...tempData, options: newOptions })
                      }}
                      className="w-full pl-8 pr-10 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-slate-900 dark:text-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newOptions = tempData.options.filter((o) => o.id !== opt.id)
                        setTempData({ ...tempData, options: newOptions })
                      }}
                      className="absolute right-2 top-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const nextId = String.fromCharCode(65 + tempData.options.length)
                  setTempData({
                    ...tempData,
                    options: [...tempData.options, { id: nextId, value: '', isCorrect: false }],
                  })
                }}
                className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center transition-colors"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                添加选项
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.options.map((opt) => (
                <div
                  key={opt.id}
                  className={`relative rounded-lg p-4 border transition-all ${
                    opt.isCorrect
                      ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span
                    className={`absolute top-3 left-3 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      opt.isCorrect
                        ? 'bg-green-600 text-white'
                        : 'border border-slate-300 dark:border-slate-600 text-slate-500'
                    }`}
                  >
                    {opt.id}
                  </span>
                  <div className="ml-8 text-center">
                    <MathRenderer
                      content={opt.value}
                      className={opt.isCorrect ? 'font-medium' : ''}
                    />
                  </div>
                  {opt.isCorrect && (
                    <CheckCircle className="absolute top-3 right-3 h-4 w-4 text-green-600" />
                  )}
                </div>
              ))}
            </div>
          )}
        </EditableSection>

        {/* 解析部分 */}
        <EditableSection
          title="题目解析"
          isEditing={editingSection === 'explanation'}
          onEdit={() => setEditingSection('explanation')}
          onSave={handleSave}
          onCancel={handleCancel}
        >
          {editingSection === 'explanation' ? (
            <div className="border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 focus-within:ring-2 focus-within:ring-blue-500/20">
              <EditorToolbar onInsert={(t) => insertText('explanation', t)} />
              <textarea
                id="explanation-textarea"
                className="w-full p-4 bg-transparent border-0 focus:ring-0 text-sm font-mono text-slate-800 dark:text-slate-200 min-h-[150px] resize-y focus:outline-none"
                value={tempData.explanation.text}
                onChange={(e) =>
                  setTempData({
                    ...tempData,
                    explanation: { ...tempData.explanation, text: e.target.value },
                  })
                }
              />
            </div>
          ) : (
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div>
                <MathRenderer content={data.explanation.text} />
              </div>
              {data.explanation.steps && data.explanation.steps.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-700 dark:text-slate-400">
                  {data.explanation.steps.map((step, i) => (
                    <div key={i}>{step}</div>
                  ))}
                </div>
              )}
              {data.explanation.finalStep && data.explanation.finalEquation && (
                <p className="mt-2">
                  {data.explanation.finalStep}{' '}
                  <MathRenderer content={`$${data.explanation.finalEquation}$`} />
                </p>
              )}
              {data.explanation.note && (
                <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-md text-xs text-amber-800 dark:text-amber-300">
                  <strong>注意：</strong> {data.explanation.note}
                </div>
              )}
            </div>
          )}
        </EditableSection>

        {/* 源材料 */}
        <section className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              源材料（OCR扫描图）
            </h3>
            <button
              type="button"
              onClick={() => setShowOriginal(!showOriginal)}
              className="text-xs flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium focus:outline-none transition-colors"
            >
              {showOriginal ? (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  隐藏扫描图
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  显示扫描图
                </>
              )}
            </button>
          </div>
          {showOriginal && (
            <div className="bg-slate-100 dark:bg-slate-900 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 p-4 flex flex-col items-center justify-center min-h-[200px] animate-in fade-in duration-300">
              {data.sourceImageUrl ? (
                <img
                  src={data.sourceImageUrl}
                  alt="OCR 源图"
                  className="max-w-full h-auto rounded border border-slate-300 dark:border-slate-700"
                />
              ) : (
                <div className="w-full h-48 bg-slate-200 dark:bg-slate-800 rounded flex items-center justify-center relative overflow-hidden group border border-slate-300 dark:border-slate-700">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 opacity-50"></div>
                  <span className="relative z-10 text-slate-500 dark:text-slate-400 text-sm font-medium flex flex-col items-center">
                    <Image className="h-8 w-8 mb-2" />
                    暂无源材料图片
                  </span>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
