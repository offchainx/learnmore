"use client"

import React from 'react';
import { Download, Search, Filter, ArrowUpDown } from 'lucide-react';
import { useApp } from '@/providers';
import { getReportsI18n } from './i18n';

export const Header: React.FC = () => {
  const { lang } = useApp();
  const text = getReportsI18n(lang).header;

  return (
    <>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-text-primary dark:text-text-primary">{text.title}</h1>
          <p className="text-sm text-text-secondary dark:text-text-secondary">{text.description}</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center rounded-lg border border-borderTone bg-surface px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary dark:border-borderTone dark:bg-surface dark:text-text-secondary dark:hover:bg-surface-subtle dark:hover:text-text-primary">
            <Download size={16} className="mr-2" />
            {text.export}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:w-96">
          <Search size={18} className="pointer-events-none absolute left-3 top-2.5 text-text-tertiary" />
          <input 
            className="w-full rounded-lg border border-borderTone bg-surface py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-tertiary shadow-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-borderTone dark:bg-surface dark:text-text-primary" 
            placeholder={text.searchPlaceholder}
            type="text" 
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-borderTone bg-surface px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary dark:border-borderTone dark:bg-surface dark:text-text-secondary dark:hover:bg-surface-subtle dark:hover:text-text-primary sm:flex-none">
            <Filter size={18} />
            {text.filter}
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-borderTone bg-surface px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary dark:border-borderTone dark:bg-surface dark:text-text-secondary dark:hover:bg-surface-subtle dark:hover:text-text-primary sm:flex-none">
            <ArrowUpDown size={18} />
            {text.sort}
          </button>
        </div>
      </div>
    </>
  );
};
