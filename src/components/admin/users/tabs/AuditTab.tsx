'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Activity, Ban, User as UserIcon, Lock, FileText, Loader2 } from 'lucide-react'
import { UserDetail, AuditEventType, AuditLogItem } from '@/types/admin-user'
import { getUserAuditLogs } from '@/actions/admin/user-details'

interface AuditTabProps {
  user: UserDetail
}

export const AuditTab: React.FC<AuditTabProps> = ({ user }) => {
  const [auditFilter, setAuditFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await getUserAuditLogs(user.id);
      if (res.success && res.data) {
        setAuditLogs(res.data);
      }
      setLoading(false);
    }
    loadData();
  }, [user.id]);

  // Filter Audit Logs
  const filteredAuditLogs = useMemo(() => {
    if (auditFilter === 'All') return auditLogs;
    if (auditFilter === 'Permission Change') return auditLogs.filter(l => l.type === AuditEventType.PERMISSION);
    if (auditFilter === 'Impersonation') return auditLogs.filter(l => l.type === AuditEventType.IMPERSONATE);
    if (auditFilter === 'Status Change') return auditLogs.filter(l => l.type === AuditEventType.STATUS);
    return auditLogs;
  }, [auditLogs, auditFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 min-h-[500px]">
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-800 pb-6">
          {['All', 'Permission Change', 'Impersonation', 'Status Change'].map(f => (
            <button
              key={f}
              onClick={() => setAuditFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                auditFilter === f
                  ? 'bg-blue-900/30 border-blue-800 text-blue-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="space-y-0 relative">
          {filteredAuditLogs.length === 0 ? (
            <div className="text-center text-slate-500 py-10">暂无审计日志</div>
          ) : (
            filteredAuditLogs.map((log, i) => {
              // Logic for grouping Impersonation events visually
              const isGrouped = (log.meta?.isSessionEnd && filteredAuditLogs[i+1]?.meta?.isSessionStart);
              
              let icon = <Activity size={14} />;
              let colorClass = 'text-slate-400 bg-slate-900 border-slate-700';
              
              if (log.type === AuditEventType.STATUS) {
                icon = <Ban size={14} />;
                colorClass = 'text-red-400 bg-red-950/30 border-red-900';
              } else if (log.type === AuditEventType.IMPERSONATE) {
                icon = <UserIcon size={14} />;
                colorClass = 'text-amber-400 bg-amber-950/30 border-amber-900';
              } else if (log.type === AuditEventType.PERMISSION) {
                icon = <Lock size={14} />;
                colorClass = 'text-purple-400 bg-purple-950/30 border-purple-900';
              } else if (log.type === AuditEventType.NOTE) {
                icon = <FileText size={14} />;
                colorClass = 'text-blue-400 bg-blue-950/30 border-blue-900';
              }

              return (
                <div key={log.id} className="relative pl-8 pb-8 group last:pb-0">
                  {/* Vertical Line */}
                  {i !== filteredAuditLogs.length - 1 && (
                    <div className={`absolute left-[11px] top-8 bottom-0 w-px ${isGrouped ? 'bg-amber-800/50 w-0.5' : 'bg-slate-800'}`}></div>
                  )}

                  {/* Icon Bubble */}
                  <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border flex items-center justify-center ${colorClass} z-10`}>
                    {icon}
                  </div>

                  {/* Content */}
                  <div className={`flex flex-col gap-1 ${isGrouped ? 'bg-amber-900/10 -m-2 p-3 rounded border border-amber-900/20' : ''}`}>
                    <div className="flex items-baseline gap-3">
                      <span className="text-sm font-bold text-slate-200">{log.title}</span>
                      <span className="text-xs text-slate-500 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {log.description}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  )
}
