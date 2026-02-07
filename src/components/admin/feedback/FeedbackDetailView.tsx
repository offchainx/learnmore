'use client';

import React, { useState } from 'react';
import { replyToFeedback } from '@/actions/support/ticket';
import { FeedbackStatus, FeedbackCategory } from '@/types/feedback';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
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
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const statusColors: Record<FeedbackStatus, string> = {
  PENDING: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  RESOLVED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  REJECTED: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  CLOSED: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
};

export function FeedbackDetailView({ initialData }: { initialData: any }) {
  const [reply, setReply] = useState(initialData.adminReply || '');
  const [status, setStatus] = useState<FeedbackStatus>(initialData.status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleReply = async () => {
    if (!reply.trim()) {
      toast({
        title: '回复内容不能为空',
        description: '请输入对用户的回复内容。',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    const result = await replyToFeedback(initialData.id, reply, status);
    if (result.success) {
      toast({
        title: '回复已发送',
        description: '用户将通过邮件和站内通知收到您的回复。',
      });
      router.refresh();
    } else {
      toast({
        title: '发送失败',
        description: result.error as string || '回复发送过程中出现错误。',
        variant: 'destructive',
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/feedback" className="flex items-center text-slate-400 hover:text-white transition-colors group">
          <div className="p-2 mr-2 bg-slate-900 rounded-lg group-hover:bg-slate-800 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </div>
          返回列表
        </Link>
        <div className="flex items-center gap-2">
           <span className="text-xs text-slate-500">ID: {initialData.id}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主要内容区 */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-md overflow-hidden">
            <CardHeader className="border-b border-slate-800 bg-slate-900/50">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`${statusColors[initialData.status as FeedbackStatus]} border font-medium`}>
                      {initialData.status}
                    </Badge>
                    <Badge variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700">
                      {initialData.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl text-white font-bold tracking-tight">
                    {initialData.title}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="bg-slate-950/50 rounded-xl p-6 border border-slate-800/50">
                <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {initialData.content}
                </p>
              </div>

              {initialData.attachments && initialData.attachments.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
                    <Tag className="h-4 w-4" /> 附件内容
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {initialData.attachments.map((url: string, idx: number) => (
                      <div key={idx} className="group relative aspect-video rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                        <img 
                          src={url} 
                          alt={`Attachment ${idx + 1}`} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ExternalLink className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 回复区 */}
          <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-md">
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
                className="min-h-[180px] bg-slate-950 border-slate-800 text-white focus:ring-blue-500/20 text-base p-4"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-sm text-slate-400 whitespace-nowrap">更新状态:</span>
                  <Select value={status} onValueChange={(v: FeedbackStatus) => setStatus(v)}>
                    <SelectTrigger className="w-full sm:w-[160px] bg-slate-950 border-slate-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
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
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 h-11 font-semibold transition-all active:scale-95"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                  发送回复
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 侧边信息栏 */}
        <div className="space-y-6">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <User className="h-4 w-4" />
                用户信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{initialData.user?.username || '匿名用户'}</p>
                  <p className="text-xs text-slate-500">ID: {initialData.userId || 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <span className="text-sm truncate">{initialData.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span className="text-sm">提交于 {format(new Date(initialData.createdAt), 'yyyy-MM-dd HH:mm')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                处理历史
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {initialData.repliedAt ? (
                <div className="relative pl-6 border-l-2 border-emerald-500/30 space-y-2 py-1">
                  <div className="absolute -left-[9px] top-2 h-4 w-4 rounded-full bg-[#0f172a] border-2 border-emerald-500 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-sm font-medium text-emerald-400">已回复</p>
                  <p className="text-xs text-slate-500">
                    {format(new Date(initialData.repliedAt), 'yyyy-MM-dd HH:mm')}
                  </p>
                </div>
              ) : (
                <div className="relative pl-6 border-l-2 border-amber-500/30 space-y-2 py-1">
                  <div className="absolute -left-[9px] top-2 h-4 w-4 rounded-full bg-[#0f172a] border-2 border-amber-500 flex items-center justify-center">
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
  );
}
