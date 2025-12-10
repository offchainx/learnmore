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
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden font-sans text-white">
      {/* Background blobs (extracted from AI designs) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[100px]"></div>
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[100px]" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[100px]" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Back to Home Button */}
      <div className="absolute top-8 left-8 z-10">
        <Button variant="ghost" onClick={() => router.push('/')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Button>
      </div>

      {children}
    </div>
  );
}
