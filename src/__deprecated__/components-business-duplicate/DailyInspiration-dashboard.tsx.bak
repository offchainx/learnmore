/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw } from 'lucide-react';

const MOTIVATIONAL_QUOTES = {
  en: [
    "The only way to do great work is to love what you do.",
    "Believe you can and you're halfway there.",
    "Success is the sum of small efforts, repeated day in and day out."
  ],
  zh: [
    "做伟大的工作，唯一的方法就是热爱你所做的事情。",
    "相信你自己，你已经成功了一半。",
    "成功是每天重复不断的微小努力的总和。"
  ]
};

// Mock images to avoid API key requirement for now
const MOCK_IMAGES = [
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=2574&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2674&auto=format&fit=crop"
];

interface DailyInspirationProps {
  lang: 'en' | 'zh';
  t: Record<string, unknown>;
  welcomeTitle: string;
  welcomeSub: string;
}

export const DailyInspiration: React.FC<DailyInspirationProps> = ({ lang, t, welcomeTitle, welcomeSub }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [quote, setQuote] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const generateInspiration = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const quotesList = MOTIVATIONAL_QUOTES[lang];
    const randomQuote = quotesList[Math.floor(Math.random() * quotesList.length)];
    const randomImage = MOCK_IMAGES[Math.floor(Math.random() * MOCK_IMAGES.length)];
    
    setQuote(randomQuote);
    setImageUrl(randomImage);
    setLoading(false);
  }, [lang, loading]);

  useEffect(() => {
    // Initial load - execute only once when lang changes, but we need to avoid infinite loop if we depend on generateInspiration which depends on loading
    // Hack: we only want to run this on mount or lang change.
    const init = async () => {
        const quotesList = MOTIVATIONAL_QUOTES[lang];
        const randomQuote = quotesList[Math.floor(Math.random() * quotesList.length)];
        const randomImage = MOCK_IMAGES[Math.floor(Math.random() * MOCK_IMAGES.length)];
        setQuote(randomQuote);
        setImageUrl(randomImage);
    };
    init();
  }, [lang]);

  return (
    <div className="relative w-full h-56 sm:h-64 rounded-3xl overflow-hidden shadow-2xl group animate-fade-in-up border border-slate-200 dark:border-slate-700/50 bg-slate-100 dark:bg-slate-800">
      {imageUrl ? (
        <Image 
          src={imageUrl} 
          alt="Daily Inspiration" 
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 animate-pulse"></div>
      )}
      <div className="absolute inset-0 bg-black/10 mix-blend-multiply"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
      <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
        <div>
           <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-lg">{welcomeTitle}</h1>
           <p className="text-white/90 mt-1 text-sm font-medium drop-shadow-md max-w-lg">{welcomeSub}</p>
        </div>
        <div className="flex justify-between items-end gap-4">
          <div className="max-w-3xl">
             <div className="flex items-center gap-2 mb-1 text-yellow-300 font-bold text-[10px] sm:text-xs uppercase tracking-widest drop-shadow-md">
                <Sparkles className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                {t.dailyInspiration}
             </div>
             <p className="text-base sm:text-lg font-medium text-white leading-relaxed italic drop-shadow-lg line-clamp-2">&quot;{quote}&quot;</p>
          </div>
          <Button variant="ghost" size="sm" onClick={generateInspiration} disabled={loading} className="text-white/80 hover:text-white hover:bg-white/20 shrink-0 border border-white/20 backdrop-blur-sm">
             <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
             {loading ? t.generating : t.regenerate}
          </Button>
        </div>
      </div>
    </div>
  );
};