'use client';

import React from 'react';
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="py-8 border-t border-white/5 text-center text-sm text-slate-600 bg-black">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <p>© 2025 LearnMore Edu. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
          <Link href="/contact" className="hover:text-slate-400 transition-colors">Contact Us</Link>
        </div>
      </div>
    </footer>
  );
};
