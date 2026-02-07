'use client'

/**
 * Admin Note List Component
 * Story-046: 用户全生命周期管理后台 - Task B
 *
 * 内部备注系统：支持添加、软删除、恢复、置顶
 */

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  MessageSquare,
  Plus,
  Pin,
  Trash2,
  RotateCcw,
  Eye,
  EyeOff,
  Send,
} from 'lucide-react'
import { addAdminNote, softDeleteAdminNote, restoreAdminNote, toggleNotePin } from '@/actions/admin/user-ops'
import type { Admin } from '@/types'
import { toast } from 'sonner'

interface AdminNoteListProps {
  userId: string
  notes: Admin.AdminNote[]
}

export const AdminNoteList: React.FC<AdminNoteListProps> = ({ userId, notes }) => {
  const router = useRouter()
  const [showDeleted, setShowDeleted] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [loadingNoteId, setLoadingNoteId] = useState<string | null>(null)

  // 过滤备注
  const visibleNotes = notes.filter((n) => (showDeleted ? true : !n.deletedAt))

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    setIsAdding(true)
    try {
      const result = await addAdminNote(userId, newNote)
      if (result.success) {
        toast.success('备注已添加')
        setNewNote('')
        router.refresh()
      } else {
        toast.error(result.error || '添加失败')
      }
    } catch (error) {
      console.error('Add note error:', error)
      toast.error('添加失败')
    } finally {
      setIsAdding(false)
    }
  }

  const handleDelete = async (noteId: string) => {
    setLoadingNoteId(noteId)
    try {
      const result = await softDeleteAdminNote(noteId)
      if (result.success) {
        toast.success('备注已删除')
        router.refresh()
      } else {
        toast.error(result.error || '删除失败')
      }
    } catch (error) {
      console.error('Delete note error:', error)
      toast.error('删除失败')
    } finally {
      setLoadingNoteId(null)
    }
  }

  const handleRestore = async (noteId: string) => {
    setLoadingNoteId(noteId)
    try {
      const result = await restoreAdminNote(noteId)
      if (result.success) {
        toast.success('备注已恢复')
        router.refresh()
      } else {
        toast.error(result.error || '恢复失败')
      }
    } catch (error) {
      console.error('Restore note error:', error)
      toast.error('恢复失败')
    } finally {
      setLoadingNoteId(null)
    }
  }

  const handleTogglePin = async (noteId: string) => {
    setLoadingNoteId(noteId)
    try {
      const result = await toggleNotePin(noteId)
      if (result.success) {
        toast.success('置顶状态已更新')
        router.refresh()
      } else {
        toast.error(result.error || '操作失败')
      }
    } catch (error) {
      console.error('Toggle pin error:', error)
      toast.error('操作失败')
    } finally {
      setLoadingNoteId(null)
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white">内部备注</h3>
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
            {visibleNotes.length}
          </span>
        </div>

        <button
          onClick={() => setShowDeleted(!showDeleted)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${
            showDeleted
              ? 'bg-amber-600/20 text-amber-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          {showDeleted ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          {showDeleted ? '隐藏已删除' : '查看已删除'}
        </button>
      </div>

      {/* Add Note Form */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex gap-2">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="添加内部备注..."
            rows={2}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none"
          />
          <button
            onClick={handleAddNote}
            disabled={isAdding || !newNote.trim()}
            className="self-end px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isAdding ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div className="divide-y divide-slate-800 max-h-[400px] overflow-y-auto">
        {visibleNotes.length === 0 ? (
          <div className="py-12 text-center">
            <MessageSquare className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">暂无备注</p>
          </div>
        ) : (
          visibleNotes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              isLoading={loadingNoteId === note.id}
              onDelete={() => handleDelete(note.id)}
              onRestore={() => handleRestore(note.id)}
              onTogglePin={() => handleTogglePin(note.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

// --- Note Item Component ---

interface NoteItemProps {
  note: Admin.AdminNote
  isLoading: boolean
  onDelete: () => void
  onRestore: () => void
  onTogglePin: () => void
}

const NoteItem: React.FC<NoteItemProps> = ({
  note,
  isLoading,
  onDelete,
  onRestore,
  onTogglePin,
}) => {
  const isDeleted = !!note.deletedAt

  return (
    <div
      className={`p-4 transition-colors ${
        isDeleted ? 'bg-slate-950/50 opacity-60' : 'hover:bg-slate-800/30'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Pin indicator */}
        {note.isPinned && !isDeleted && (
          <Pin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        )}

        <div className="flex-1 min-w-0">
          {/* Content */}
          <p className={`text-sm whitespace-pre-wrap ${isDeleted ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
            {note.content}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
            <span>{new Date(note.createdAt).toLocaleString('zh-CN')}</span>
            {isDeleted && (
              <span className="text-red-400">
                已删除于 {new Date(note.deletedAt!).toLocaleString('zh-CN')}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {isLoading ? (
            <div className="w-6 h-6 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-slate-500 border-t-slate-300 rounded-full animate-spin" />
            </div>
          ) : isDeleted ? (
            <button
              onClick={onRestore}
              className="p-1.5 rounded hover:bg-green-600/20 text-green-400 transition-colors"
              title="恢复"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={onTogglePin}
                className={`p-1.5 rounded transition-colors ${
                  note.isPinned
                    ? 'bg-amber-600/20 text-amber-400'
                    : 'hover:bg-slate-700 text-slate-400'
                }`}
                title={note.isPinned ? '取消置顶' : '置顶'}
              >
                <Pin className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 rounded hover:bg-red-600/20 text-slate-400 hover:text-red-400 transition-colors"
                title="删除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
