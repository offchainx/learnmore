'use client';

import React from 'react';
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="py-8 border-t border-white/5 text-center text-sm text-slate-600 bg-black">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 tablet:flex-row">
        <p>© 2026 LearnMore Edu. All rights reserved.</p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link href="/help" className="hover:text-slate-400 transition-colors">Help Center</Link>
          <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
          <Link href="/refund" className="hover:text-slate-400 transition-colors">Refund Policy</Link>
          <Link href="/contact" className="hover:text-slate-400 transition-colors">Contact Us</Link>
        </div>
      </div>
    </footer>
  );
};
