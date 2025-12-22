'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, X, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useApp } from '@/providers/app-provider'; // Assume we might put token balance in global context later, but for now local is fine
import { toast } from '@/components/ui/use-toast';

interface AiTutorButtonProps {
  questionId: string;
  userAnswer: any;
  tokenBalance?: number; // Optional initial balance
  onTokenUsed?: () => void;
}

export const AiTutorButton: React.FC<AiTutorButtonProps> = ({ questionId, userAnswer, tokenBalance: initialBalance, onTokenUsed }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  
  // Note: For real-time balance updates, we'd ideally use a server action or context.
  // Here we just handle the UI interaction.

  const handleAskAi = async () => {
    setIsOpen(true);
    if (response) return; // Already asked

    setLoading(true);
    setResponse('');

    try {
      const res = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, wrongAnswer: userAnswer }),
      });

      if (res.status === 403) {
        toast({
          title: "Insufficient AI Tokens",
          description: "Please upgrade your plan to use more AI features.",
          variant: "destructive"
        });
        setIsOpen(false);
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error(res.statusText);
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value, { stream: true });
        setResponse((prev) => prev + chunkValue);
      }
      
      if (onTokenUsed) onTokenUsed();

    } catch (error) {
      console.error(error);
      toast({
         title: "Error",
         description: "Failed to get AI explanation. Please try again.",
         variant: "destructive"
      });
      setResponse("Sorry, I couldn't generate an explanation at this time.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      {!isOpen ? (
        <Button 
          size="sm" 
          variant="outline" 
          className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 hover:from-indigo-500/20 hover:to-purple-500/20"
          onClick={handleAskAi}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Ask AI Tutor
        </Button>
      ) : (
        <div className="w-full min-w-[300px] max-w-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-xl shadow-lg p-4 mt-2 animate-in fade-in zoom-in-95 duration-200">
           <div className="flex justify-between items-start mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                 <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                 </div>
                 <span className="font-bold text-sm text-slate-800 dark:text-slate-200">AI Tutor</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                 <X className="w-4 h-4" />
              </button>
           </div>
           
           <div className="prose prose-sm dark:prose-invert max-w-none max-h-60 overflow-y-auto custom-scrollbar">
              {loading && !response && (
                  <div className="flex items-center gap-2 text-slate-500 py-4">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Thinking...</span>
                  </div>
              )}
              <ReactMarkdown
                 remarkPlugins={[remarkMath]}
                 rehypePlugins={[rehypeKatex]}
              >
                 {response}
              </ReactMarkdown>
           </div>
        </div>
      )}
    </div>
  );
};
