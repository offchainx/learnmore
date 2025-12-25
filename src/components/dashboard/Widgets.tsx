
import React, { useState, useEffect } from 'react';
// ⚠️ 暂时禁用 Gemini API (Issue-002)
// import { GoogleGenAI } from "@google/genai";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, RefreshCw } from 'lucide-react';

// --- Shared Helper Components ---

export const SidebarItem = ({ icon: Icon, label, active = false, onClick }: { icon: React.ElementType, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200 group relative overflow-hidden ${
      active 
        ? 'text-blue-600 dark:text-white bg-blue-50 dark:bg-slate-800' 
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
    }`}
  >
    {active && (
      <div className="absolute inset-0 border-l-4 border-blue-500 bg-gradient-to-r from-blue-100/50 to-transparent dark:from-blue-600/10 dark:to-transparent" />
    )}
    <div className="flex items-center justify-center w-5 h-5 mr-3 relative z-10 shrink-0">
      <Icon className={`w-full h-full ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`} />
    </div>
    <span className="relative z-10">{label}</span>
  </button>
);

export const SubjectCard = ({ name, icon: Icon, color, bgGradient }: { name: string, icon: React.ElementType, color: string, bgGradient: string }) => (
  <Card className="border-none bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden h-32 flex flex-col justify-between p-5 shadow-sm hover:shadow-lg dark:shadow-black/20 border border-slate-200 dark:border-transparent">
    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${bgGradient} opacity-10 rounded-bl-full group-hover:opacity-20 transition-opacity`} />
    <div className={`relative z-10 w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center ${color} ring-1 ring-slate-200 dark:ring-white/5 group-hover:ring-slate-300 dark:group-hover:ring-white/10 transition-all`}>
      <Icon className="h-5 w-5" />
    </div>
    <div className="relative z-10">
      <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">{name}</h3>
      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        85% Complete
      </p>
    </div>
  </Card>
);

export const CircularProgress = ({ value, color, label, subLabel }: { value: number, color: string, label: string, subLabel: string }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200 dark:text-slate-700/50" />
          <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className={color} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
           <span className="text-3xl font-bold text-slate-900 dark:text-white leading-none">{value}</span>
        </div>
      </div>
      <div className="text-center mt-2">
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{label}</p>
        <p className="text-xs text-slate-400">{subLabel}</p>
      </div>
    </div>
  );
};

export const StrengthBar = ({ label, value, level, levelColor, suggestion }: { label: string, value: number, level: string, levelColor: string, suggestion?: string }) => (
  <div className="mb-6 last:mb-0">
    <div className="flex justify-between items-end mb-2">
      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{label}</span>
      <div className="flex items-center gap-3">
         <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${levelColor} text-white`}>{level}</span>
         <span className="text-sm font-bold text-slate-600 dark:text-slate-400 w-8 text-right">{value}%</span>
      </div>
    </div>
    <div className="w-full bg-slate-200 dark:bg-slate-700/50 rounded-full h-2.5 mb-1">
      <div className={`h-2.5 rounded-full transition-all duration-1000 ${value >= 90 ? 'bg-emerald-500' : value >= 75 ? 'bg-blue-500' : value >= 60 ? 'bg-yellow-500' : 'bg-orange-500'}`} style={{ width: `${value}%` }}></div>
    </div>
    {suggestion && <p className="text-xs text-orange-500 flex items-center gap-1 mt-1">↑ {suggestion}</p>}
  </div>
);

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
  ],
  ms: [
    "Satu-satunya cara untuk melakukan kerja yang hebat adalah dengan mencintai apa yang anda lakukan.",
    "Percaya anda boleh dan anda sudah separuh jalan ke sana.",
    "Kejayaan adalah jumlah usaha kecil, berulang hari demi hari."
  ]
};

export const DailyInspiration = ({ lang, t, welcomeTitle, welcomeSub, className }: { lang: string, t: { dashboard?: { dailyVibe?: string }, common?: { loading?: string, search?: string } }, welcomeTitle: string, welcomeSub: string, className?: string }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [quote, setQuote] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const getQuote = React.useCallback(() => {
    const quotesList = MOTIVATIONAL_QUOTES[lang as keyof typeof MOTIVATIONAL_QUOTES] || MOTIVATIONAL_QUOTES.en;
    return quotesList[Math.floor(Math.random() * quotesList.length)];
  }, [lang]);

  const generateInspiration = React.useCallback(async () => {
    if (loading) return;
    setLoading(true);
    const randomQuote = getQuote();
    setQuote(randomQuote);

    try {
      // ⚠️ 暂时禁用 Gemini AI 图片生成 (Issue-002)
      // 原因: 客户端无法安全调用 Gemini API，需要迁移到 Server Action
      // TODO: 在 Phase 6 UI 定稿后，创建 Server Action 来处理 AI 图片生成

      /* 原 Gemini API 代码:
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: `Generate a stunning, artistic, abstract or scenic background image that represents the feeling of this quote: "${randomQuote}". Style: Digital Art, Soft Lighting, Uplifting, Educational, Modern Vector or Watercolor. No text in the image.` }] },
        config: { imageConfig: { aspectRatio: '16:9' } }
      });
      let base64Image = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
         if (part.inlineData) {
            base64Image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
         }
      }
      */

      // 临时方案: 使用 Unsplash 占位符图片（教育主题）
      const placeholderImages = [
        'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=675&fit=crop', // 学习场景
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=675&fit=crop', // 笔记本
        'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&h=675&fit=crop', // 书籍
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&h=675&fit=crop', // 图书馆
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&h=675&fit=crop', // 书桌
      ];
      const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];

      setImageUrl(randomImage);
      const today = new Date().toDateString();
      localStorage.setItem('daily_inspiration_date', today);
      localStorage.setItem('daily_inspiration_image', randomImage);
      localStorage.setItem(`daily_inspiration_quote_${lang}`, randomQuote);
    } catch (error) {
      console.error("Failed to generate inspiration image", error);
      setQuote("Keep pushing forward!");
    } finally {
      setLoading(false);
    }
  }, [lang, loading, getQuote]);

  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('daily_inspiration_date');
    const storedImage = localStorage.getItem('daily_inspiration_image');
    const storedQuote = localStorage.getItem(`daily_inspiration_quote_${lang}`);

    if (storedDate === today && storedImage) {
      setImageUrl(storedImage);
      setQuote(storedQuote || getQuote());
    } else {
      generateInspiration();
    }
  }, [lang, generateInspiration, getQuote]);

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden shadow-2xl group animate-fade-in-up border border-slate-200 dark:border-slate-700/50 bg-slate-100 dark:bg-slate-800 ${className || 'h-56 sm:h-64'}`}>
      {imageUrl ? (
        <img src={imageUrl} alt="Daily Inspiration" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
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
                {t.dashboard?.dailyVibe || 'Daily Vibe'}
             </div>
             <p className="text-base sm:text-lg font-medium text-white leading-relaxed italic drop-shadow-lg line-clamp-2">&quot;{quote}&quot;</p>
          </div>
          <Button variant="ghost" size="sm" onClick={generateInspiration} disabled={loading} className="text-white/80 hover:text-white hover:bg-white/20 shrink-0 border border-white/20 backdrop-blur-sm">
             <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
             {loading ? (t.common?.loading || 'Loading...') : (t.common?.search || 'Regenerate')}
          </Button>
        </div>
      </div>
    </div>
  );
};
