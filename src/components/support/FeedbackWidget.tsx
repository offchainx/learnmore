'use client';

import React, { useState } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { FeedbackModal } from './FeedbackModal';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[90]">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 md:h-12 md:w-12"
              >
                <MessageSquarePlus className="h-6 w-6" />
                
                {/* Ping animation effect */}
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-20 group-hover:hidden"></span>
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-slate-800 border-slate-700 text-white">
              <p>Give feedback</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <FeedbackModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}
