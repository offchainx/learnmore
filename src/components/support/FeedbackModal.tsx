'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usePathname } from 'next/navigation';
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
import { createClient } from '@/lib/supabase/client';
import { useApp } from '@/providers';

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
  sourceType?: 'floating-widget' | 'help-page';
  viewerEmail?: string | null;
}

export function FeedbackModal({
  isOpen,
  onClose,
  defaultCategory = FeedbackCategory.SUGGESTION,
  sourceType = 'floating-widget',
  viewerEmail = null,
}: FeedbackModalProps) {
  const initialViewerEmail = viewerEmail?.trim() ?? '';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountEmail, setAccountEmail] = useState(initialViewerEmail);
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(initialViewerEmail)
  );
  const { toast } = useToast();
  const pathname = usePathname();
  const { t } = useApp();
  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      category: defaultCategory,
      title: '',
      content: '',
      email: '',
    },
  });

  useEffect(() => {
    let isCancelled = false;

    const hydrateViewer = async () => {
      if (!isOpen) return;

      if (initialViewerEmail) {
        if (isCancelled) return;

        setAccountEmail(initialViewerEmail);
        setIsAuthenticated(true);
        form.reset({
          category: defaultCategory,
          title: '',
          content: '',
          email: initialViewerEmail,
        });
        return;
      }

      if (!isOpen || !supabase) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (isCancelled) return;

      const email = user?.email ?? '';
      setAccountEmail(email);
      setIsAuthenticated(Boolean(user));

      form.reset({
        category: defaultCategory,
        title: '',
        content: '',
        email,
      });
    };

    void hydrateViewer();

    if (!isOpen) {
      setAccountEmail(initialViewerEmail);
      setIsAuthenticated(Boolean(initialViewerEmail));
      form.reset({
        category: defaultCategory,
        title: '',
        content: '',
        email: initialViewerEmail,
      });
    }

    return () => {
      isCancelled = true;
    };
  }, [defaultCategory, form, initialViewerEmail, isOpen, supabase]);

  const handleClose = () => {
    form.reset({
      category: defaultCategory,
      title: '',
      content: '',
      email: accountEmail,
    });
    onClose();
  };

  async function onSubmit(values: FeedbackFormValues) {
    setIsSubmitting(true);
    try {
      const result = await submitFeedback({
        category: values.category,
        title: values.title,
        content: values.content,
        email: values.email || undefined,
        sourceType,
        sourcePath: pathname || undefined,
      });

	      if (result.success) {
        toast({
          title: t.support.successTitle,
          description: t.support.successDescription,
        });
        handleClose();
      } else {
        toast({
          title: t.support.errorTitle,
          description: result.error as string || t.support.errorFallback,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: t.support.unknownErrorTitle,
        description: t.support.unknownErrorDescription,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px] bg-[#0f172a] border-slate-800 text-white shadow-2xl p-0 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
        
        <DialogHeader className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
               <Sparkles className="h-5 w-5" />
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight">
              {t.support.modalTitle}
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-400">
            {t.support.modalDescription}
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
                    <FormLabel className="text-slate-300 text-sm font-medium">{t.support.categoryLabel}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-950/50 border-slate-800 text-slate-200 h-11">
                          <SelectValue placeholder={t.support.categoryPlaceholder} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        <SelectItem value={FeedbackCategory.BUG}>🐞 {t.support.categories.bug}</SelectItem>
                        <SelectItem value={FeedbackCategory.SUGGESTION}>💡 {t.support.categories.suggestion}</SelectItem>
                        <SelectItem value={FeedbackCategory.CONTENT_ISSUE}>📖 {t.support.categories.contentIssue}</SelectItem>
                        <SelectItem value={FeedbackCategory.BILLING}>💳 {t.support.categories.billing}</SelectItem>
                        <SelectItem value={FeedbackCategory.OTHER}>✨ {t.support.categories.other}</SelectItem>
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
                    <FormLabel className="text-slate-300 text-sm font-medium">{t.support.titleLabel}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t.support.titlePlaceholder}
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
                    <FormLabel className="text-slate-300 text-sm font-medium">
                      {isAuthenticated
                        ? t.support.emailLabelAuthenticated
                        : t.support.emailLabelGuest}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          isAuthenticated
                            ? t.support.emailPlaceholderAuthenticated
                            : t.support.emailPlaceholderGuest
                        }
                        {...field}
                        disabled={isAuthenticated}
                        className="bg-slate-950/50 border-slate-800 text-slate-200 h-11 focus:ring-blue-500/20"
                      />
                    </FormControl>
                    <FormDescription className="text-slate-500 text-[11px]">
                      {isAuthenticated
                        ? `${t.support.emailHintAuthenticated}${accountEmail ? ` ${accountEmail}` : ''}`
                        : t.support.emailHintGuest}
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
                    <FormLabel className="text-slate-300 text-sm font-medium">{t.support.contentLabel}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t.support.contentPlaceholder}
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
                onClick={handleClose}
                className="text-slate-400 hover:text-white hover:bg-slate-800 flex-1 sm:flex-none"
              >
                {t.common.cancel || t.support.cancel}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 h-11 font-semibold shadow-lg shadow-blue-900/20 flex-1 sm:flex-none transition-all active:scale-95"
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {t.support.submit}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
