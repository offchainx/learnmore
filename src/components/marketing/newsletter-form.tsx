'use client';

import React, { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { LabeledInput as Input } from '@/components/ui/labeled-input';
import { subscribeToNewsletter } from '@/actions/marketing';
import { Mail } from 'lucide-react';

interface NewsletterFormProps {
  content: {
    title: string;
    desc: string;
    placeholder: string;
    btn: string;
    note: string;
  };
}

const initialState = {
  success: false,
  message: '',
};

export function NewsletterForm({ content }: NewsletterFormProps) {
  const [state, action, isPending] = useActionState(subscribeToNewsletter, initialState);

  return (
    <div className="bg-gradient-to-br from-blue-900/20 to-slate-900/20 border border-slate-800 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>

      <div className="relative z-10">
        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-700 shadow-xl transform rotate-3">
          <Mail className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-3xl font-serif text-white mb-4">{content.title}</h2>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">{content.desc}</p>

        <form action={action} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              name="email"
              placeholder={content.placeholder}
              className="bg-slate-950 border-slate-700 text-white h-12 w-full"
              required
            />
          </div>
          <Button variant="glow" size="lg" className="h-12 px-8" disabled={isPending}>
            {isPending ? '...' : content.btn}
          </Button>
        </form>
        
        {state?.message && (
          <p className={`text-sm mt-4 ${state.success ? 'text-green-400' : 'text-red-400'}`}>
            {state.message}
          </p>
        )}
        
        <p className="text-xs text-slate-600 mt-4">{content.note}</p>
      </div>
    </div>
  );
}
