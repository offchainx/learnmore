'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { MathRenderer } from './MathRenderer'
import { EditorToolbar } from './EditorToolbar'
import { EditableSection } from './EditableSection'
import { QuestionReviewData, QuestionOption } from '@/types/content-pipeline'
import { PlusCircle, X, CheckCircle, Eye, EyeOff, Image, MonitorSmartphone, SquarePen, TriangleAlert } from 'lucide-react'
import { QuestionCard } from '@/components/business/question'
import type { Question as PracticeQuestion, QuestionType } from '@/components/business/question/types'
import { Button } from '@/components/ui/button'

interface QuestionPanelProps {
  data: QuestionReviewData
  onUpdate: (data: QuestionReviewData) => void
  onOpenQuestion?: (questionId: string) => void
}

type QuestionPanelMode = 'review' | 'preview'

function toPracticeQuestionType(type: string): QuestionType {
  if (type === 'SINGLE_CHOICE') return 'SINGLE_CHOICE'
  if (type === 'MULTIPLE_CHOICE') return 'MULTIPLE_CHOICE'
  if (type === 'FILL_BLANK') return 'FILL_BLANK'
  if (type === 'ESSAY') return 'ESSAY'
  if (type === 'TRUE_FALSE') return 'TRUE_FALSE'
  if (type === 'MCQ') return 'MCQ'
  return 'SINGLE_CHOICE'
}

function buildPreviewQuestion(data: QuestionReviewData): PracticeQuestion {
  const correctOptions = data.options.filter((opt) => opt.isCorrect).map((opt) => opt.id)
  const answer: string | string[] | null =
    data.metadata.type === 'MULTIPLE_CHOICE'
      ? correctOptions
      : data.metadata.type === 'SINGLE_CHOICE' || data.metadata.type === 'TRUE_FALSE'
        ? correctOptions[0] ?? null
        : data.answerValue ?? null

  return {
    id: data.id,
    type: toPracticeQuestionType(data.metadata.type),
    content: data.stem,
    options:
      data.options.length > 0
        ? data.options.reduce<Record<string, string>>((acc, option) => {
            acc[option.id] = option.value
            return acc
          }, {})
        : null,
    answer,
    explanation: data.explanation.text || null,
  }
}

function hasVisibleFillBlankMarker(stem: string): boolean {
  return /_{2,}|﹍{2,}|＿{2,}|【\s*】|\(\s*\)|（\s*）|\[\s*]|\[blank]/i.test(stem)
}

/**
 * 题目审核面板（左侧）
 * 支持查看和编辑题干、选项、解析
 */
export function QuestionPanel({ data, onUpdate, onOpenQuestion }: QuestionPanelProps) {
  const [editingSection, setEditingSection] = useState<'stem' | 'options' | 'explanation' | null>(
    null
  )
  const [tempData, setTempData] = useState<QuestionReviewData>(data)
  const [showOriginal, setShowOriginal] = useState(false)
  const [panelMode, setPanelMode] = useState<QuestionPanelMode>('review')

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

  const stemImageUrls = Array.from(
    new Set(
      (data.stem.match(/!\[[^\]]*]\((https?:\/\/[^)]+)\)/gi) || [])
        .map((item) => item.match(/\((https?:\/\/[^)]+)\)/i)?.[1])
        .filter((x): x is string => Boolean(x))
    )
  )

  const questionImages = Array.from(new Set([...(data.questionImageUrls || []), ...stemImageUrls]))
  const previewQuestion = useMemo(() => buildPreviewQuestion(data), [data])
  const showFillBlankMarkerWarning =
    data.metadata.type === 'FILL_BLANK' && !hasVisibleFillBlankMarker(data.stem)
  const reviewAnswerText = Array.isArray(data.answerValue)
    ? data.answerValue.join('、')
    : data.answerValue ?? ''
  const editingAnswerText = Array.isArray(tempData.answerValue)
    ? tempData.answerValue.join('\n')
    : tempData.answerValue ?? ''

  return (
    <div className="min-h-0 min-w-0 overflow-y-auto bg-page px-4 py-5 scroll-smooth dark:bg-slate-950 desktop:px-7 desktop:py-6 2xl:px-8">
      <div className="mx-auto max-w-5xl space-y-6 pb-20">
        <section className="rounded-2xl border border-borderTone bg-surface/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.18em] text-text-tertiary dark:text-slate-400">
                审核工作台视图
              </div>
              <p className="mt-2 text-sm leading-6 text-text-secondary dark:text-slate-300">
                可以在“审核视图”中编辑题目，在“用户端预览”中确认这题在前台真实练习页里的表现。
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={panelMode === 'review' ? 'default' : 'outline'}
                className="rounded-xl"
                onClick={() => setPanelMode('review')}
              >
                <SquarePen className="mr-2 h-4 w-4" />
                审核视图
              </Button>
              <Button
                type="button"
                variant={panelMode === 'preview' ? 'default' : 'outline'}
                className="rounded-xl"
                onClick={() => setPanelMode('preview')}
              >
                <MonitorSmartphone className="mr-2 h-4 w-4" />
                用户端预览
              </Button>
            </div>
          </div>
        </section>

        {panelMode === 'preview' ? (
          <>
            {data.group ? (
              <section className="rounded-2xl border border-borderTone bg-surface/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.16em] text-text-tertiary dark:text-slate-400">
                      组合题共享材料
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-text-secondary dark:text-slate-300">
                      当前子题属于同一组材料题，前台练习时应先看到这段共享材料，再进入子题作答。
                    </p>
                  </div>
                  <div className="rounded-full border border-borderTone px-3 py-1 text-xs font-bold text-text-secondary dark:border-slate-700 dark:text-slate-300">
                    {data.group.title || data.group.id.slice(0, 8)}
                  </div>
                </div>

                <div className="mt-5 rounded-[28px] border border-borderTone bg-page p-4 shadow-inner dark:border-slate-800 dark:bg-slate-950/70">
                  <MathRenderer content={data.group.material} />
                </div>

                {data.group.subQuestions && data.group.subQuestions.length > 0 ? (
                  <div className="mt-5">
                    <div className="text-xs font-black uppercase tracking-[0.16em] text-text-tertiary dark:text-slate-400">
                      同组子题
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {data.group.subQuestions.map((subQuestion, index) => (
                        <button
                          key={subQuestion.id}
                          type="button"
                          onClick={() => onOpenQuestion?.(subQuestion.id)}
                          className={`rounded-2xl border px-3 py-2 text-left text-xs font-semibold transition ${
                            subQuestion.isCurrent
                              ? 'border-cyan-400/40 bg-cyan-500/15 text-cyan-100'
                              : 'border-borderTone bg-surface-subtle text-text-secondary hover:border-cyan-400/30 hover:text-text-primary dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300'
                          }`}
                        >
                          <div className="font-black">子题 {index + 1}</div>
                          <div className="mt-1 max-w-[220px] truncate">
                            {subQuestion.title || `题目 ${subQuestion.id.slice(0, 8)}`}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>
            ) : null}

            <section className="rounded-2xl border border-borderTone bg-surface/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
              <div className="flex flex-col gap-2 tablet:flex-row tablet:items-start tablet:justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.16em] text-text-tertiary dark:text-slate-400">
                    用户端答题态预览
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-text-secondary dark:text-slate-300">
                    下面这块直接复用前台真实题目组件，用来确认题型、排版、输入方式和图文表现是否正常。
                  </p>
                </div>
                <div className="rounded-full border border-borderTone px-3 py-1 text-xs font-bold text-text-secondary dark:border-slate-700 dark:text-slate-300">
                  {data.metadata.type}
                </div>
              </div>

              {showFillBlankMarkerWarning ? (
                <div className="mt-4 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <TriangleAlert className="mt-0.5 h-4 w-4 text-amber-400" />
                    <div>
                      <div className="text-sm font-semibold text-amber-200">
                        预览提示：这是一道填空题，但题干中未检测到明显 blank / 下划线 / 占位结构
                      </div>
                      <p className="mt-1 text-sm leading-6 text-amber-100/90">
                        用户端虽然仍会显示输入框，但题干正文本身看起来不一定像“需要填空”的题。建议对照源材料检查是否在清洗阶段丢失了下划线或占位信息。
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mt-5 rounded-[28px] border border-borderTone bg-page p-4 shadow-inner dark:border-slate-800 dark:bg-slate-950/70">
                <QuestionCard
                  question={previewQuestion}
                  readOnly
                  className="border-none bg-transparent shadow-none"
                />
              </div>
            </section>

            <section className="rounded-2xl border border-borderTone bg-surface/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
              <h3 className="text-sm font-black uppercase tracking-[0.16em] text-text-tertiary dark:text-slate-400">
                审核建议
              </h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-text-secondary dark:text-slate-300">
                <li>确认用户端是否能一眼看出题型，尤其是填空题、图文题和多选题。</li>
                <li>确认题干、选项、图片、解析在前台是否存在断行异常、空白丢失或格式错位。</li>
                <li>如果预览正常但原题样式差异较大，可再对照下方 OCR 源材料确认是否需要保留更多原始排版信息。</li>
              </ul>
            </section>
          </>
        ) : (
          <>
        {data.group ? (
          <section className="relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {`组合题共享材料${data.group.title ? ` · ${data.group.title}` : ''}`}
              </h3>
            </div>
            <div className="prose max-w-none text-base leading-relaxed text-text-primary dark:prose-invert dark:text-slate-200">
              <MathRenderer content={data.group.material} />
            </div>
            {data.group.subQuestions && data.group.subQuestions.length > 0 ? (
              <div className="mt-5 border-t border-borderTone pt-4 dark:border-slate-800">
                <div className="text-xs font-bold uppercase tracking-wider text-text-tertiary dark:text-slate-400">
                  同组子题
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {data.group.subQuestions.map((subQuestion, index) => (
                    <button
                      key={subQuestion.id}
                      type="button"
                      onClick={() => onOpenQuestion?.(subQuestion.id)}
                      className={`rounded-2xl border px-3 py-2 text-left text-xs font-semibold transition ${
                        subQuestion.isCurrent
                          ? 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300'
                          : 'border-borderTone bg-surface text-text-secondary hover:border-blue-400/30 hover:text-text-primary dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300'
                      }`}
                    >
                      <div className="font-black">子题 {index + 1}</div>
                      <div className="mt-1 max-w-[220px] truncate">
                        {subQuestion.title || `题目 ${subQuestion.id.slice(0, 8)}`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        {/* 题干部分 */}
        <EditableSection
          title="题目题干"
          isEditing={editingSection === 'stem'}
          onEdit={() => setEditingSection('stem')}
          onSave={handleSave}
          onCancel={handleCancel}
        >
          {editingSection === 'stem' ? (
            <div className="border border-borderTone dark:border-slate-700 rounded-md bg-surface dark:bg-slate-950 focus-within:ring-2 focus-within:ring-[hsl(var(--focus-ring))]">
              <EditorToolbar onInsert={(t) => insertText('stem', t)} />
              <textarea
                id="stem-textarea"
                className="w-full p-4 bg-transparent border-0 focus:ring-0 text-sm font-mono text-text-primary dark:text-slate-200 min-h-[150px] resize-y focus:outline-none"
                value={tempData.stem}
                onChange={(e) => setTempData({ ...tempData, stem: e.target.value })}
              />
              <div className="px-3 py-2 border-t border-borderTone dark:border-slate-700 bg-surface-subtle dark:bg-slate-900">
                <label className="text-xs font-semibold text-text-tertiary dark:text-slate-400 block mb-1">
                  公式补充（可选）
                </label>
                <input
                  type="text"
                  className="w-full text-xs p-2 rounded border border-borderTone dark:border-slate-700 bg-surface dark:bg-slate-900 font-mono focus:ring-2 focus:ring-[hsl(var(--focus-ring))] focus:outline-none text-text-primary dark:text-white"
                  value={tempData.stemEquation || ''}
                  onChange={(e) => setTempData({ ...tempData, stemEquation: e.target.value })}
                  placeholder="例如: r = (3t^2 - 4t)i + (t^3 - 2t)j"
                />
              </div>
            </div>
          ) : (
            <div className="prose dark:prose-invert max-w-none text-text-primary dark:text-slate-200 text-base leading-relaxed">
              <MathRenderer content={data.stem} />
              {data.stemEquation && (
                <div className="my-4 p-4 bg-surface-subtle dark:bg-slate-900 rounded-lg border border-borderTone dark:border-slate-800 flex justify-center shadow-inner">
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
              {tempData.options.length > 0 ? (
                <>
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
                        className="w-4 h-4 text-green-600 focus:ring-green-500 border-borderTone dark:border-slate-600 cursor-pointer"
                      />
                      <div className="flex-1 relative">
                        <span className="absolute left-3 top-2.5 text-xs font-bold text-text-tertiary dark:text-slate-400">
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
                          className="w-full pl-8 pr-10 py-2 text-sm bg-surface dark:bg-slate-900 border border-borderTone dark:border-slate-700 rounded-md focus:ring-2 focus:ring-[hsl(var(--focus-ring))] focus:outline-none text-text-primary dark:text-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newOptions = tempData.options.filter((o) => o.id !== opt.id)
                            setTempData({ ...tempData, options: newOptions })
                          }}
                          className="absolute right-2 top-2 text-text-tertiary dark:text-slate-400 hover:text-red-500 transition-colors"
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
                </>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-text-tertiary dark:text-slate-400 mb-2">
                    参考答案
                  </label>
                  <textarea
                    className="w-full min-h-[120px] rounded-md border border-borderTone bg-surface px-3 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-[hsl(var(--focus-ring))] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    value={editingAnswerText}
                    onChange={(e) =>
                      setTempData({
                        ...tempData,
                        answerValue:
                          tempData.metadata.type === 'FILL_BLANK'
                            ? e.target.value
                                .split('\n')
                                .map((item) => item.trim())
                                .filter(Boolean)
                            : e.target.value,
                      })
                    }
                    placeholder={
                      tempData.metadata.type === 'FILL_BLANK'
                        ? '每行填写一个空的参考答案'
                        : '填写主观题参考答案'
                    }
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              {data.options.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
                  {data.options.map((opt) => (
                    <div
                      key={opt.id}
                      className={`relative rounded-lg p-4 border transition-all ${
                        opt.isCorrect
                          ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                          : 'bg-surface dark:bg-slate-900 border-borderTone dark:border-slate-800'
                      }`}
                    >
                      <span
                        className={`absolute top-3 left-3 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                          opt.isCorrect
                            ? 'bg-green-600 text-white'
                            : 'border border-borderTone dark:border-slate-600 text-text-tertiary dark:text-slate-500'
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
              ) : (
                <div className="rounded-lg border border-borderTone bg-surface p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="text-xs font-bold uppercase tracking-wider text-text-tertiary dark:text-slate-400">
                    参考答案
                  </div>
                  <div className="mt-3 text-sm leading-7 text-text-primary dark:text-slate-200">
                    {reviewAnswerText ? (
                      <MathRenderer content={reviewAnswerText} />
                    ) : (
                      <span className="text-text-tertiary dark:text-slate-500">当前未抓取到参考答案</span>
                    )}
                  </div>
                </div>
              )}
            </>
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
            <div className="border border-borderTone dark:border-slate-700 rounded-md bg-surface dark:bg-slate-950 focus-within:ring-2 focus-within:ring-[hsl(var(--focus-ring))]">
              <EditorToolbar onInsert={(t) => insertText('explanation', t)} />
              <textarea
                id="explanation-textarea"
                className="w-full p-4 bg-transparent border-0 focus:ring-0 text-sm font-mono text-text-primary dark:text-slate-200 min-h-[150px] resize-y focus:outline-none"
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
            <div className="space-y-3 text-sm text-text-secondary dark:text-slate-300">
              <div>
                <MathRenderer content={data.explanation.text} />
              </div>
              {data.explanation.steps && data.explanation.steps.length > 0 && (
                <div className="bg-surface-subtle dark:bg-slate-900 p-3 rounded border border-borderTone dark:border-slate-800 font-mono text-xs text-text-primary dark:text-slate-400">
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

        {/* 题目图像 */}
        <section className="mt-8 border-t border-borderTone dark:border-slate-800 pt-6">
          <h3 className="text-xs font-bold text-text-tertiary dark:text-slate-400 uppercase tracking-wider mb-4">
            题目图像
          </h3>
          {questionImages.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
              {questionImages.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="block border border-borderTone dark:border-slate-700 rounded-lg overflow-hidden bg-surface dark:bg-slate-900 hover:border-blue-400 transition-colors"
                >
                  <img src={url} alt="题目图像" className="w-full h-44 object-contain bg-surface-subtle dark:bg-slate-950" />
                </a>
              ))}
            </div>
          ) : (
            <div className="h-28 rounded-lg border border-dashed border-borderTone dark:border-slate-700 flex items-center justify-center text-sm text-text-tertiary dark:text-slate-400">
              当前题目未检测到图像
            </div>
          )}
        </section>

        {/* 源材料 */}
        <section className="mt-8 border-t border-borderTone dark:border-slate-800 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-text-tertiary dark:text-slate-400 uppercase tracking-wider">
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
            <div className="bg-surface-subtle dark:bg-slate-900 rounded-lg border-2 border-dashed border-borderTone dark:border-slate-700 p-4 flex flex-col items-center justify-center min-h-[200px] animate-in fade-in duration-300">
              {data.sourceImageUrl ? (
                <img
                  src={data.sourceImageUrl}
                  alt="OCR 源图"
                  className="max-w-full h-auto rounded border border-borderTone dark:border-slate-700"
                />
              ) : (
                <div className="w-full h-48 bg-surface dark:bg-slate-800 rounded flex items-center justify-center relative overflow-hidden group border border-borderTone dark:border-slate-700">
                  <div className="absolute inset-0 bg-gradient-to-br from-surface-subtle to-borderTone dark:from-slate-700 dark:to-slate-800 opacity-50"></div>
                  <span className="relative z-10 text-text-tertiary dark:text-slate-400 text-sm font-medium flex flex-col items-center">
                    <Image className="h-8 w-8 mb-2" />
                    暂无源材料图片
                  </span>
                </div>
              )}
            </div>
          )}
        </section>
          </>
        )}
      </div>
    </div>
  )
}
