'use client';

import React, { useState } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { FeedbackModal } from './FeedbackModal';
import { useApp } from '@/providers';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FeedbackWidgetProps {
  viewerEmail?: string | null
}

export function FeedbackWidget({ viewerEmail = null }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useApp();

  if (pathname === '/help') {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+5rem)] right-4 z-[90] tablet:bottom-6 tablet:right-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 md:h-14 md:w-14"
              >
                <MessageSquarePlus className="h-6 w-6" />
                
                <span className="pointer-events-none absolute inset-0 rounded-full bg-blue-400/0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"></span>
                <span className="pointer-events-none absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-0 group-hover:animate-ping group-hover:opacity-20 group-focus-visible:animate-ping group-focus-visible:opacity-20"></span>
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-slate-800 border-slate-700 text-white">
              <p>{t.support.widgetLabel}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <FeedbackModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        sourceType="floating-widget"
        viewerEmail={viewerEmail}
      />
    </>
  );
}
