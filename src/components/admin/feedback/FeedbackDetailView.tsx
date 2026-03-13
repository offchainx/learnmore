'use client'

import React, { useState } from 'react'
import { replyToFeedback } from '@/actions/support/ticket'
import { FeedbackStatus, FeedbackCategory } from '@/types/feedback'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Send,
  Loader2,
  User,
  Clock,
  Tag,
  MessageCircle,
  Mail,
  ExternalLink,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const statusColors: Record<FeedbackStatus, string> = {
  PENDING: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  RESOLVED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  REJECTED: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  CLOSED: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
}

export function FeedbackDetailView({ initialData }: { initialData: any }) {
  const [reply, setReply] = useState(initialData.adminReply || '')
  const [status, setStatus] = useState<FeedbackStatus>(initialData.status)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleReply = async () => {
    if (!reply.trim()) {
      toast({
        title: '回复内容不能为空',
        description: '请输入对用户的回复内容。',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    const result = await replyToFeedback(initialData.id, reply, status)
    if (result.success) {
      toast({
        title: '回复已发送',
        description: '用户将通过邮件和站内通知收到您的回复。',
      })
      router.refresh()
    } else {
      toast({
        title: '发送失败',
        description: (result.error as string) || '回复发送过程中出现错误。',
        variant: 'destructive',
      })
    }
    setIsSubmitting(false)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="relative overflow-hidden rounded-[28px] border border-[#24324D] bg-[linear-gradient(135deg,#111A2E_0%,#0F1A2F_55%,#0B1220_100%)] px-4 py-4 shadow-[0_22px_50px_rgba(2,8,23,0.35)] sm:px-5">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#2563EB]/10 blur-3xl" />
        <div className="absolute bottom-0 left-16 h-24 w-24 rounded-full bg-[#22C55E]/10 blur-3xl" />

        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#E6EDF7] sm:text-[30px]">
                反馈处理
              </h1>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#274066] bg-[#10203C] px-2.5 py-1 text-[11px] font-medium text-[#D6E7FF]">
                <MessageCircle className="h-3 w-3 text-[#60A5FA]" />
                Ticket Console
              </div>
            </div>
            <p className="max-w-3xl text-sm text-[#B2C3DA]">
              查看反馈原文、附件与用户上下文，并在同一工作区内完成状态更新和回复。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
            <Link
              href="/admin/feedback"
              className="inline-flex items-center gap-2 rounded-xl border border-[#24324D] bg-[#151F36] px-3 py-2 text-sm text-[#E6EDF7] transition-colors hover:bg-[#1A2744]"
            >
              <ArrowLeft className="h-4 w-4" />
              返回列表
            </Link>
            <span className="font-mono text-xs text-[#9FB0C9]">
              ID: {initialData.id}
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 主要内容区 */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="overflow-hidden border-slate-800 bg-slate-900/40 backdrop-blur-md">
            <CardHeader className="border-b border-slate-800 bg-slate-900/50">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge
                      className={`${statusColors[initialData.status as FeedbackStatus]} border font-medium`}
                    >
                      {initialData.status}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="border-slate-700 bg-slate-800 text-slate-300"
                    >
                      {initialData.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-bold tracking-tight text-white">
                    {initialData.title}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="rounded-xl border border-slate-800/50 bg-slate-950/50 p-6">
                <p className="whitespace-pre-wrap leading-relaxed text-slate-200">
                  {initialData.content}
                </p>
              </div>

              {initialData.attachments &&
                initialData.attachments.length > 0 && (
                  <div className="mt-8">
                    <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-400">
                      <Tag className="h-4 w-4" /> 附件内容
                    </h4>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {initialData.attachments.map(
                        (url: string, idx: number) => (
                          <div
                            key={idx}
                            className="group relative aspect-video overflow-hidden rounded-lg border border-slate-800 bg-slate-950"
                          >
                            <img
                              src={url}
                              alt={`Attachment ${idx + 1}`}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                              <ExternalLink className="h-5 w-5 text-white" />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* 回复区 */}
          <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="h-5 w-5 text-blue-400" />
                回复用户
              </CardTitle>
              <CardDescription className="text-slate-400">
                用户将通过电子邮件和站内通知收到此回复。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="在此输入您的回复..."
                className="min-h-[180px] border-slate-800 bg-slate-950 p-4 text-base text-white focus:ring-blue-500/20"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />

              <div className="flex flex-col items-center justify-between gap-4 pt-2 sm:flex-row">
                <div className="flex w-full items-center gap-3 sm:w-auto">
                  <span className="whitespace-nowrap text-sm text-slate-400">
                    更新状态:
                  </span>
                  <Select
                    value={status}
                    onValueChange={(v: FeedbackStatus) => setStatus(v)}
                  >
                    <SelectTrigger className="w-full border-slate-800 bg-slate-950 sm:w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-slate-800 bg-slate-900 text-white">
                      <SelectItem value="PENDING">待处理</SelectItem>
                      <SelectItem value="IN_PROGRESS">处理中</SelectItem>
                      <SelectItem value="RESOLVED">已解决</SelectItem>
                      <SelectItem value="REJECTED">已拒绝</SelectItem>
                      <SelectItem value="CLOSED">已关闭</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleReply}
                  disabled={isSubmitting}
                  className="h-11 w-full bg-blue-600 px-8 font-semibold text-white transition-all hover:bg-blue-500 active:scale-95 sm:w-auto"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  发送回复
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 侧边信息栏 */}
        <div className="space-y-6">
          <Card className="border-slate-800 bg-slate-900/40">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
                <User className="h-4 w-4" />
                用户信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-slate-800/50 bg-slate-950/50 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {initialData.user?.username || '匿名用户'}
                  </p>
                  <p className="text-xs text-slate-500">
                    ID: {initialData.userId || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <span className="truncate text-sm">{initialData.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span className="text-sm">
                    提交于{' '}
                    {format(
                      new Date(initialData.createdAt),
                      'yyyy-MM-dd HH:mm'
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/40">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
                <AlertCircle className="h-4 w-4" />
                处理历史
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {initialData.repliedAt ? (
                <div className="relative space-y-2 border-l-2 border-emerald-500/30 py-1 pl-6">
                  <div className="absolute -left-[9px] top-2 flex h-4 w-4 items-center justify-center rounded-full border-2 border-emerald-500 bg-[#0f172a] shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-sm font-medium text-emerald-400">已回复</p>
                  <p className="text-xs text-slate-500">
                    {format(
                      new Date(initialData.repliedAt),
                      'yyyy-MM-dd HH:mm'
                    )}
                  </p>
                </div>
              ) : (
                <div className="relative space-y-2 border-l-2 border-amber-500/30 py-1 pl-6">
                  <div className="absolute -left-[9px] top-2 flex h-4 w-4 items-center justify-center rounded-full border-2 border-amber-500 bg-[#0f172a]">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  </div>
                  <p className="text-sm font-medium text-amber-400">等待处理</p>
                  <p className="text-xs text-slate-500">尚未进行任何回复</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
