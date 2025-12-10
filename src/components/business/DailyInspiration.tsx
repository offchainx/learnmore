'use client';

import React, { useState, useEffect } from 'react';
// import { GoogleGenAI } from "@google/generative-ai"; // Install this package if needed
import { Button } from '@/components/ui/button';
import { RefreshCw, Sparkles } from 'lucide-react'; // Assuming Sparkles is used

type Lang = 'en' | 'zh';

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
  lang: Lang;
  t: any; // Translations object
  welcomeTitle: string;
  welcomeSub: string;
}

const DailyInspiration: React.FC<DailyInspirationProps> = ({ lang, t, welcomeTitle, welcomeSub }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [quote, setQuote] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Initialize with today's image or generate new
  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('daily_inspiration_date');
    const storedImage = localStorage.getItem('daily_inspiration_image');
    const storedQuote = localStorage.getItem(`daily_inspiration_quote_${lang}`);

    if (storedDate === today && storedImage) {
      setImageUrl(storedImage);
      setQuote(storedQuote || MOTIVATIONAL_QUOTES[lang][0]);
    } else {
      generateInspiration(); // Call generate Inspiration at start up
    }
  }, [lang]);

  const generateInspiration = async () => {
    if (loading) return;
    setLoading(true);
    
    // Pick a random quote
    const quotesList = MOTIVATIONAL_QUOTES[lang];
    const randomQuote = quotesList[Math.floor(Math.random() * quotesList.length)];
    setQuote(randomQuote);

    // --- Gemini AI Integration ---
    // This part requires GoogleGenAI setup and an API Key.
    // If you want this feature enabled, please:
    // 1. Install @google/generative-ai: pnpm add @google/generative-ai
    // 2. Configure NEXT_PUBLIC_GEMINI_API_KEY in your .env.local file.
    // 3. Uncomment the GoogleGenAI import and the AI generation logic below.
    try {
      if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not configured.");
      }
      // const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      // const response = await ai.models.generateContent({
      //   model: 'gemini-2.5-flash-image',
      //   contents: [{ 
      //     parts: [{ 
      //       text: `Generate a stunning, artistic, abstract or scenic background image that represents the feeling of this quote: "${randomQuote}". Style: Digital Art, Soft Lighting, Uplifting, Educational, Modern Vector or Watercolor. No text in the image.` 
      //     }],
      //   }],
      //   config: {
      //     imageConfig: { aspectRatio: '16:9' }
      //   }
      // });

      // let base64Image = null;
      // for (const part of response.candidates?.[0]?.content?.parts || []) {
      //    if (part.inlineData) {
      //       base64Image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      //       break;
      //    }
      // }

      // if (base64Image) {
      //   setImageUrl(base64Image);
      //   const today = new Date().toDateString();
      //   localStorage.setItem('daily_inspiration_date', today);
      //   localStorage.setItem('daily_inspiration_image', base64Image);
      //   localStorage.setItem(`daily_inspiration_quote_${lang}`, randomQuote);
      // } else {
      //   throw new Error("No image data received from AI.");
      // }
      throw new Error("Gemini AI integration is disabled. Please uncomment code to enable.");
    } catch (error: any) {
      console.error("Failed to generate inspiration image:", error.message);
      // Fallback if API fails or Key is missing
      setImageUrl(null); // Clear image if generation fails
      setQuote("Keep pushing forward! (AI image generation failed)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-64 sm:h-72 rounded-3xl overflow-hidden shadow-2xl group animate-fade-in-up border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-white/5">
      {/* Background Image */}
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt="Daily Inspiration" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 animate-pulse"></div>
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
             {loading ? (
                <div className="h-6 w-48 bg-white/20 rounded animate-pulse"></div>
             ) : (
                <p className="text-lg sm:text-xl font-medium text-white leading-relaxed italic drop-shadow-lg">"{quote}"</p>
             )}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={generateInspiration} 
            disabled={loading}
            className="text-white/80 hover:text-white hover:bg-white/20 shrink-0 border border-white/20 backdrop-blur-sm"
          >
             {loading ? (
               <RefreshCw className="w-4 h-4 animate-spin mr-2" />
             ) : (
               <RefreshCw className="w-4 h-4 mr-2" />
             )}
             {loading ? t.generating : t.regenerate}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DailyInspiration;
