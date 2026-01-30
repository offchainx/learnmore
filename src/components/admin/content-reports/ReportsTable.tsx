"use client"

import React from 'react';
import { Report, ReportStatus, IssueType } from './types';
import { Eye, ChevronLeft, ChevronRight, Hash } from 'lucide-react';

interface ReportsTableProps {
  reports: Report[];
  onSelectReport: (report: Report) => void;
}

export const ReportsTable: React.FC<ReportsTableProps> = ({ reports, onSelectReport }) => {
  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.IN_REVIEW: return 'text-yellow-600 dark:text-yellow-400';
      case ReportStatus.PENDING: return 'text-red-600 dark:text-red-400';
      case ReportStatus.RESOLVED: return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600';
    }
  };

  const getStatusIndicator = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.IN_REVIEW:
        return (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
          </span>
        );
      case ReportStatus.PENDING:
        return <span className="h-2 w-2 rounded-full bg-red-500"></span>;
      case ReportStatus.RESOLVED:
        return <span className="h-2 w-2 rounded-full bg-green-500"></span>;
    }
  };

  const getIssueBadge = (type: IssueType) => {
    const baseClasses = "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border";
    switch (type) {
      case IssueType.ANSWER_WRONG:
        return <span className={`${baseClasses} bg-red-100 dark:bg-red-500/10 text-red-800 dark:text-red-400 border-red-200 dark:border-red-500/20`}>{type}</span>;
      case IssueType.TYPO_ERROR:
        return <span className={`${baseClasses} bg-orange-100 dark:bg-orange-500/10 text-orange-800 dark:text-orange-400 border-orange-200 dark:border-orange-500/20`}>{type}</span>;
      case IssueType.IMAGE_MISSING:
        return <span className={`${baseClasses} bg-blue-100 dark:bg-blue-500/10 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-500/20`}>{type}</span>;
    }
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden shadow-xl border-t-0">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-black/20">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reporter</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Issue Type</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[35%]">Question Preview</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/5 text-sm">
            {reports.map((report) => (
              <tr key={report.id} className="glass-row transition-colors group cursor-pointer" onClick={() => onSelectReport(report)}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="relative">
                      {report.user.avatar ? (
                         <img className="h-10 w-10 rounded-full object-cover border-2 border-white dark:border-white/10 shadow-sm" src={report.user.avatar} alt={report.user.name} />
                      ) : (
                         <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold border-2 border-white dark:border-white/10 shadow-sm">
                             {report.user.name.split(' ').map(n => n[0]).join('')}
                         </div>
                      )}
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-[#151a23] ${report.status === ReportStatus.RESOLVED ? 'bg-gray-400' : 'bg-green-500'}`}></div>
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900 dark:text-white">{report.user.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{report.timestamp}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getIssueBadge(report.issueType)}
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-900 dark:text-gray-300 font-medium truncate max-w-xs">{report.question.text}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center gap-1">
                    <Hash size={10} />
                    {report.question.id} • {report.question.subject}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getStatusIndicator(report.status)}
                    <span className={`text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status === ReportStatus.IN_REVIEW ? 'In Review' : report.status.charAt(0) + report.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors" title="View Details" onClick={(e) => { e.stopPropagation(); onSelectReport(report); }}>
                      <Eye size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-gray-200 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-black/20">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing <span className="font-medium text-gray-900 dark:text-white">1</span> to <span className="font-medium text-gray-900 dark:text-white">4</span> of <span className="font-medium text-gray-900 dark:text-white">24</span> results
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
            <ChevronLeft size={16} />
          </button>
          <button className="p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
