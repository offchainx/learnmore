"use client"

import React from 'react';
import { Report, IssueType } from './types';
import { X, BarChart3, Star, HelpCircle, Check, CheckCircle2, XCircle, Wrench } from 'lucide-react';

interface ReportDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report | null;
}

export const ReportDetailsDrawer: React.FC<ReportDetailsDrawerProps> = ({ isOpen, onClose, report }) => {
  if (!report) return null;

  const systemAnswerId = report.systemCorrectOptionId;
  const userAnswerId = report.userSuggestedOptionId;

  const getOptionClasses = (optionId: string) => {
    if (optionId === systemAnswerId) {
        // Correct answer style (Green)
        return "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-500/20";
    }
    if (optionId === userAnswerId && report.issueType === IssueType.ANSWER_WRONG) {
        return "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-500/20";
    }
    return "hover:bg-gray-50 dark:hover:bg-white/5 border-transparent";
  };

  const getOptionBadgeClasses = (optionId: string) => {
      if (optionId === systemAnswerId) return "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400";
      if (optionId === userAnswerId) return "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400";
      return "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400";
  };

  const getOptionIcon = (optionId: string) => {
      if (optionId === systemAnswerId) return <Check className="text-green-500" size={18} />;
      if (optionId === userAnswerId) return <X className="text-red-500" size={18} />;
      return null;
  };

  return (
    <div className={`fixed inset-y-0 right-0 w-full sm:w-[500px] bg-white dark:bg-[#0B0E14] drawer-glass shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col border-l border-white/10 overflow-hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      {/* Background Blobs inside drawer */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none -ml-20 -mb-20"></div>

      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10 relative z-10 bg-white/50 dark:bg-black/20 backdrop-blur-md">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="text-purple-500" size={24} />
          Report Details
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-white transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 custom-scrollbar">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {report.user.avatar ? (
                 <img src={report.user.avatar} alt="User" className="w-12 h-12 rounded-full border-2 border-white dark:border-white/10" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold border-2 border-white dark:border-white/10 text-lg">
                    {report.user.name.split(' ').map(n => n[0]).join('')}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-0.5">
                <Star className="text-yellow-500" size={14} fill="currentColor" />
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">{report.user.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Student • {report.question.subject}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-500/10 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-500/20 mb-1 text-nowrap">
              {report.issueType}
            </span>
            <span className="text-xs text-gray-400">ID: #{report.id}</span>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-200 dark:border-white/5">
          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">User Comment</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{report.comment}"</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <HelpCircle className="text-primary" size={18} />
            Question Content
          </h4>
          <div className="bg-white dark:bg-[#161B26] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-white/5">
              <p className="text-sm text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                {report.question.text}
              </p>
            </div>
            <div className="p-4 space-y-2">
              {report.question.options.map((option) => (
                <div key={option.id} className={`flex items-center p-2 rounded-lg border transition-colors ${getOptionClasses(option.id)}`}>
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mr-3 ${getOptionBadgeClasses(option.id)}`}>
                    {option.id}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">{option.text}</span>
                  {getOptionIcon(option.id)}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/10 text-center">
             <div className="text-xs text-green-500 font-semibold mb-1">System Answer</div>
             <div className="text-lg font-bold text-gray-900 dark:text-white">Option {systemAnswerId}</div>
          </div>
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/10 text-center">
            <div className="text-xs text-red-500 font-semibold mb-1">User Suggests</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">Option {userAnswerId}</div>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#11141B] flex flex-col gap-3 relative z-10">
        <button className="w-full py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium shadow-lg shadow-green-500/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2">
          <CheckCircle2 size={18} />
          Confirm Error & Refund
        </button>
        <div className="flex gap-3">
          <button className="flex-1 py-2.5 rounded-lg border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
            <XCircle size={18} />
            Reject Report
          </button>
          <button className="flex-1 py-2.5 rounded-lg bg-blue-600/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-600/20 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)] transition-colors flex items-center justify-center gap-2 text-sm font-medium">
            <Wrench size={18} />
            Mark as Fixed
          </button>
        </div>
      </div>
    </div>
  );
};
