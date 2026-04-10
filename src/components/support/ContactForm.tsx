'use client';

import React, { useRef, useState } from 'react';
import { Loader2, Mail, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FeedbackCategory } from '@/types/feedback';
import { submitFeedback } from '@/actions/support/ticket';

type ContactStatus = {
  kind: 'idle' | 'success' | 'warning' | 'error';
  message: string;
};

const initialStatus: ContactStatus = {
  kind: 'idle',
  message: '',
};

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<ContactStatus>(initialStatus);

  const resetStatus = () => {
    setStatus(initialStatus);
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = formRef.current;
    if (!form) return;

    if (!form.reportValidity()) {
      return;
    }

    if (isSubmitting) {
      return;
    }

    const formData = new FormData(form);
    const fullName = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const subject = String(formData.get('subject') || '').trim();
    const message = String(formData.get('message') || '').trim();

    if (!subject || subject.length < 2) {
      setStatus({
        kind: 'error',
        message: 'Please provide a subject for your message.',
      });
      return;
    }

    if (!message || message.length < 5) {
      setStatus({
        kind: 'error',
        message: 'Please provide a bit more detail about your request.',
      });
      return;
    }

    setIsSubmitting(true);
    resetStatus();

    try {
      const result = await submitFeedback({
        category: FeedbackCategory.OTHER,
        title: subject,
        content: [
          fullName ? `Name: ${fullName}` : null,
          `Message:\n${message}`,
        ]
          .filter(Boolean)
          .join('\n\n'),
        email,
        sourceType: 'contact-page',
        sourcePath: '/contact',
      });

      if (result.success) {
        form.reset();
        setStatus({
          kind: result.deduplicated ? 'warning' : 'success',
          message: result.deduplicated
            ? 'We already received this message and kept the original request on file.'
            : 'Thanks, your message has been sent. We will get back to you soon.',
        });
        return;
      }

      setStatus({
        kind: 'error',
        message: result.error || 'We could not submit your message right now.',
      });
    } catch {
      setStatus({
        kind: 'error',
        message: 'We could not submit your message right now.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-white/10 bg-[#0a0a0a] p-8 shadow-2xl"
    >
      <div className="flex items-start gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 text-left">
        <div className="mt-0.5 rounded-xl bg-blue-500/10 p-2 text-blue-400">
          <Mail className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-semibold text-white">Send us a message</p>
          <p className="text-sm text-slate-400">
            Use this form for support requests, partnership questions, or billing help.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Name</label>
          <Input
            name="name"
            placeholder="Jane Doe"
            className="bg-[#111] border-white/10 focus:border-blue-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Email</label>
          <Input
            name="email"
            type="email"
            placeholder="jane@example.com"
            className="bg-[#111] border-white/10 focus:border-blue-500"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Subject</label>
        <Input
          name="subject"
          placeholder="How can we help?"
          className="bg-[#111] border-white/10 focus:border-blue-500"
          required
          minLength={2}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Message</label>
        <Textarea
          name="message"
          placeholder="Tell us a little more about what you need."
          className="min-h-[140px] bg-[#111] border-white/10 focus:border-blue-500"
          required
          minLength={5}
        />
      </div>

      {status.kind !== 'idle' ? (
        <div
          role={status.kind === 'error' ? 'alert' : 'status'}
          aria-live="polite"
          className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
            status.kind === 'error'
              ? 'border-red-500/30 bg-red-500/10 text-red-200'
              : status.kind === 'warning'
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-100'
                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
          }`}
        >
          {status.kind === 'error' ? (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span>{status.message}</span>
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white h-12"
      >
        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isSubmitting ? 'Sending...' : 'Send message'}
      </Button>
    </form>
  );
}
