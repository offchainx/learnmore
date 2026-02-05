'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FeedbackCategory } from '@prisma/client';
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
import { submitFeedback } from '@/actions/support';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const feedbackSchema = z.object({
  category: z.nativeEnum(FeedbackCategory),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(10, 'Feedback must be at least 10 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
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
          title: 'Feedback submitted',
          description: "Thank you for your feedback! We've received it and will look into it.",
        });
        form.reset();
        onClose();
      } else {
        toast({
          title: 'Error',
          description: result.error as string || 'Failed to submit feedback',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            Share your feedback
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Have a suggestion or found a bug? Let us know!
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-950 border-slate-800 text-white">
                      <SelectItem value={FeedbackCategory.BUG}>Bug Report</SelectItem>
                      <SelectItem value={FeedbackCategory.SUGGESTION}>Suggestion</SelectItem>
                      <SelectItem value={FeedbackCategory.FEATURE}>Feature Request</SelectItem>
                      <SelectItem value={FeedbackCategory.CONTENT_ISSUE}>Content Issue</SelectItem>
                      <SelectItem value={FeedbackCategory.BILLING}>Billing</SelectItem>
                      <SelectItem value={FeedbackCategory.OTHER}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Summary of your feedback"
                      {...field}
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Email (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="For us to follow up if needed"
                      {...field}
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                  </FormControl>
                  <FormDescription className="text-slate-500 text-xs">
                    If you are logged in, we will use your account email.
                  </FormDescription>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us more..."
                      className="min-h-[120px] bg-slate-950 border-slate-800 text-white"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="text-slate-400 hover:text-white hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Feedback
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
