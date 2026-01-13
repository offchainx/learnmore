'use client';

import React from 'react';
import { Navbar } from '@/components/layout/navbar';

export default function TermsPage() {
  return (
    <div className="dark min-h-screen bg-[#020617] text-white font-sans">
      <Navbar />
      <main className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Terms of Service</h1>
        <div className="space-y-6 text-slate-300 leading-relaxed">
          <p>Last updated: December 13, 2025</p>
          <p>
            Please read these Terms of Service (&quot;Terms&quot;) carefully before using the LearnMore Edu platform operated by us.
          </p>
          
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. User Accounts</h2>
          <p>
            When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Intellectual Property</h2>
          <p>
            The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of LearnMore Edu and its licensors.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Termination</h2>
          <p>
            We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
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
