'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  applyAdminOverride,
  getOverrideHistory,
} from '@/actions/admin/permission-override'
import type {
  PermissionSearchUser,
  OverrideHistoryItem,
} from '@/actions/admin/permission-override'
import { useToast } from '@/components/ui/use-toast'
import { History, Loader2, TriangleAlert } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface OverrideModalProps {
  user: PermissionSearchUser
  children: React.ReactNode
  onSuccess: () => void
}

type ViewState = 'edit' | 'confirm' | 'history' | 'forbidden' | 'error'

const TIER_OPTIONS = [
  { value: 'STARTER', label: 'STARTER（基础版）' },
  { value: 'STANDARD', label: 'STANDARD（标准版）' },
  { value: 'SMART_PLUS', label: 'SMART_PLUS（增强版）' },
  { value: 'PREMIER', label: 'PREMIER（旗舰版）' },
]

const DURATION_OPTIONS = [
  { value: '7_days', label: '7 天' },
  { value: '30_days', label: '30 天' },
  { value: '90_days', label: '90 天' },
  { value: 'permanent', label: '永久' },
]

function isPermissionError(message: string): boolean {
  return message.includes('Unauthorized') || message.includes('权限不足')
}

export function OverrideModal({ user, children, onSuccess }: OverrideModalProps) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<ViewState>('edit')
  const [loading, setLoading] = useState(false)
  const [tier, setTier] = useState<string>('')
  const [duration, setDuration] = useState<string>('')
  const [reason, setReason] = useState('')
  const [history, setHistory] = useState<OverrideHistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!open) {
      return
    }

    setView('edit')
    setTier('')
    setDuration('')
    setReason('')
    setHistory([])
    setHistoryLoading(false)
    setMessage(null)
    setLoading(false)
  }, [open, user.id])

  const currentTierLabel = useMemo(() => {
    return (
      TIER_OPTIONS.find((item) => item.value === user.subscriptionTier)?.label ||
      user.subscriptionTier ||
      'STARTER（基础版）'
    )
  }, [user.subscriptionTier])

  const selectedTierLabel = useMemo(
    () => TIER_OPTIONS.find((item) => item.value === tier)?.label || '未选择',
    [tier]
  )

  const durationLabel = useMemo(
    () =>
      DURATION_OPTIONS.find((item) => item.value === duration)?.label ||
      '未选择',
    [duration]
  )

  const canContinue = tier !== '' && duration !== '' && reason.trim().length >= 10

  const resetState = () => {
    setView('edit')
    setTier('')
    setDuration('')
    setReason('')
    setHistory([])
    setHistoryLoading(false)
    setMessage(null)
    setLoading(false)
  }

  const closeDialog = () => {
    resetState()
    setOpen(false)
  }

  const handleConfirmState = () => {
    if (!canContinue) {
      setMessage('请先选择目标等级、有效期，并填写不少于 10 个字符的理由。')
      return
    }

    setMessage(null)
    setView('confirm')
  }

  const handleSubmit = async () => {
    if (!canContinue) {
      setMessage('请先补全覆写信息。')
      setView('edit')
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const result = await applyAdminOverride({
        userId: user.id,
        tier: tier as any,
        duration,
        reason,
      })

      if (result.success) {
        toast({
          title: '操作成功',
          description: `用户 ${user.username || user.email} 的权限已更新`,
        })
        resetState()
        setOpen(false)
        onSuccess()
        return
      }

      setMessage('操作失败')
      setView('error')
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '未知错误'
      setMessage(errorMessage)
      setView(isPermissionError(errorMessage) ? 'forbidden' : 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    setHistoryLoading(true)
    setMessage(null)

    try {
      const data = await getOverrideHistory(user.id)
      setHistory(data)
      setView('history')
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '无法加载覆写历史记录'
      setMessage(errorMessage)
      setView(isPermissionError(errorMessage) ? 'forbidden' : 'error')
    } finally {
      setHistoryLoading(false)
    }
  }

  const historyEmpty = !historyLoading && history.length === 0

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          closeDialog()
          return
        }
        setOpen(true)
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>权限提权 / 覆写</DialogTitle>
          <DialogDescription>
            为用户 <strong>{user.username || user.email}</strong> 调整权限。此操作会写入真实审计日志。
          </DialogDescription>
        </DialogHeader>

        {(view === 'forbidden' || view === 'error') && (
          <div
            className={`rounded-xl border p-4 ${
              view === 'forbidden'
                ? 'border-amber-900/60 bg-amber-950/30'
                : 'border-rose-900/60 bg-rose-950/30'
            }`}
          >
            <div className="flex items-start gap-3">
              <TriangleAlert
                className={view === 'forbidden' ? 'mt-0.5 text-amber-300' : 'mt-0.5 text-rose-300'}
                size={18}
              />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">
                  {view === 'forbidden' ? '无权限执行该操作' : '权限覆写提交失败'}
                </p>
                <p className="text-sm leading-6 text-slate-300">
                  {message || '请检查权限或稍后重试。'}
                </p>
              </div>
            </div>
          </div>
        )}

        {view === 'history' ? (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-slate-100">历史记录</h4>
              <Button variant="ghost" size="sm" onClick={() => setView('edit')}>
                返回编辑
              </Button>
            </div>

            <div className="max-h-[320px] space-y-3 overflow-y-auto rounded-md border border-slate-800 bg-slate-950/60 p-3">
              {historyLoading ? (
                <div className="flex items-center justify-center py-10 text-sm text-slate-400">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  加载历史中...
                </div>
              ) : historyEmpty ? (
                <div className="py-10 text-center">
                  <p className="text-sm font-medium text-slate-200">暂无覆写记录</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    当前用户还没有权限覆写历史，先发起一次提权操作即可生成真实记录。
                  </p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-slate-800 bg-slate-900/80 p-3 text-xs"
                  >
                    <div className="flex justify-between gap-3 font-medium text-slate-100">
                      <span>{item.newValue || 'N/A'}</span>
                      <span className="text-slate-500">
                        {format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                      </span>
                    </div>
                    <p className="mt-2 leading-5 text-slate-400">"{item.reason}"</p>
                    <div className="mt-2 flex flex-wrap justify-between gap-2 text-[10px] text-slate-500">
                      <span>管理员: {item.admin?.username || item.admin?.email || item.overriddenBy}</span>
                      <span>
                        过期: {item.expiresAt ? format(new Date(item.expiresAt), 'yyyy-MM-dd') : '永久'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setView('edit')}>
                返回编辑
              </Button>
              <Button className="flex-1" onClick={closeDialog}>
                关闭
              </Button>
            </div>
          </div>
        ) : view === 'confirm' ? (
          <div className="space-y-4 py-2">
            <div className="rounded-xl border border-blue-900/50 bg-blue-950/20 p-4">
              <p className="text-sm font-semibold text-blue-100">确认覆写</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                提交后会更新当前订阅等级，并写入 `userPermissionOverride` 与 `securityLog`。
              </p>
              <dl className="mt-4 grid gap-3 text-sm text-slate-300">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">当前等级</dt>
                  <dd>{currentTierLabel}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">目标等级</dt>
                  <dd>{selectedTierLabel}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">有效期</dt>
                  <dd>{durationLabel}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-slate-500">理由</dt>
                  <dd className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-slate-200">
                    {reason.trim()}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setView('edit')}>
                返回编辑
              </Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                确认覆写
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <p className="text-sm font-semibold text-slate-100">先填写信息，再进入确认</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                当前等级：{currentTierLabel}
              </p>
            </div>

            {message && view === 'edit' ? (
              <div className="rounded-lg border border-amber-900/60 bg-amber-950/30 px-3 py-2 text-sm text-amber-200">
                {message}
              </div>
            ) : null}

            <div className="grid gap-2">
              <Label htmlFor="tier">目标等级</Label>
              <Select value={tier} onValueChange={setTier}>
                <SelectTrigger id="tier">
                  <SelectValue placeholder="请选择订阅等级" />
                </SelectTrigger>
                <SelectContent>
                  {TIER_OPTIONS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="duration">有效期</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger id="duration">
                  <SelectValue placeholder="请选择有效期" />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reason">操作理由</Label>
              <Textarea
                id="reason"
                placeholder="例如：客服补救、特殊活动赠送、内测用户等..."
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="justify-start px-0"
              onClick={fetchHistory}
              disabled={historyLoading}
            >
              {historyLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <History className="mr-2 h-4 w-4" />
              )}
              查看真实历史
            </Button>
          </div>
        )}

        <DialogFooter>
          {view === 'edit' && (
            <>
              <Button variant="outline" onClick={closeDialog}>
                取消
              </Button>
              <Button onClick={handleConfirmState} disabled={loading}>
                下一步确认
              </Button>
            </>
          )}
          {view === 'history' && (
            <Button variant="outline" onClick={closeDialog}>
              关闭
            </Button>
          )}
          {(view === 'forbidden' || view === 'error') && (
            <>
              <Button variant="outline" onClick={() => setView('edit')}>
                返回编辑
              </Button>
              <Button onClick={closeDialog}>关闭</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
