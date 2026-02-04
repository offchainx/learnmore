'use client'

import { useState } from 'react'
import { SubscriptionTier } from '@prisma/client'
import { applyAdminOverride } from '@/actions/admin/permission-override'
import { Button } from '@/components/ui/button'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, ShieldAlert } from 'lucide-react'

interface GrantPermissionDialogProps {
  userId: string
  currentTier: SubscriptionTier | null
}

export function GrantPermissionDialog({ userId, currentTier }: GrantPermissionDialogProps) {
  const [open, setOpen] = useState(false)
  const [tier, setTier] = useState<SubscriptionTier>(currentTier || 'STARTER')
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const isValid = reason.trim().length >= 10

  const handleOverride = async () => {
    if (!isValid) return

    setIsLoading(true)
    try {
      await applyAdminOverride({ userId, tier, reason })
      toast({
        title: '权限覆写成功',
        description: `用户等级已更新为 ${tier}`,
      })
      setOpen(false)
      setReason('')
    } catch (error) {
      toast({
        title: '操作失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ShieldAlert className="h-4 w-4" />
          赠送/修改会员
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>管理用户权限</DialogTitle>
          <DialogDescription>
            直接修改用户的订阅等级。此操作将被记录在安全审计日志中。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="tier">目标等级</Label>
            <Select
              value={tier}
              onValueChange={(value) => setTier(value as SubscriptionTier)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择等级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STARTER">Starter (体验版)</SelectItem>
                <SelectItem value="STANDARD">Standard (自学版)</SelectItem>
                <SelectItem value="SMART_PLUS">Smart Plus (智学版)</SelectItem>
                <SelectItem value="PREMIER">Premier (领航版)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reason">
              修改原因 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="请输入详细的操作原因（至少10个字符），例如：处理用户投诉退款降级、市场活动赠送等。"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-24"
            />
            <p className="text-xs text-muted-foreground text-right">
              {reason.length}/10
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            取消
          </Button>
          <Button onClick={handleOverride} disabled={!isValid || isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            确认修改
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
