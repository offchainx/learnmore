'use client'

import { useState } from 'react'
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
import { applyAdminOverride, getOverrideHistory } from '@/actions/admin/permission-override'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, History } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface OverrideModalProps {
  user: any
  children: React.ReactNode
  onSuccess: () => void
}

export function OverrideModal({ user, children, onSuccess }: OverrideModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tier, setTier] = useState<string>(user.subscriptionTier)
  const [duration, setDuration] = useState<string>('30_days')
  const [reason, setReason] = useState('')
  const [history, setHistory] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast({
        title: "需要理由",
        description: "请提供进行此操作的原因",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const result = await applyAdminOverride({
        userId: user.id,
        tier: tier as any,
        duration,
        reason
      })

      if (result.success) {
        toast({
          title: "操作成功",
          description: `用户 ${user.username || user.email} 的权限已更新`,
        })
        setOpen(false)
        onSuccess()
      }
    } catch (error) {
      toast({
        title: "操作失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    try {
      const data = await getOverrideHistory(user.id)
      setHistory(data)
      setShowHistory(true)
    } catch (error) {
      toast({
        title: "获取历史失败",
        description: "无法加载覆写历史记录",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>权限提权 / 覆写</DialogTitle>
          <DialogDescription>
            为用户 <strong>{user.username || user.email}</strong> 调整权限。此操作将被审计。
          </DialogDescription>
        </DialogHeader>

        {!showHistory ? (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tier">目标等级</Label>
              <Select value={tier} onValueChange={setTier}>
                <SelectTrigger id="tier">
                  <SelectValue placeholder="选择订阅等级" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STARTER">STARTER (免费版)</SelectItem>
                  <SelectItem value="STANDARD">STANDARD (标准版)</SelectItem>
                  <SelectItem value="SMART_PLUS">SMART_PLUS (智学版)</SelectItem>
                  <SelectItem value="PREMIER">PREMIER (旗舰版)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="duration">有效期</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger id="duration">
                  <SelectValue placeholder="选择时长" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7_days">7 天</SelectItem>
                  <SelectItem value="30_days">30 天</SelectItem>
                  <SelectItem value="90_days">90 天</SelectItem>
                  <SelectItem value="permanent">永久 (无过期日期)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reason">操作理由</Label>
              <Textarea
                id="reason"
                placeholder="例如：客服补救、特殊活动赠送、内测用户等..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <Button variant="ghost" size="sm" className="justify-start px-0" onClick={fetchHistory}>
              <History className="mr-2 h-4 w-4" />
              查看覆写历史
            </Button>
          </div>
        ) : (
          <div className="py-4">
            <h4 className="mb-2 text-sm font-semibold">历史记录</h4>
            <div className="max-h-[300px] overflow-y-auto space-y-3 rounded-md border p-3">
              {history.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">暂无历史记录</p>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="text-xs border-b pb-2 last:border-0 last:pb-0">
                    <div className="flex justify-between font-medium">
                      <span>{item.newValue}</span>
                      <span className="text-muted-foreground">
                        {format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                      </span>
                    </div>
                    <p className="mt-1 text-muted-foreground italic">"{item.reason}"</p>
                    <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                      <span>管理员: {item.admin?.username || item.admin?.email}</span>
                      <span>过期: {item.expiresAt ? format(new Date(item.expiresAt), 'yyyy-MM-dd') : '永久'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button variant="link" className="mt-2 h-auto p-0" onClick={() => setShowHistory(false)}>
              返回编辑
            </Button>
          </div>
        )}

        <DialogFooter>
          {!showHistory && (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              确认覆写
            </Button>
          )}
          {showHistory && (
            <Button variant="outline" onClick={() => setOpen(false)}>关闭</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
