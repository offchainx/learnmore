'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MarketingFullFooter } from '@/components/marketing/MarketingFullFooter'
import { MarketingNewsletterSection } from '@/components/marketing/MarketingNewsletterSection'
import { emitClientPerfEvent } from '@/lib/observability/perf'
import {
  Activity,
  BookOpen,
  Brain,
  ChevronRight,
  CircleCheck,
  CircleX,
  HelpCircle,
  Map,
  Quote,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import type { MarketingLocale } from '@/lib/marketing/site-shell'

type LandingCopy = Record<string, any>

interface LandingBelowFoldProps {
  t: LandingCopy
  onCtaClick: () => void
  locale: MarketingLocale
}

const testimonialImages = [
  'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop',
]

export function LandingBelowFold({ t, onCtaClick, locale }: LandingBelowFoldProps) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    emitClientPerfEvent('landing-below-fold-mounted', {
      route: '/',
      sections: ['pain-points', 'features', 'comparison', 'testimonials', 'cta', 'newsletter', 'footer'].length,
    })

    const interval = window.setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % 3)
    }, 5000)

    return () => window.clearInterval(interval)
  }, [])

  const testimonialCards = [
    { text: t.testimonials.t1, author: t.testimonials.t1Author, role: t.testimonials.t1Role, img: testimonialImages[0] },
    { text: t.testimonials.t2, author: t.testimonials.t2Author, role: t.testimonials.t2Role, img: testimonialImages[1] },
    { text: t.testimonials.t3, author: t.testimonials.t3Author, role: t.testimonials.t3Role, img: testimonialImages[2] },
  ]

  return (
    <>
      <section className="py-24 bg-slate-900/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.painPoints.title}</h2>
            <p className="text-slate-400 text-lg">{t.painPoints.subtitle}</p>
          </div>

          <div className="grid gap-8 desktop:grid-cols-3">
            {[
              { title: t.painPoints.card1Title, desc: t.painPoints.card1Desc, icon: Activity, color: 'text-red-400', bg: 'bg-red-400/10', border: 'hover:border-red-500/50' },
              { title: t.painPoints.card2Title, desc: t.painPoints.card2Desc, icon: Users, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'hover:border-orange-500/50' },
              { title: t.painPoints.card3Title, desc: t.painPoints.card3Desc, icon: Map, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'hover:border-blue-500/50' },
            ].map((card, i) => (
              <Card key={i} className={`bg-slate-950 border border-slate-800 transition-all hover:-translate-y-1 group ${card.border}`}>
                <CardContent className="p-8 h-full flex flex-col items-start">
                  <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <card.icon className={`w-7 h-7 ${card.color} group-hover:animate-bounce`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">
                    {card.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
          <div className="grid items-center gap-16 desktop:grid-cols-2">
            <div>
              <div className="inline-block text-blue-400 font-bold tracking-wider uppercase text-sm mb-2">{t.features.f1Tag}</div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">{t.features.f1Title}</h3>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">{t.features.f1Desc}</p>
              <ul className="space-y-4">
                {t.features.f1List.map((item: string) => (
                  <li key={item} className="flex items-center text-slate-300">
                    <CircleCheck className="w-5 h-5 text-blue-500 mr-3" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative flex h-[320px] items-center justify-center overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 p-6 group sm:h-[360px] sm:p-8 desktop:h-[400px]">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                <div className="flex gap-12 mb-12">
                  <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-red-500/50 flex items-center justify-center text-xs text-center p-1 text-slate-300 relative shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse-slow">
                    Quadratic Eq
                    <div className="absolute -bottom-12 left-1/2 w-0.5 h-12 bg-slate-700 origin-top animate-[growDown_1s_ease-out_forwards]"></div>
                  </div>
                </div>
                <div className="flex gap-8">
                  <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-yellow-500/50 flex items-center justify-center text-xs text-center p-1 text-slate-300 shadow-[0_0_20px_rgba(234,179,8,0.2)] animate-float" style={{ animationDelay: '0.5s' }}>
                    Factoring
                  </div>
                  <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-green-500/50 flex items-center justify-center text-xs text-center p-1 text-slate-300 shadow-[0_0_20px_rgba(34,197,94,0.2)] animate-float" style={{ animationDelay: '1s' }}>
                    Real Numbers
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid items-center gap-16 desktop:grid-cols-2">
            <div className="order-2 relative flex h-[320px] items-center justify-center rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 p-6 sm:h-[360px] sm:p-8 desktop:order-1 desktop:h-[400px]">
              <div className="relative w-64 h-64">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="absolute inset-0 border border-slate-600 rounded-full opacity-30" style={{ transform: `scale(${i * 0.33})` }} />
                ))}
                <div className="absolute inset-0 border-l border-r border-slate-600 opacity-20 rotate-45" />
                <div className="absolute inset-0 border-l border-r border-slate-600 opacity-20 -rotate-45" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full bg-emerald-500/20 border-2 border-emerald-500 rounded-lg transform rotate-12 scale-75 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-[pulse_3s_ease-in-out_infinite]" />
                </div>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-emerald-400">Algebra</div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-400">Geometry</div>
                <div className="absolute top-1/2 -left-12 -translate-y-1/2 text-xs font-bold text-slate-400">Calc</div>
                <div className="absolute top-1/2 -right-12 -translate-y-1/2 text-xs font-bold text-emerald-400">Stats</div>
              </div>
            </div>
            <div className="order-1 desktop:order-2">
              <div className="inline-block text-emerald-400 font-bold tracking-wider uppercase text-sm mb-2">{t.features.f2Tag}</div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">{t.features.f2Title}</h3>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">{t.features.f2Desc}</p>
              <Button variant="outline" className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10">
                {t.features.f2Button} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          <div className="grid items-center gap-16 desktop:grid-cols-2">
            <div>
              <div className="inline-block text-purple-400 font-bold tracking-wider uppercase text-sm mb-2">{t.features.f3Tag}</div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">{t.features.f3Title}</h3>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">{t.features.f3Desc}</p>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[
                    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=60',
                    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=60',
                    'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&auto=format&fit=crop&q=60',
                  ].map((img, i) => (
                    <Image
                      key={i}
                      src={img}
                      alt="Parent"
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full border-2 border-slate-950 object-cover"
                      loading="lazy"
                    />
                  ))}
                </div>
                <span className="text-sm text-slate-400 self-center">{t.features.f3Trusted}</span>
              </div>
            </div>
            <div className="relative flex h-[320px] items-center justify-center rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 p-6 sm:h-[360px] sm:p-8 desktop:h-[400px]">
              <div className="w-48 h-80 bg-black border-4 border-slate-700 rounded-3xl p-3 relative shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-20 bg-slate-800 rounded-b-xl z-20"></div>
                <div className="mt-8 space-y-3 relative z-10">
                  <div className="bg-slate-800 p-2 rounded-lg h-20 w-full animate-pulse opacity-50"></div>
                  <div className="bg-slate-800 p-3 rounded-xl border border-blue-500/30 relative overflow-hidden animate-[slideInRight_1s_ease-out_forwards] transform translate-x-full">
                    <div className="flex justify-between items-start mb-2">
                      <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center"><TrendingUp className="w-3 h-3 text-white" /></div>
                      <span className="text-[10px] text-slate-400">Now</span>
                    </div>
                    <div className="text-xs font-bold text-white mb-1">Weekly Report Ready</div>
                    <div className="text-[10px] text-slate-400">Alex mastered 12 new concepts in Math this week!</div>
                  </div>
                  <div className="bg-slate-800 p-2 rounded-lg h-12 w-full opacity-30"></div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-blue-900/20 z-0"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">{t.comparison.title}</h2>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl ring-1 ring-white/5">
            <div className="grid min-w-[720px] grid-cols-3 border-b border-slate-800 bg-slate-900/50 p-6 text-sm font-bold text-slate-300 md:text-base">
              <div className="col-span-1"></div>
              <div className="col-span-1 text-center opacity-50 text-xs md:text-sm uppercase tracking-wider">{t.comparison.col1}</div>
              <div className="col-span-1 text-center text-blue-400 flex items-center justify-center gap-2 text-xs md:text-sm uppercase tracking-wider">
                <Sparkles className="w-4 h-4 fill-blue-400 hidden md:block" /> {t.comparison.col2}
              </div>
            </div>

            {[
              { label: t.comparison.row1, bad: t.comparison.row1bad, good: t.comparison.row1good, icon: CircleX },
              { label: t.comparison.row2, bad: t.comparison.row2bad, good: t.comparison.row2good, icon: HelpCircle },
              { label: t.comparison.row3, bad: t.comparison.row3bad, good: t.comparison.row3good, icon: CircleX },
              { label: t.comparison.row4, bad: t.comparison.row4bad, good: t.comparison.row4good, icon: null },
            ].map((row, i) => (
              <div key={i} className={`grid min-w-[720px] grid-cols-3 items-center border-b border-slate-800/50 p-6 transition-colors hover:bg-white/5 last:border-none ${i % 2 === 1 ? 'bg-slate-900/20' : ''}`}>
                <div className="font-medium text-slate-300 text-sm md:text-base">{row.label}</div>
                <div className="text-center text-slate-500 flex flex-col items-center gap-1 opacity-70">
                  {row.icon && <row.icon className="w-5 h-5 text-red-900/50" />}
                  <span className={`text-xs md:text-sm ${!row.icon ? 'line-through font-mono' : ''}`}>{row.bad}</span>
                </div>
                <div className="text-center text-white flex flex-col items-center gap-1">
                  {row.icon ? <CircleCheck className="w-5 h-5 text-emerald-500" /> : <span className="text-xl font-bold text-emerald-400">$</span>}
                  <span className="text-xs md:text-sm font-bold text-emerald-100">{row.good}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 relative overflow-hidden bg-[#020617]">
        <div className="absolute inset-0 bg-blue-900/5 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-bold text-white mb-12">{t.testimonials.title}</h2>

          <div className="relative bg-slate-900/50 border border-slate-800 p-8 rounded-3xl backdrop-blur-sm min-h-[300px] flex flex-col justify-center items-center transition-all">
            <Quote className="w-10 h-10 text-blue-500/20 absolute top-6 left-6" />

            <div className="mb-8">
              <p className="text-xl md:text-2xl text-slate-200 font-medium leading-relaxed italic">
                &quot;{testimonialCards[currentTestimonial].text}&quot;
              </p>
            </div>

            <div className="flex items-center gap-4 animate-fade-in-up">
              <Image
                src={testimonialCards[currentTestimonial].img}
                alt={testimonialCards[currentTestimonial].author}
                width={56}
                height={56}
                className="w-14 h-14 rounded-full border-2 border-blue-500 object-cover"
                loading="lazy"
              />
              <div className="text-left">
                <div className="font-bold text-white text-lg">{testimonialCards[currentTestimonial].author}</div>
                <div className="text-sm text-blue-400 font-medium">{testimonialCards[currentTestimonial].role}</div>
              </div>
            </div>

            <div className="flex justify-center gap-2 mt-8">
              {testimonialCards.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentTestimonial(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${currentTestimonial === idx ? 'bg-blue-500 w-6' : 'bg-slate-700 hover:bg-slate-600'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">{t.cta.title}</h2>
          <Button size="xl" variant="glow" onClick={onCtaClick} type="button" className="px-12 py-6 text-lg rounded-full cursor-pointer">
            {t.cta.btn}
          </Button>
        </div>
      </section>

      <MarketingNewsletterSection
        content={t.newsletter}
        className="py-20 px-4 max-w-4xl mx-auto"
      />

      <MarketingFullFooter
        locale={locale}
        labels={{
          product: t.footer.product,
          resources: t.footer.resources,
          contact: t.footer.contact,
          features: t.footer.features,
          pricing: t.footer.pricing,
          stories: t.footer.stories,
          blog: t.footer.blog,
          guides: t.footer.guides,
          care: t.footer.care,
        }}
      />

      <style>{`
        @keyframes growDown {
          0% { height: 0; opacity: 0; }
          100% { height: 3rem; opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  )
}
