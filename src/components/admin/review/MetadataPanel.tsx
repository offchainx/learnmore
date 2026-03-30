'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { QuestionReviewData } from '@/types/content-pipeline'
import { Pencil, X, Check } from 'lucide-react'

interface MetadataPanelProps {
  data: QuestionReviewData
  onUpdate: (data: QuestionReviewData) => void
  onApprove: (feedback?: string) => void
  onReject: (reason: string) => void
  isProcessing?: boolean
  reviewCompletedAction?: 'approved' | 'rejected' | null
  onNextQuestion?: () => void
  hasNextQuestion?: boolean
}

/**
 * 元数据和审核操作面板（右侧）
 * 包含元数据编辑、标签管理、审核历史、审核操作
 */
export function MetadataPanel({
  data,
  onUpdate,
  onApprove,
  onReject,
  isProcessing = false,
  reviewCompletedAction = null,
  onNextQuestion,
  hasNextQuestion = false,
}: MetadataPanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempData, setTempData] = useState<QuestionReviewData>(data)
  const [feedback, setFeedback] = useState('')

  const availableSubjects = data.availableSubjects ?? []
  const availableChapters = data.availableChapters ?? []
  const selectedSubjectId = tempData.metadata.subjectId ?? ''
  const chapterOptions = useMemo(
    () =>
      availableChapters.filter((chapter) =>
        selectedSubjectId ? chapter.subjectId === selectedSubjectId : false
      ),
    [availableChapters, selectedSubjectId]
  )

  useEffect(() => {
    if (isEditing) {
      setTempData(JSON.parse(JSON.stringify(data)))
    }
  }, [isEditing, data])

  const handleSave = () => {
    onUpdate(tempData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  return (
    <aside className="z-20 flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden border-t border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 desktop:w-[400px] desktop:border-l desktop:border-t-0">
      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 desktop:px-5 desktop:py-5 2xl:px-6">
        {/* 元数据网格 */}
        <div className="group relative">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              题目元数据
            </h4>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-1"
                title="编辑元数据"
              >
                <Pencil className="h-4 w-4" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  保存
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  科目
                </label>
                <select
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  value={tempData.metadata.subjectId ?? ''}
                  onChange={(e) => {
                    const nextSubjectId = e.target.value || null
                    const selectedSubject = availableSubjects.find((subject) => subject.id === nextSubjectId)
                    setTempData({
                      ...tempData,
                      metadata: {
                        ...tempData.metadata,
                        subjectId: nextSubjectId,
                        subject: selectedSubject?.name || '未分类',
                        chapterId: null,
                        topic: '未分类',
                      },
                    })
                  }}
                >
                  <option value="">未分类</option>
                  {availableSubjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  章节
                </label>
                <select
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  value={tempData.metadata.chapterId ?? ''}
                  disabled={!selectedSubjectId}
                  onChange={(e) => {
                    const nextChapterId = e.target.value || null
                    const selectedChapter = chapterOptions.find((chapter) => chapter.id === nextChapterId)
                    setTempData({
                      ...tempData,
                      metadata: {
                        ...tempData.metadata,
                        chapterId: nextChapterId,
                        topic: selectedChapter?.pathLabel || '未分类',
                      },
                    })
                  }}
                >
                  <option value="">{selectedSubjectId ? '未分类' : '请先选择科目'}</option>
                  {chapterOptions.map((chapter) => (
                    <option key={chapter.id} value={chapter.id}>
                      {chapter.pathLabel}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  难度等级
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() =>
                        setTempData({
                          ...tempData,
                          metadata: {
                            ...tempData.metadata,
                            difficulty: `L${lvl}`,
                            difficultyLabel:
                              lvl === 1
                                ? '很简单'
                                : lvl === 2
                                  ? '简单'
                                  : lvl === 3
                                    ? '中等'
                                    : lvl === 4
                                      ? '困难'
                                      : '很困难',
                          },
                        })
                      }
                      className={`flex-1 py-1 rounded text-xs border transition-colors ${
                        tempData.metadata.difficulty === `L${lvl}`
                          ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-bold'
                          : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
              <div className="col-span-2">
                <span className="block text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                  科目
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-200">
                  {data.metadata.subject}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                  章节
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-200">
                  {data.metadata.topic}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                  题型
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">
                  {data.metadata.type}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                  难度
                </span>
                <div className="flex items-center">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                    {data.metadata.difficulty}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                    {data.metadata.difficultyLabel}
                  </span>
                </div>
              </div>
              <div>
                <span className="block text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                  分值
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-200">
                  {data.metadata.points} 分
                </span>
              </div>
            </div>
          )}
        </div>

        <hr className="border-slate-200 dark:border-slate-800" />

        {/* 标签 */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            标签
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.metadata.tags.map((tag) => (
              <span
                key={tag}
                className="group px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-default flex items-center"
              >
                #{tag}
                {isEditing && (
                  <button
                    type="button"
                    onClick={() =>
                      setTempData({
                        ...tempData,
                        metadata: {
                          ...tempData.metadata,
                          tags: tempData.metadata.tags.filter((t) => t !== tag),
                        },
                      })
                    }
                    className="ml-1 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))}
            {isEditing && (
              <input
                type="text"
                placeholder="+ 添加标签"
                className="w-24 px-2 py-1 text-xs bg-transparent border-b border-slate-300 dark:border-slate-700 focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none text-slate-800 dark:text-slate-200"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value.trim()
                    if (val && !tempData.metadata.tags.includes(val)) {
                      setTempData({
                        ...tempData,
                        metadata: {
                          ...tempData.metadata,
                          tags: [...tempData.metadata.tags, val],
                        },
                      })
                      ;(e.target as HTMLInputElement).value = ''
                    }
                  }
                }}
              />
            )}
          </div>
        </div>

        <hr className="border-slate-200 dark:border-slate-800" />

        {/* 审核历史 */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            审核历史
          </h4>
          <ul className="space-y-4">
            {data.history.map((item, idx) => (
              <li
                key={idx}
                className="relative pl-4 border-l border-slate-200 dark:border-slate-700"
              >
                <div
                  className={`absolute -left-1.5 top-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${item.color}`}
                ></div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {item.status}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {item.date} • {item.user}
                </p>
                {item.comment ? (
                  <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                    {item.comment}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 审核操作区 */}
      <div className="sticky bottom-0 border-t border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950 desktop:px-5 2xl:px-6">
        {reviewCompletedAction ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
              {reviewCompletedAction === 'approved'
                ? '当前题目已通过，可继续处理下一题。'
                : '当前题目已驳回，可继续处理下一题。'}
            </div>
            <button
              type="button"
              onClick={onNextQuestion}
              className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            >
              <Check className="h-4 w-4 mr-2" />
              {hasNextQuestion ? '下一题' : '返回审核列表'}
            </button>
          </div>
        ) : data.status === 'VERIFIED' || data.status === 'PUBLISHED' ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {data.status === 'PUBLISHED'
                ? '当前题目已发布，不再提供通过 / 驳回操作。'
                : '当前题目已审核完成，不再提供通过 / 驳回操作。'}
            </div>
            <button
              type="button"
              disabled
              className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-bold text-slate-400 bg-slate-300 dark:bg-slate-700 cursor-not-allowed"
            >
              <Check className="h-4 w-4 mr-2" />
              {data.status === 'PUBLISHED' ? '已发布' : '已审核'}
            </button>
          </div>
        ) : (
          // 待审核状态：显示通过和拒绝按钮
          <>
            <div className="mb-3">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                审核意见（可选）
              </label>
              <textarea
                className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-slate-900 dark:text-white placeholder-slate-400 resize-none p-2"
                placeholder="留下审核意见..."
                rows={2}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              ></textarea>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  if (confirm('确定拒绝这道题目吗？')) {
                    onReject(feedback || '审核未通过')
                  }
                }}
                disabled={isProcessing}
                className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
              >
                <X className="h-4 w-4 mr-2" />
                {isProcessing ? '处理中...' : '拒绝'}
              </button>
              <button
                type="button"
                onClick={() => {
                  onApprove(feedback || undefined)
                }}
                disabled={isProcessing}
                className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
              >
                <Check className="h-4 w-4 mr-2" />
                {isProcessing ? '处理中...' : '通过'}
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  )
}
