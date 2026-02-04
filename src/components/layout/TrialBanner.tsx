"use client";

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TrialBannerProps {
  subscriptionEnd: Date | string | null;
  subscriptionTier: string | null;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({ subscriptionEnd, subscriptionTier }) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!subscriptionEnd || subscriptionTier !== 'STANDARD') {
      setTimeLeft(null);
      return;
    }

    const endTime = new Date(subscriptionEnd).getTime();
    
    const calculateTimeLeft = () => {
      const now = Date.now();
      const difference = endTime - now;
      return difference > 0 ? difference : 0;
    };

    const initial = calculateTimeLeft();
    setTimeLeft(initial);

    // If more than 24h, we don't need a frequent timer yet, but let's keep it simple
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      // If expired, clear timer
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [subscriptionEnd, subscriptionTier]);

  // Only show if < 24 hours remaining
  if (timeLeft === null || timeLeft > 24 * 60 * 60 * 1000 || timeLeft <= 0) {
    return null;
  }

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <div className="bg-red-600 text-white px-4 py-2.5 flex flex-col sm:flex-row items-center justify-center gap-3 animate-in fade-in slide-in-from-top duration-500 z-[100] relative">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-red-100 animate-pulse flex-shrink-0" />
        <p className="text-sm font-semibold">
          您的标准版试用期即将结束
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
          <Clock className="w-3.5 h-3.5 text-red-200" />
          <span className="font-mono text-sm font-bold tabular-nums">
            {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
        
        <button 
          onClick={() => router.push('/pricing')}
          className="group flex items-center gap-1.5 px-4 py-1 bg-white text-red-600 rounded-full text-xs font-bold hover:bg-red-50 transition-all shadow-sm"
        >
          立即续费
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
