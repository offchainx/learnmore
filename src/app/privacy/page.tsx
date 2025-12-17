'use client';

import React from 'react';
import { LandingPageNavbar } from '@/components/layout/LandingPageNavbar';
import { Footer } from '@/components/layout/Footer';

export default function PrivacyPage() {
  return (
    <div className="dark min-h-screen bg-[#020617] text-white font-sans">
      <LandingPageNavbar />
      <main className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Privacy Policy</h1>
        <div className="space-y-6 text-slate-300 leading-relaxed">
          <p>Last updated: December 13, 2025</p>
          <p>
            At LearnMore Edu, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our educational platform.
          </p>
          
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Information We Collect</h2>
          <p>
            We collect information that you provide directly to us when you register, create an account, update your profile, or contact customer support. This may include your name, email address, grade level, and learning preferences.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services, including to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Personalize your learning experience and recommend relevant content.</li>
            <li>Track your progress and generate performance reports.</li>
            <li>Process transactions and send you related information.</li>
            <li>Send you technical notices, updates, security alerts, and support messages.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
