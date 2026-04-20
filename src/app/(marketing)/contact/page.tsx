'use client';

import React from 'react';
import { Navbar } from '@/components/layout/navbar';
import { MarketingSimpleFooter } from '@/components/marketing/MarketingSimpleFooter';
import { marketingSiteConfig } from '@/lib/marketing/site-shell';
import { Mail, MapPin, Phone } from 'lucide-react';
import { ContactForm } from '@/components/support/ContactForm';

export default function ContactPage() {
  return (
    <div className="marketing-shell min-h-screen bg-[#020617] text-white font-sans">
      <Navbar />
      <main className="mx-auto max-w-6xl min-w-0 px-4 pb-20 pt-32">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Contact Us</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Have questions about our curriculum? Need technical support? We&apos;re here to help you on your learning journey.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 desktop:grid-cols-2">
          {/* Contact Info */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white mb-6">Get in Touch</h2>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Email Us</h3>
                <p className="text-slate-400 text-sm mb-1">Our friendly team is here to help.</p>
                <a href={`mailto:${marketingSiteConfig.supportEmail}`} className="text-blue-400 hover:text-blue-300 font-medium">{marketingSiteConfig.supportEmail}</a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Office</h3>
                <p className="text-slate-400 text-sm mb-1">Come say hello at our office HQ.</p>
                <p className="text-slate-300">{marketingSiteConfig.addressLines[0]}<br />{marketingSiteConfig.addressLines[1]}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Phone</h3>
                <p className="text-slate-400 text-sm mb-1">Mon-Fri from 8am to 5pm.</p>
                <p className="text-slate-300">{marketingSiteConfig.phone}</p>
              </div>
            </div>
          </div>

          <ContactForm />
        </div>
      </main>

      <MarketingSimpleFooter locale="en" />
    </div>
  );
}
