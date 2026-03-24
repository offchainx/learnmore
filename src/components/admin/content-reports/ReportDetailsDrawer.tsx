"use client"

import React from 'react';
import { Report, IssueType } from './types';
import { X, BarChart3, Star, HelpCircle, Check, CheckCircle2, XCircle, Wrench } from 'lucide-react';
import { useApp } from '@/providers';
import { getReportsI18n } from './i18n';

interface ReportDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report | null;
}

export const ReportDetailsDrawer: React.FC<ReportDetailsDrawerProps> = ({ isOpen, onClose, report }) => {
  const { lang } = useApp();
  const text = getReportsI18n(lang);

  if (!report) return null;

  const systemAnswerId = report.systemCorrectOptionId;
  const userAnswerId = report.userSuggestedOptionId;

  const getOptionClasses = (optionId: string) => {
    if (optionId === systemAnswerId) {
        return "border-borderTone bg-[hsl(var(--state-success-bg))] dark:border-borderTone dark:bg-[hsl(var(--state-success-bg))]";
    }
    if (optionId === userAnswerId && report.issueType === IssueType.ANSWER_WRONG) {
        return "border-borderTone bg-[hsl(var(--state-danger-bg))] dark:border-borderTone dark:bg-[hsl(var(--state-danger-bg))]";
    }
    return "border-transparent hover:bg-surface-subtle dark:hover:bg-surface-subtle";
  };

  const getOptionBadgeClasses = (optionId: string) => {
      if (optionId === systemAnswerId) return "bg-[hsl(var(--state-success-bg))] text-[hsl(var(--state-success-fg))] dark:bg-[hsl(var(--state-success-bg))] dark:text-[hsl(var(--state-success-fg))]";
      if (optionId === userAnswerId) return "bg-[hsl(var(--state-danger-bg))] text-[hsl(var(--state-danger-fg))] dark:bg-[hsl(var(--state-danger-bg))] dark:text-[hsl(var(--state-danger-fg))]";
      return "bg-surface-subtle text-text-secondary dark:bg-surface-subtle dark:text-text-secondary";
  };

  const getOptionIcon = (optionId: string) => {
      if (optionId === systemAnswerId) return <Check className="text-[hsl(var(--state-success-fg))]" size={18} />;
      if (optionId === userAnswerId) return <X className="text-[hsl(var(--state-danger-fg))]" size={18} />;
      return null;
  };

  return (
    <div className={`drawer-glass fixed inset-y-0 right-0 z-50 flex w-full transform flex-col overflow-hidden border-l border-borderTone bg-surface shadow-2xl transition-transform duration-300 ease-in-out dark:border-borderTone dark:bg-page sm:w-[500px] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      {/* Background Blobs inside drawer */}
      <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-[hsl(var(--state-warning-bg))] blur-[100px] -mr-32 -mt-32"></div>
      <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[hsl(var(--state-info-bg))] blur-[100px] -ml-20 -mb-20"></div>

      <div className="relative z-10 flex items-center justify-between border-b border-borderTone bg-surface/80 p-6 backdrop-blur-md dark:border-borderTone dark:bg-surface/70">
        <h2 className="flex items-center gap-2 text-xl font-bold text-text-primary dark:text-text-primary">
          <BarChart3 className="text-primary" size={24} />
          {text.drawer.reportDetails}
        </h2>
        <button onClick={onClose} className="rounded-full p-1 text-text-tertiary transition-colors hover:bg-surface-subtle hover:text-text-primary dark:hover:bg-surface-subtle dark:hover:text-text-primary">
          <X size={20} />
        </button>
      </div>

      <div className="custom-scrollbar relative z-10 flex-1 space-y-6 overflow-y-auto p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {report.user.avatar ? (
                 <img src={report.user.avatar} alt="User" className="h-12 w-12 rounded-full border-2 border-surface object-cover dark:border-surface" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-surface bg-[linear-gradient(135deg,hsl(var(--state-danger-bg)),hsl(var(--state-warning-bg)))] text-lg font-bold text-text-primary dark:border-surface">
                    {report.user.name.split(' ').map(n => n[0]).join('')}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 rounded-full bg-surface p-0.5 dark:bg-surface">
                <Star className="text-[hsl(var(--state-warning-fg))]" size={14} fill="currentColor" />
              </div>
            </div>
            <div>
              <h3 className="font-medium text-text-primary dark:text-text-primary">{report.user.name}</h3>
              <p className="text-xs text-text-secondary dark:text-text-secondary">{text.drawer.student} • {report.question.subject}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="mb-1 text-nowrap rounded-full border border-borderTone bg-[hsl(var(--state-danger-bg))] px-3 py-1 text-xs font-semibold text-[hsl(var(--state-danger-fg))] dark:border-borderTone dark:bg-[hsl(var(--state-danger-bg))] dark:text-[hsl(var(--state-danger-fg))]">
              {text.issueType[report.issueType]}
            </span>
            <span className="text-xs text-text-tertiary dark:text-text-tertiary">{text.drawer.idPrefix}: #{report.id}</span>
          </div>
        </div>

        <div className="rounded-xl border border-borderTone bg-surface-subtle p-4 dark:border-borderTone dark:bg-surface-subtle">
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-text-tertiary dark:text-text-tertiary">{text.drawer.userComment}</h4>
          <p className="text-sm italic text-text-secondary dark:text-text-secondary">&ldquo;{report.comment}&rdquo;</p>
        </div>

        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-primary dark:text-text-primary">
            <HelpCircle className="text-primary" size={18} />
            {text.drawer.questionContent}
          </h4>
          <div className="overflow-hidden rounded-xl border border-borderTone bg-surface shadow-sm dark:border-borderTone dark:bg-surface">
            <div className="border-b border-borderTone p-4 dark:border-borderTone">
              <p className="text-sm font-medium leading-relaxed text-text-primary dark:text-text-primary">
                {report.question.text}
              </p>
            </div>
            <div className="p-4 space-y-2">
              {report.question.options.map((option) => (
                <div key={option.id} className={`flex items-center p-2 rounded-lg border transition-colors ${getOptionClasses(option.id)}`}>
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mr-3 ${getOptionBadgeClasses(option.id)}`}>
                    {option.id}
                  </span>
                  <span className="flex-1 text-sm text-text-secondary dark:text-text-secondary">{option.text}</span>
                  {getOptionIcon(option.id)}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-borderTone bg-[hsl(var(--state-success-bg))] p-3 text-center dark:border-borderTone dark:bg-[hsl(var(--state-success-bg))]">
             <div className="mb-1 text-xs font-semibold text-[hsl(var(--state-success-fg))]">{text.drawer.systemAnswer}</div>
             <div className="text-lg font-bold text-text-primary dark:text-text-primary">{text.drawer.option} {systemAnswerId}</div>
          </div>
          <div className="rounded-xl border border-borderTone bg-[hsl(var(--state-danger-bg))] p-3 text-center dark:border-borderTone dark:bg-[hsl(var(--state-danger-bg))]">
            <div className="mb-1 text-xs font-semibold text-[hsl(var(--state-danger-fg))]">{text.drawer.userSuggests}</div>
            <div className="text-lg font-bold text-text-primary dark:text-text-primary">{text.drawer.option} {userAnswerId}</div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-3 border-t border-borderTone bg-surface-subtle p-6 dark:border-borderTone dark:bg-surface-subtle">
        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[hsl(var(--state-success-fg))] py-2.5 font-medium text-white shadow-lg shadow-[hsl(var(--state-success-fg))]/20 transition-all hover:scale-[1.02] hover:bg-[hsl(var(--state-success-fg))]">
          <CheckCircle2 size={18} />
          {text.drawer.confirmErrorRefund}
        </button>
        <div className="flex gap-3">
          <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-borderTone bg-[hsl(var(--state-danger-bg))] py-2.5 text-sm font-medium text-[hsl(var(--state-danger-fg))] transition-colors hover:bg-[hsl(var(--state-danger-bg))] dark:border-borderTone dark:bg-[hsl(var(--state-danger-bg))] dark:text-[hsl(var(--state-danger-fg))]">
            <XCircle size={18} />
            {text.drawer.rejectReport}
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-borderTone bg-[hsl(var(--state-info-bg))] py-2.5 text-sm font-medium text-[hsl(var(--state-info-fg))] shadow-[0_0_15px_-3px_rgba(59,130,246,0.18)] transition-colors hover:bg-[hsl(var(--state-info-bg))] dark:border-borderTone dark:bg-[hsl(var(--state-info-bg))] dark:text-[hsl(var(--state-info-fg))]">
            <Wrench size={18} />
            {text.drawer.markAsFixed}
          </button>
        </div>
      </div>
    </div>
  );
};
