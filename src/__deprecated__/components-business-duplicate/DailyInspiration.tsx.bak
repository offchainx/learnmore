'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, RefreshCw } from 'lucide-react';
import Image from 'next/image'; // Import Next.js Image component



const MOTIVATIONAL_QUOTES = {
  en: [
    "The only way to do great work is to love what you do.",
    "Believe you can and you're halfway there.",
    "Success is the sum of small efforts, repeated day in and day out.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "Don't watch the clock; do what it does. Keep going.",
    "Education is the passport to the future.",
    "Start where you are. Use what you have. Do what you can."
  ],
  zh: [
    "做伟大的工作，唯一的方法就是热爱你所做的事情。",
    "相信你自己，你已经成功了一半。",
    "成功是每天重复不断的微小努力的总和。",
    "未来属于那些相信梦想之美的人。",
    "不要盯着钟表；像它一样，继续前行。",
    "教育是通向未来的护照。",
    "从你所在的地方开始，用你所有的，做你能做的。"
  ]
};

interface DailyInspirationProps {
  lang: 'en' | 'zh';
  t: {
    generating: string;
    regenerate: string;
    dailyInspiration: string;
  };
  welcomeTitle: string;
  welcomeSub: string;
}

const DailyInspiration: React.FC<DailyInspirationProps> = ({ lang, t, welcomeTitle, welcomeSub }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [quote, setQuote] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const generateInspiration = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    setImageUrl(null);

    // Pick a random quote
    const quotesList = MOTIVATIONAL_QUOTES[lang];
    const randomQuote = quotesList[Math.floor(Math.random() * quotesList.length)];
    setQuote(randomQuote);

    try {
      if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not configured.");
      }
      
      // Temporarily disable actual AI generation for now to avoid blocking.
      // In a real scenario, this would call your /api/generate-image endpoint
      // or directly use the Gemini API.
      // For now, we will simulate loading and set a placeholder message.
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      setImageUrl('/placeholder-inspiration.jpg'); // Placeholder image

      const today = new Date().toDateString();
      localStorage.setItem('daily_inspiration_date', today);
      localStorage.setItem('daily_inspiration_image', '/placeholder-inspiration.jpg');
      localStorage.setItem(`daily_inspiration_quote_${lang}`, randomQuote);

    } catch (err: unknown) {
      console.error("Failed to generate inspiration image:", err);
      setImageUrl(null); // Clear image if generation fails
      setQuote("Keep pushing forward! (AI image generation failed)");
    } finally {
      setIsLoading(false);
    }
  }, [lang, isLoading]);

  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('daily_inspiration_date');
    const storedImage = localStorage.getItem('daily_inspiration_image');
    const storedQuote = localStorage.getItem(`daily_inspiration_quote_${lang}`);

    if (storedDate === today && storedImage) {
      setImageUrl(storedImage);
      setQuote(storedQuote || MOTIVATIONAL_QUOTES[lang][0]);
    } else {
      generateInspiration();
    }
  }, [lang, generateInspiration]);

  return (
    <div className="relative w-full h-64 sm:h-72 rounded-3xl overflow-hidden shadow-2xl group animate-fade-in-up border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-white/5">
      {/* Background Image */}
      {imageUrl && (
        <Image
          src={imageUrl}
          alt="Daily Inspiration"
          fill
          className="object-cover transition-opacity duration-500 rounded-2xl"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      )}      
      {/* Multiple Gradients for Text Readability */}
      <div className="absolute inset-0 bg-black/10 mix-blend-multiply"></div>
      {/* Top Gradient for Welcome Text */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-transparent"></div>
      {/* Bottom Gradient for Quote */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>

      {/* Content */}
      <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between z-10">
        
        {/* Top Section: Welcome Message */}
        <div>
           <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight drop-shadow-lg">{welcomeTitle}</h1>
           <p className="text-white/90 mt-2 text-sm sm:text-base font-medium drop-shadow-md max-w-lg">{welcomeSub}</p>
        </div>
        
        {/* Bottom Section: Quote & Action */}
        <div className="flex justify-between items-end gap-4">
          <div className="max-w-3xl">
             <div className="flex items-center gap-2 mb-2 text-yellow-300 font-bold text-[10px] sm:text-xs uppercase tracking-widest drop-shadow-md">
                <Sparkles className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                {t.dailyInspiration}
             </div>
             {isLoading ? (
                <div className="h-6 w-48 bg-white/20 rounded animate-pulse"></div>
             ) : (
                <p className="text-lg sm:text-xl font-medium text-white leading-relaxed italic drop-shadow-lg">{quote}</p>
             )}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={generateInspiration} 
            disabled={isLoading}
            className="text-white/80 hover:text-white hover:bg-white/20 shrink-0 border border-white/20 backdrop-blur-sm"
          >
             {isLoading ? (
               <Loader2 className="w-4 h-4 animate-spin mr-2" />
             ) : (
               <RefreshCw className="w-4 h-4 mr-2" />
             )}
             {isLoading ? t.generating : t.regenerate}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DailyInspiration;