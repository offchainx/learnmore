"use client"

import React from 'react';
import { REVIEWERS } from './constants';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    Active: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/20',
    Away: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/20',
    Offline: 'bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400 ring-1 ring-slate-500/20',
  };
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${styles[status as keyof typeof styles]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-emerald-500 animate-pulse' : status === 'Away' ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
      {status}
    </span>
  );
};

export const ReviewersList = () => {
  return (
    <section className="glass-card rounded-2xl overflow-hidden flex flex-col">
      <div className="flex flex-col justify-between gap-4 border-b border-gray-100 px-6 py-5 dark:border-white/5 tablet:flex-row tablet:items-center">
        <div>
          <h4 className="text-lg font-bold text-gray-900 dark:text-white">Review Team</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Real-time contributor performance</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 transition-all placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-white/10 dark:bg-black/20 dark:text-white tablet:w-64" 
            placeholder="Search reviewers..." 
            type="text"
          />
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-white/5">
              <th className="px-6 py-4 rounded-tl-lg">Reviewer</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Total Reviews</th>
              <th className="px-6 py-4">Accuracy Rate</th>
              <th className="px-6 py-4 text-right rounded-tr-lg">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {REVIEWERS.map((reviewer) => (
              <tr key={reviewer.id} className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors group cursor-pointer">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                        <img 
                        alt={reviewer.name} 
                        className="w-9 h-9 rounded-full ring-2 ring-transparent group-hover:ring-primary/30 transition-all object-cover" 
                        src={reviewer.avatar} 
                        />
                        {reviewer.status === 'Active' && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full"></div>}
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{reviewer.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">ID: #{reviewer.id.padStart(4, '0')}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/5">
                    {reviewer.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white font-mono">{reviewer.reviews.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5 w-32">
                    <div className="flex justify-between text-xs font-medium">
                        <span className={`${reviewer.accuracy >= 95 ? 'text-emerald-500' : 'text-primary'}`}>{reviewer.accuracy}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${reviewer.accuracy >= 95 ? 'bg-emerald-500' : reviewer.accuracy >= 90 ? 'bg-primary' : 'bg-amber-500'}`} 
                        style={{ width: `${reviewer.accuracy}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <StatusBadge status={reviewer.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/30 dark:bg-white/[0.01]">
        <span className="text-xs text-gray-500 dark:text-gray-400">Showing <span className="font-medium text-gray-900 dark:text-white">5</span> of <span className="font-medium text-gray-900 dark:text-white">24</span> Reviewers</span>
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 disabled:opacity-30 transition-colors" disabled>
            <ChevronLeft size={18} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold bg-primary text-white shadow-lg shadow-primary/25">1</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">2</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">3</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
};
