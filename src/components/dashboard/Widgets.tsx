import React, { useState, useEffect } from 'react'
// ⚠️ 暂时禁用 Gemini API (Issue-002)
// import { GoogleGenAI } from "@google/genai";
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Sparkles, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

// --- Shared Helper Components ---

export const SidebarItem = ({
  icon: Icon,
  label,
  active = false,
  indent = false,
  onClick,
}: {
  icon: React.ElementType
  label: string
  active?: boolean
  indent?: boolean
  onClick?: () => void
}) => (
  <button
    onClick={onClick}
    className={cn(
      `group relative flex w-full items-center overflow-hidden rounded-2xl py-3 text-sm font-medium transition-all duration-200 ${
        active
          ? 'border border-blue-200/80 bg-[linear-gradient(135deg,rgba(239,246,255,0.96),rgba(219,234,254,0.82))] text-blue-700 shadow-surface dark:border-blue-400/20 dark:bg-surface-selected dark:text-white'
          : 'border border-transparent text-text-secondary hover:border-borderTone hover:bg-surface-subtle hover:text-text-primary dark:text-text-secondary dark:hover:border-borderTone dark:hover:bg-surface-subtle dark:hover:text-white'
      }`,
      indent ? 'pl-10 pr-4' : 'px-4'
    )}
  >
    {active && (
      <div className="absolute inset-y-2 left-2 w-1 rounded-full bg-blue-500 dark:bg-cyan-300" />
    )}
    <div className="relative z-10 mr-3 flex h-5 w-5 shrink-0 items-center justify-center">
      <Icon
        className={`h-full w-full ${active ? 'text-blue-600 dark:text-cyan-300' : 'text-text-tertiary group-hover:text-text-primary dark:text-text-tertiary dark:group-hover:text-white'}`}
      />
    </div>
    <span className="relative z-10">{label}</span>
  </button>
)

export const SubjectCard = ({
  name,
  icon: Icon,
  color,
  bgGradient,
}: {
  name: string
  icon: React.ElementType
  color: string
  bgGradient: string
}) => (
  <Card className="group relative flex h-32 cursor-pointer flex-col justify-between overflow-hidden border-borderTone bg-surface p-5 shadow-surface transition-all duration-300 hover:-translate-y-1 hover:border-blue-200/70 hover:bg-surface-subtle">
    <div
      className={`absolute right-0 top-0 h-24 w-24 bg-gradient-to-br ${bgGradient} rounded-bl-full opacity-10 transition-opacity group-hover:opacity-20`}
    />
    <div
      className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-surface-subtle ${color} ring-1 ring-borderTone transition-all group-hover:ring-blue-200/70`}
    >
      <Icon className="h-5 w-5" />
    </div>
    <div className="relative z-10">
      <h3 className="text-base font-bold tracking-tight text-text-primary dark:text-white">
        {name}
      </h3>
      <p className="mt-1 flex items-center gap-1 text-xs text-text-secondary">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
        85% Complete
      </p>
    </div>
  </Card>
)

export const CircularProgress = ({
  value,
  color,
  label,
  subLabel,
}: {
  value: number
  color: string
  label: string
  subLabel: string
}) => {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (value / 100) * circumference

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative h-32 w-32">
        <svg
          className="h-full w-full -rotate-90 transform"
          viewBox="0 0 128 128"
        >
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-slate-200 dark:text-slate-700/50"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={color}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold leading-none text-text-primary dark:text-white">
            {value}
          </span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className="text-sm font-bold text-text-primary dark:text-slate-200">
          {label}
        </p>
        <p className="text-xs text-text-secondary">{subLabel}</p>
      </div>
    </div>
  )
}

export const StrengthBar = ({
  label,
  value,
  level,
  levelColor,
  suggestion,
}: {
  label: string
  value: number
  level: string
  levelColor: string
  suggestion?: string
}) => (
  <div className="mb-6 last:mb-0">
    <div className="mb-2 flex items-end justify-between">
      <span className="text-sm font-bold text-text-primary dark:text-slate-200">
        {label}
      </span>
      <div className="flex items-center gap-3">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${levelColor} text-white`}
        >
          {level}
        </span>
        <span className="w-8 text-right text-sm font-bold text-text-secondary dark:text-slate-400">
          {value}%
        </span>
      </div>
    </div>
    <div className="mb-1 h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-700/50">
      <div
        className={`h-2.5 rounded-full transition-all duration-1000 ${value >= 90 ? 'bg-emerald-500' : value >= 75 ? 'bg-blue-500' : value >= 60 ? 'bg-yellow-500' : 'bg-orange-500'}`}
        style={{ width: `${value}%` }}
      ></div>
    </div>
    {suggestion && (
      <p className="mt-1 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-300">
        ↑ {suggestion}
      </p>
    )}
  </div>
)

const MOTIVATIONAL_QUOTES = {
  en: [
    'The only way to do great work is to love what you do.',
    "Believe you can and you're halfway there.",
    'Success is the sum of small efforts, repeated day in and day out.',
  ],
  zh: [
    '做伟大的工作，唯一的方法就是热爱你所做的事情。',
    '相信你自己，你已经成功了一半。',
    '成功是每天重复不断的微小努力的总和。',
  ],
  ms: [
    'Satu-satunya cara untuk melakukan kerja yang hebat adalah dengan mencintai apa yang anda lakukan.',
    'Percaya anda boleh dan anda sudah separuh jalan ke sana.',
    'Kejayaan adalah jumlah usaha kecil, berulang hari demi hari.',
  ],
}

export const DailyInspiration = ({
  lang,
  t,
  welcomeTitle,
  welcomeSub,
  className,
}: {
  lang: string
  t: {
    dashboard?: { dailyVibe?: string }
    common?: { loading?: string; search?: string }
  }
  welcomeTitle: string
  welcomeSub: string
  className?: string
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [quote, setQuote] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const copy = (zh: string, en: string) => (lang.startsWith('zh') ? zh : en)

  const getQuote = React.useCallback(() => {
    const quotesList =
      MOTIVATIONAL_QUOTES[lang as keyof typeof MOTIVATIONAL_QUOTES] ||
      MOTIVATIONAL_QUOTES.en
    return quotesList[Math.floor(Math.random() * quotesList.length)]
  }, [lang])

  const generateInspiration = React.useCallback(async () => {
    if (loading) return
    setLoading(true)
    const randomQuote = getQuote()
    setQuote(randomQuote)

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
      ]
      const randomImage =
        placeholderImages[Math.floor(Math.random() * placeholderImages.length)]

      setImageUrl(randomImage)
      const today = new Date().toDateString()
      localStorage.setItem('daily_inspiration_date', today)
      localStorage.setItem('daily_inspiration_image', randomImage)
      localStorage.setItem(`daily_inspiration_quote_${lang}`, randomQuote)
    } catch (error) {
      console.error('Failed to generate inspiration image', error)
      setQuote('Keep pushing forward!')
    } finally {
      setLoading(false)
    }
  }, [lang, loading, getQuote])

  useEffect(() => {
    const today = new Date().toDateString()
    const storedDate = localStorage.getItem('daily_inspiration_date')
    const storedImage = localStorage.getItem('daily_inspiration_image')
    const storedQuote = localStorage.getItem(`daily_inspiration_quote_${lang}`)

    if (storedDate === today && storedImage) {
      setImageUrl(storedImage)
      setQuote(storedQuote || getQuote())
    } else {
      generateInspiration()
    }
  }, [lang, generateInspiration, getQuote])

  return (
    <div
      className={`group relative w-full overflow-hidden rounded-[28px] border border-borderTone bg-[linear-gradient(180deg,hsl(var(--surface-default))_0%,hsl(var(--surface-muted))_100%)] shadow-surface-lg dark:border-borderTone dark:bg-[linear-gradient(180deg,hsl(var(--surface-default))_0%,hsl(var(--surface-muted))_100%)] dark:shadow-[0_18px_48px_rgba(2,8,23,0.28)] ${className || 'h-56 sm:h-64'}`}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Daily Inspiration"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.45),transparent_30%),linear-gradient(135deg,#2563eb,#0f172a)]"></div>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent"></div>
      <div className="from-white/92 absolute inset-0 bg-gradient-to-t via-white/50 to-transparent"></div>
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 sm:p-5">
        <div>
          <div className="bg-white/78 inline-flex items-center gap-2 rounded-full border border-white/70 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-700 backdrop-blur-md">
            <Sparkles className="h-3 w-3 text-sky-500" />
            {t.dashboard?.dailyVibe || copy('今日灵感', 'Daily Vibe')}
          </div>
          <h1 className="mt-3 text-lg font-semibold tracking-tight text-slate-900 sm:text-[20px]">
            {welcomeTitle}
          </h1>
          <p className="mt-1.5 max-w-lg text-[12px] font-medium leading-5 text-slate-700 sm:text-[13px]">
            {welcomeSub}
          </p>
        </div>
        <div className="flex items-end justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-sm italic leading-6 text-slate-800 sm:text-[15px]">
              &quot;{quote}&quot;
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={generateInspiration}
            disabled={loading}
            className="bg-white/78 shrink-0 rounded-2xl border border-white/70 px-3 text-[11px] font-semibold text-slate-700 backdrop-blur-sm hover:bg-white hover:text-slate-900"
          >
            <RefreshCw
              className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
            />
            {loading
              ? t.common?.loading || copy('加载中', 'Loading...')
              : copy('换一张', 'Refresh')}
          </Button>
        </div>
      </div>
    </div>
  )
}
