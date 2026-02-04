'use client'

/**
 * High Risk Action Confirm Dialog
 * Story-046: 用户全生命周期管理后台 - Task B
 *
 * 高风险操作确认弹窗（封禁/解封/伪装登录/重置密码）
 * 对齐 AI Studio 设计风格
 */

import React, { useState } from 'react'
import { AlertTriangle, X, Shield, UserX, LogIn, KeyRound } from 'lucide-react'
import type { HighRiskAction } from '@/types/admin-user'

interface HighRiskConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string, duration?: string) => Promise<void>
  action: HighRiskAction
  userEmail: string
  userName?: string
  isLoading?: boolean
}

const actionConfig: Record<
  HighRiskAction,
  {
    title: string
    description: string
    icon: React.ElementType
    confirmText: string
    variant: 'danger' | 'warning'
  }
> = {
  ban: {
    title: 'Ban User',
    description: 'You are about to ban {userName}. This will revoke their access immediately.',
    icon: UserX,
    confirmText: 'Confirm Ban',
    variant: 'danger',
  },
  unban: {
    title: 'Unban User',
    description: 'Restore account access for {userName}.',
    icon: Shield,
    confirmText: 'Confirm Unban',
    variant: 'warning',
  },
  impersonate: {
    title: 'Impersonate User',
    description: 'Log in as {userName}, all actions will be recorded.',
    icon: LogIn,
    confirmText: 'Start Impersonation',
    variant: 'warning',
  },
  resetPassword: {
    title: 'Reset Password',
    description: 'Send a password reset email to {userName}.',
    icon: KeyRound,
    confirmText: 'Send Email',
    variant: 'warning',
  },
}

const DURATIONS = [
  { id: '1_day', label: '24 Hours' },
  { id: '3_days', label: '3 Days' },
  { id: '7_days', label: '1 Week' },
  { id: '30_days', label: '30 Days' },
  { id: 'permanent', label: 'Permanent' }
]

export const HighRiskConfirmDialog: React.FC<HighRiskConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  userEmail,
  userName = 'this user',
  isLoading = false,
}) => {
  const [duration, setDuration] = useState('7_days')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const config = actionConfig[action]
  const isBan = action === 'ban'
  const isDanger = config.variant === 'danger'

  const handleConfirm = async () => {
    if (reason.trim().length < 10) {
      setError('原因至少需要 10 个字符')
      return
    }
    setError('')
    await onConfirm(reason.trim(), isBan ? duration : undefined)
    setReason('')
  }

  const handleClose = () => {
    if (!isLoading) {
      setReason('')
      setError('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
          <h3 className="text-lg font-bold text-white">{config.title}</h3>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning Box */}
          <div className="flex items-start gap-3 p-4 bg-red-950/20 border border-red-900/40 rounded-lg text-red-200 text-sm">
            <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
            <p>
              {config.description.replace('{userName}', userName)}
            </p>
          </div>

          {/* Duration Selection (Only for Ban) */}
          {isBan && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                Duration
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DURATIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setDuration(opt.id)}
                    disabled={isLoading}
                    className={`text-sm px-3 py-2.5 rounded-lg border transition-all ${
                      duration === opt.id
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20'
                        : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reason Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => { setReason(e.target.value); if (error) setError('') }}
              placeholder="请输入操作原因（至少 10 个字符）..."
              rows={3}
              disabled={isLoading}
              className={`w-full bg-[#050505] border rounded-lg p-3 text-slate-200 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-slate-600 ${error ? 'border-red-500' : 'border-slate-700'}`}
            />
            {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-6 pt-0">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || reason.trim().length < 10}
            className={`flex-1 py-2.5 rounded-lg text-white transition-all font-medium text-sm shadow-lg flex items-center justify-center gap-2 ${
              isDanger
                ? 'bg-[#ef4444] hover:bg-red-500 shadow-red-900/20'
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'
            }`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              config.confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
