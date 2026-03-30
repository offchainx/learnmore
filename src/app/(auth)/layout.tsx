'use client'; // This layout will use client-side hooks like useRouter

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';


export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020617] px-4 py-20 font-sans text-white sm:px-6 desktop:px-8">
      {/* Background blobs (extracted from AI designs) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-8%] left-[-16%] h-[260px] w-[260px] rounded-full bg-blue-900/20 blur-[72px] sm:h-[360px] sm:w-[360px] desktop:h-[500px] desktop:w-[500px] desktop:blur-[100px]"></div>
        <div className="absolute top-[-8%] right-[-12%] h-[260px] w-[260px] rounded-full bg-indigo-900/20 blur-[72px] sm:h-[360px] sm:w-[360px] desktop:h-[500px] desktop:w-[500px] desktop:blur-[100px]" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-[-10%] left-[-10%] h-[260px] w-[260px] rounded-full bg-blue-900/20 blur-[72px] sm:h-[360px] sm:w-[360px] desktop:h-[500px] desktop:w-[500px] desktop:blur-[100px]" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Back to Home Button */}
      <div className="absolute left-4 top-4 z-10 sm:left-6 sm:top-6 desktop:left-8 desktop:top-8">
        <Button variant="ghost" onClick={() => router.push('/')} className="flex items-center gap-2 px-2 text-slate-400 transition-colors hover:text-white sm:px-3">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Button>
      </div>

      <div className="relative z-10 flex w-full min-w-0 justify-center">
        {children}
      </div>
    </div>
  );
}
