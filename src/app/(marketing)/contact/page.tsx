'use client';

import React from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="dark min-h-screen bg-[#020617] text-white font-sans">
      <Navbar />
      <main className="pt-32 pb-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Contact Us</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Have questions about our curriculum? Need technical support? We&apos;re here to help you on your learning journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
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
                <a href="mailto:support@learnmore.edu" className="text-blue-400 hover:text-blue-300 font-medium">support@learnmore.edu</a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Office</h3>
                <p className="text-slate-400 text-sm mb-1">Come say hello at our office HQ.</p>
                <p className="text-slate-300">100 Innovation Drive, #02-01<br/>Singapore 138668</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Phone</h3>
                <p className="text-slate-400 text-sm mb-1">Mon-Fri from 8am to 5pm.</p>
                <p className="text-slate-300">+65 6789 1234</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <Card className="bg-[#0a0a0a] border-white/10 p-8">
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">First name</label>
                  <Input placeholder="Jane" className="bg-[#111] border-white/10 focus:border-blue-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Last name</label>
                  <Input placeholder="Doe" className="bg-[#111] border-white/10 focus:border-blue-500" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Email</label>
                <Input type="email" placeholder="jane@example.com" className="bg-[#111] border-white/10 focus:border-blue-500" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Message</label>
                <textarea 
                  className="flex min-h-[120px] w-full rounded-md border border-white/10 bg-[#111] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="How can we help you?"
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                Send Message
              </Button>
            </form>
          </Card>
        </div>
      </main>

      <footer className="bg-[#020617] border-t border-slate-900 py-10 text-center text-slate-600 text-sm">
         <div className="max-w-7xl mx-auto px-4">
            <p>© 2025 LearnMore Edu. All rights reserved.</p>
         </div>
      </footer>
    </div>
  );
}
