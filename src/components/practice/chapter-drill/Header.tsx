import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell } from 'lucide-react';

export const Header: React.FC = () => {
  const router = useRouter();

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#232348]/50 px-6 py-3 bg-[#f6f6f8] dark:bg-[#101022]">
      <div className="flex items-center gap-4">
        <button 
           onClick={() => router.back()}
           className="size-8 text-[#1111d4] hover:bg-[#1111d4]/10 rounded-full flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          LearnMore <span className="text-[#9292c9] font-normal text-sm ml-2 hidden sm:inline">Chapter Drill</span>
        </h2>
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-6">
          <span className="text-sm font-medium text-[#9292c9]">Focus Mode</span>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-[#232348] text-white hover:bg-[#1111d4]/20 transition-all">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
