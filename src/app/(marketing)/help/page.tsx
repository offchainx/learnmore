'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { FAQAccordion } from '@/components/support/FAQAccordion';
import { Input } from '@/components/ui/input';
import { MarketingSimpleFooter } from '@/components/marketing/MarketingSimpleFooter';
import { marketingSiteConfig } from '@/lib/marketing/site-shell';
import { Search, Mail, MessageCircle, Phone } from 'lucide-react';
import { FeedbackModal } from '@/components/support/FeedbackModal';
import { useApp } from '@/providers';

export default function HelpPage() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useApp();

  const helpTopics = [
    { label: t.support.categoriesList[0], query: 'start' },
    { label: t.support.categoriesList[1], query: 'password' },
    { label: t.support.categoriesList[2], query: 'study' },
    { label: t.support.categoriesList[3], query: 'subscription' },
  ];

  return (
    <div className="dark min-h-screen bg-[#020617] text-white font-sans">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 text-center bg-gradient-to-b from-blue-900/20 to-transparent">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            {t.support.helpTitle}
          </h1>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input
              className="w-full pl-12 pr-4 py-6 bg-slate-900/50 border-slate-800 text-white rounded-2xl focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg"
              placeholder={t.support.helpSearchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto min-w-0 px-4 pb-20">
        <div className="grid grid-cols-1 gap-12 desktop:grid-cols-2">
          {/* FAQ Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="h-8 w-1 bg-blue-500 rounded-full"></span>
              {t.support.faqTitle}
            </h2>
            <FAQAccordion searchQuery={searchQuery} />
          </div>

          {/* Contact Support Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="h-8 w-1 bg-indigo-500 rounded-full"></span>
              {t.support.contactTitle}
            </h2>
            <div className="space-y-4">
              <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-blue-500/50 transition-all group cursor-pointer" onClick={() => setIsFeedbackOpen(true)}>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{t.support.sendMessageTitle}</h3>
                    <p className="text-slate-400 text-sm">{t.support.sendMessageDescription}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-indigo-500/50 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:scale-110 transition-transform">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{t.support.emailSupportTitle}</h3>
                    <p className="text-slate-400 text-sm">
                      {t.support.emailSupportDescriptionPrefix}{' '}
                      <span className="text-blue-400">{marketingSiteConfig.supportEmail}</span>{' '}
                      {t.support.emailSupportDescriptionSuffix}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl opacity-50 cursor-not-allowed group">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-500/10 rounded-xl text-slate-400">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{t.support.phoneSupportTitle}</h3>
                    <p className="text-slate-500 text-sm">{t.support.phoneSupportDescription}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold mb-8 text-center">{t.support.browseTitle}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 desktop:grid-cols-4">
            {helpTopics.map((topic) => (
              <button
                key={topic.label}
                type="button"
                onClick={() =>
                  setSearchQuery((current) =>
                    current.trim().toLowerCase() === topic.query ? '' : topic.query
                  )
                }
                aria-pressed={searchQuery.trim().toLowerCase() === topic.query}
                className={`rounded-2xl border p-6 text-center transition-all ${
                  searchQuery.trim().toLowerCase() === topic.query
                    ? 'border-blue-500/60 bg-blue-500/10 text-white'
                    : 'border-slate-800 bg-slate-900/30 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                <p className="font-medium">{topic.label}</p>
              </button>
            ))}
          </div>
        </section>
      </main>

      <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
        sourceType="help-page"
      />

      <MarketingSimpleFooter locale="en" />
    </div>
  );
}
