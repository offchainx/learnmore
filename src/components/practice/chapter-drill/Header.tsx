import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell } from 'lucide-react';

export const Header: React.FC = () => {
  const router = useRouter();

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-borderTone bg-[linear-gradient(180deg,hsl(var(--surface-default))_0%,hsl(var(--surface-muted))_100%)] px-6 py-3 text-text-primary shadow-[inset_0_-1px_0_rgba(255,255,255,0.24)] dark:border-borderTone dark:bg-surface-subtle dark:text-text-primary">
      <div className="flex items-center gap-4">
        <button 
           onClick={() => router.back()}
           className="flex size-8 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface-selected hover:text-primary dark:text-primary dark:hover:bg-surface-selected dark:hover:text-primary"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold tracking-tight text-text-primary dark:text-text-primary">
          LearnMore <span className="ml-2 hidden text-sm font-normal text-text-secondary dark:text-text-secondary sm:inline">Chapter Drill</span>
        </h2>
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-6">
          <span className="text-sm font-medium text-text-secondary dark:text-text-secondary">Focus Mode</span>
        </div>
        <div className="flex gap-2">
          <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-borderTone bg-surface text-text-secondary transition-all hover:bg-surface-subtle hover:text-text-primary dark:border-borderTone dark:bg-surface dark:text-text-secondary dark:hover:bg-surface-subtle dark:hover:text-text-primary">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
