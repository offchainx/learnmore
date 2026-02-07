'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { submitFeedback } from '@/actions/support/ticket';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Sparkles } from 'lucide-react';
import { FeedbackCategory } from '@/types/feedback';

const feedbackSchema = z.object({
  category: z.nativeEnum(FeedbackCategory),
  title: z.string().min(2, '标题至少需要2个字符'),
  content: z.string().min(5, '反馈内容至少需要5个字符'),
  email: z.string().email('请输入有效的电子邮箱').optional().or(z.literal('')),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: FeedbackCategory;
}

export function FeedbackModal({ isOpen, onClose, defaultCategory = FeedbackCategory.SUGGESTION }: FeedbackModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      category: defaultCategory,
      title: '',
      content: '',
      email: '',
    },
  });

  async function onSubmit(values: FeedbackFormValues) {
    setIsSubmitting(true);
    try {
      const result = await submitFeedback({
        category: values.category,
        title: values.title,
        content: values.content,
        email: values.email || undefined,
      });

      if (result.success) {
        toast({
          title: '提交成功 ✨',
          description: "感谢您的反馈！我们将尽快审阅您的建议。",
        });
        form.reset();
        onClose();
      } else {
        toast({
          title: '提交失败',
          description: result.error as string || '无法提交反馈，请稍后再试。',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '错误',
        description: '发生未知错误，请重试。',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#0f172a] border-slate-800 text-white shadow-2xl p-0 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
        
        <DialogHeader className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
               <Sparkles className="h-5 w-5" />
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight">
              分享您的想法
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-400">
            您的反馈是我们不断进步的动力。无论是 Bug 报告还是功能建议，我们都非常重视。
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 px-8 pb-8">
            <div className="grid grid-cols-1 gap-5">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300 text-sm font-medium">反馈类型</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-950/50 border-slate-800 text-slate-200 h-11">
                          <SelectValue placeholder="选择一个分类" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        <SelectItem value={FeedbackCategory.BUG}>🐞 Bug 报告</SelectItem>
                        <SelectItem value={FeedbackCategory.SUGGESTION}>💡 功能建议</SelectItem>
                        <SelectItem value={FeedbackCategory.CONTENT_ISSUE}>📖 内容纠错</SelectItem>
                        <SelectItem value={FeedbackCategory.BILLING}>💳 账单/支付</SelectItem>
                        <SelectItem value={FeedbackCategory.OTHER}>✨ 其他</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300 text-sm font-medium">标题</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="简要概括您的问题或建议"
                        {...field}
                        className="bg-slate-950/50 border-slate-800 text-slate-200 h-11 focus:ring-blue-500/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300 text-sm font-medium">联系邮箱 (选填)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="方便我们向您反馈处理进展"
                        {...field}
                        className="bg-slate-950/50 border-slate-800 text-slate-200 h-11 focus:ring-blue-500/20"
                      />
                    </FormControl>
                    <FormDescription className="text-slate-500 text-[11px]">
                      如果您已登录，我们将优先使用您的账号邮箱。
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300 text-sm font-medium">详细描述</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="请尽可能详细地描述您的问题，以便我们更好地为您提供帮助..."
                        className="min-h-[120px] bg-slate-950/50 border-slate-800 text-slate-200 focus:ring-blue-500/20 p-3 leading-relaxed"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4 gap-3 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="text-slate-400 hover:text-white hover:bg-slate-800 flex-1 sm:flex-none"
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 h-11 font-semibold shadow-lg shadow-blue-900/20 flex-1 sm:flex-none transition-all active:scale-95"
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                发送反馈
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}