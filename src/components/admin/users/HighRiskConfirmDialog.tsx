'use client'

/**
 * High Risk Action Confirm Dialog
 * Story-046: 用户全生命周期管理后台 - Task B
 *
 * 高风险操作确认弹窗（封禁/解封/伪装登录/重置密码）
 */

import React, { useState } from 'react'
import { AlertTriangle, X, Shield, UserX, LogIn, KeyRound } from 'lucide-react'
import type { HighRiskAction } from '@/types/admin-user'

interface HighRiskConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => Promise<void>
  action: HighRiskAction
  userEmail: string
  isLoading?: boolean
}

const actionConfig: Record<
  HighRiskAction,
  {
    title: string
    description: string
    icon: React.ReactNode
    confirmText: string
    variant: 'danger' | 'warning'
  }
> = {
  ban: {
    title: '封禁用户',
    description: '将用户状态设为 Banned，用户将无法登录',
    icon: <UserX className="w-6 h-6" />,
    confirmText: '确认封禁',
    variant: 'danger',
  },
  unban: {
    title: '解除封禁',
    description: '恢复用户账户访问权限',
    icon: <Shield className="w-6 h-6" />,
    confirmText: '确认解封',
    variant: 'warning',
  },
  impersonate: {
    title: '伪装登录',
    description: '以该用户身份登录系统，所有操作将被记录',
    icon: <LogIn className="w-6 h-6" />,
    confirmText: '开始伪装',
    variant: 'warning',
  },
  resetPassword: {
    title: '重置密码',
    description: '发送密码重置邮件给该用户',
    icon: <KeyRound className="w-6 h-6" />,
    confirmText: '发送重置邮件',
    variant: 'warning',
  },
}

export const HighRiskConfirmDialog: React.FC<HighRiskConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  userEmail,
  isLoading = false,
}) => {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const config = actionConfig[action]
  const isDanger = config.variant === 'danger'

  const handleConfirm = async () => {
    if (reason.length < 10) {
      setError('原因至少需要10个字符')
      return
    }
    setError('')
    await onConfirm(reason)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md mx-4 animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                isDanger ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">{config.title}</h3>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* User Info */}
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
            <div
              className={`p-2 rounded-lg ${
                isDanger ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
              }`}
            >
              {config.icon}
            </div>
            <div>
              <p className="text-sm text-slate-400">目标用户</p>
              <p className="text-white font-medium">{userEmail}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-400">{config.description}</p>

          {/* Reason Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              操作原因 <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                if (e.target.value.length >= 10) setError('')
              }}
              placeholder="请输入操作原因（至少10个字符）..."
              rows={3}
              disabled={isLoading}
              className={`w-full bg-slate-800 border rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-colors resize-none ${
                error
                  ? 'border-red-500 focus:ring-red-500/50'
                  : 'border-slate-700 focus:ring-blue-500/50 focus:border-blue-500'
              }`}
            />
            <div className="flex justify-between mt-1">
              {error ? (
                <p className="text-xs text-red-400">{error}</p>
              ) : (
                <span />
              )}
              <p className={`text-xs ${reason.length >= 10 ? 'text-green-400' : 'text-slate-500'}`}>
                {reason.length}/10
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-800">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || reason.length < 10}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
              isDanger
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                处理中...
              </>
            ) : (
              config.confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
