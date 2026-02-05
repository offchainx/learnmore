'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { FAQAccordion } from '@/components/support/FAQAccordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Mail, MessageCircle, Phone } from 'lucide-react';
import { FeedbackModal } from '@/components/support/FeedbackModal';

export default function HelpPage() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <div className="dark min-h-screen bg-[#020617] text-white font-sans">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 text-center bg-gradient-to-b from-blue-900/20 to-transparent">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            How can we help you?
          </h1>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input 
              className="w-full pl-12 pr-4 py-6 bg-slate-900/50 border-slate-800 text-white rounded-2xl focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg"
              placeholder="Search for articles, guides..."
            />
          </div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* FAQ Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="h-8 w-1 bg-blue-500 rounded-full"></span>
              Frequently Asked Questions
            </h2>
            <FAQAccordion />
          </div>

          {/* Contact Support Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="h-8 w-1 bg-indigo-500 rounded-full"></span>
              Contact Support
            </h2>
            <div className="space-y-4">
              <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-blue-500/50 transition-all group cursor-pointer" onClick={() => setIsFeedbackOpen(true)}>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Send a Message</h3>
                    <p className="text-slate-400 text-sm">Fill out our feedback form and we&apos;ll get back to you within 24 hours.</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-indigo-500/50 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:scale-110 transition-transform">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Email Support</h3>
                    <p className="text-slate-400 text-sm">Drop us an email at <span className="text-blue-400">support@learnmore.com</span> for direct assistance.</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl opacity-50 cursor-not-allowed group">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-500/10 rounded-xl text-slate-400">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Phone Support</h3>
                    <p className="text-slate-500 text-sm">Available only for Premium Plus subscribers.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold mb-8 text-center">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Getting Started', 'Account & Security', 'Study Guides', 'Billing & Plans'].map((cat) => (
              <div key={cat} className="p-6 bg-slate-900/30 border border-slate-800 rounded-2xl text-center hover:bg-slate-800/50 transition-all cursor-pointer">
                <p className="font-medium text-slate-300">{cat}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
      />

      <footer className="bg-[#020617] border-t border-slate-900 py-10 text-center text-slate-600 text-sm">
         <div className="max-w-7xl mx-auto px-4">
            <p>© 2026 LearnMore Edu. All rights reserved.</p>
         </div>
      </footer>
    </div>
  );
}
