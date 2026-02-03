import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, User as UserIcon, Ban, Key, Copy, 
  Shield, Smartphone, MapPin, Calendar, ExternalLink,
  RotateCcw, CheckCircle, CreditCard, Activity, 
  GitCommit, Users, FileText, Lock, GraduationCap
} from 'lucide-react';
import { User, UserStatus, SubscriptionTier, AuditEventType } from '../types';
import { Badge } from './Badge';
import { 
  generateAuditLogs, 
  generateHeatmapData, 
  generatePaymentHistory, 
  generateReferralTree,
  generateRelativeTime
} from '../services/mockData';
import { AddNoteModal, BanUserModal } from './Modals';

// --- Sub-components & Types ---

type TabType = 'Overview' | 'Subscription' | 'Learning' | 'Referral' | 'Audit';

interface UserDetailProps {
  user: User;
  onBack: () => void;
  onUpdateStatus: (userId: string, status: UserStatus) => void;
}

// 1. Overview Tab Components
const NoteBubble: React.FC<{ 
  author: string; 
  time: string; 
  text: string; 
  isDeleted?: boolean; 
  onRestore?: () => void 
}> = ({ author, time, text, isDeleted, onRestore }) => (
  <div className={`p-3 rounded-lg border ${isDeleted ? 'bg-slate-900/50 border-slate-800 opacity-60' : 'bg-slate-800 border-slate-700'}`}>
    <div className="flex justify-between items-start mb-1">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-blue-900 text-blue-200 text-xs flex items-center justify-center font-bold">
          {author[0]}
        </div>
        <span className="text-xs text-slate-500">{time}</span>
      </div>
      {isDeleted && onRestore && (
        <button onClick={onRestore} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
          <RotateCcw size={10} /> Restore
        </button>
      )}
    </div>
    <p className="text-sm text-slate-300">{text}</p>
  </div>
);

// 2. Subscription Tab Components
const PermissionRow: React.FC<{ type: string; duration: string; reason: string; admin: string; time: string }> = ({ type, duration, reason, admin, time }) => (
  <tr className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/20">
    <td className="py-2 px-3 text-sm text-slate-200">{type}</td>
    <td className="py-2 px-3 text-sm text-slate-400">{duration}</td>
    <td className="py-2 px-3 text-sm text-slate-400 max-w-[150px] truncate" title={reason}>{reason}</td>
    <td className="py-2 px-3 text-sm text-slate-500">{admin}</td>
    <td className="py-2 px-3 text-sm text-slate-500 text-right">{time}</td>
  </tr>
);

// 3. Learning Tab Components
const Heatmap: React.FC = () => {
  const data = useMemo(() => generateHeatmapData(), []);
  // data is week[][day]
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <h3 className="text-sm font-semibold text-slate-200 mb-4">Learning Activity Heatmap</h3>
      <div className="flex gap-2 items-end overflow-x-auto pb-2">
        {/* Y Axis Labels */}
        <div className="flex flex-col gap-1 text-[10px] text-slate-500 pr-2 pb-[2px]">
          {['Mon', '', 'Wed', '', 'Fri', '', 'Sun'].map((d, i) => (
            <div key={i} className="h-3 leading-3">{d}</div>
          ))}
        </div>
        
        {/* Grid */}
        <div className="flex gap-1">
          {data.map((week, wIndex) => (
            <div key={wIndex} className="flex flex-col gap-1">
              {week.map((intensity, dIndex) => {
                let color = 'bg-slate-800/50';
                if (intensity === 1) color = 'bg-emerald-900';
                if (intensity === 2) color = 'bg-emerald-600';
                if (intensity === 3) color = 'bg-emerald-400';
                return (
                  <div 
                    key={`${wIndex}-${dIndex}`} 
                    className={`w-3 h-3 rounded-sm ${color} hover:ring-1 hover:ring-white/50 transition-all`}
                    title={`Activity level: ${intensity}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-slate-500 justify-end">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-slate-800/50" />
          <div className="w-3 h-3 rounded-sm bg-emerald-900" />
          <div className="w-3 h-3 rounded-sm bg-emerald-600" />
          <div className="w-3 h-3 rounded-sm bg-emerald-400" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

// 4. Growth Tab Components
const ReferralNodeView: React.FC<{ node: any; depth?: number }> = ({ node, depth = 0 }) => (
  <div className={`${depth > 0 ? 'ml-6 border-l border-slate-800 pl-4' : ''} mt-3`}>
    <div className="flex items-center gap-3 p-2 rounded bg-slate-800/30 border border-slate-800">
      <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
        {node.name[0]}
      </div>
      <span className="text-sm text-slate-200 font-medium">{node.name}</span>
      <Badge type="tier" value={node.tier} />
    </div>
    {node.children && node.children.map((child: any) => (
      <ReferralNodeView key={child.id} node={child} depth={depth + 1} />
    ))}
  </div>
);

// --- Main Component ---

export const UserDetail: React.FC<UserDetailProps> = ({ user, onBack, onUpdateStatus }) => {
  const [activeTab, setActiveTab] = useState<TabType>('Overview');
  const [showDeletedNotes, setShowDeletedNotes] = useState(false);
  const [auditFilter, setAuditFilter] = useState<string>('All');
  
  // Modals state
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  
  // Local notes state for demo
  const [extraNotes, setExtraNotes] = useState<Array<{text: string, time: string, author: string}>>([]);

  const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  // Mock Data Hooks
  const payments = useMemo(() => generatePaymentHistory(3), []);
  const auditLogs = useMemo(() => generateAuditLogs(), []);
  const referralTree = useMemo(() => generateReferralTree(), []);

  // Filter Audit Logs
  const filteredAuditLogs = useMemo(() => {
    if (auditFilter === 'All') return auditLogs;
    if (auditFilter === 'Permission Change') return auditLogs.filter(l => l.type === AuditEventType.PERMISSION);
    if (auditFilter === 'Impersonation') return auditLogs.filter(l => l.type === AuditEventType.IMPERSONATE);
    if (auditFilter === 'Status Change') return auditLogs.filter(l => l.type === AuditEventType.STATUS);
    return auditLogs;
  }, [auditLogs, auditFilter]);

  return (
    <div className="min-h-screen bg-slate-950 p-6 animate-in fade-in duration-300 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* --- Back & Title --- */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-2"
        >
          <ChevronLeft size={16} /> Back to User List
        </button>

        {/* --- A. User Profile Header --- */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-5">
            <div className={`h-20 w-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg ${user.avatarColor}`}>
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{user.name}</h1>
              <p className="text-slate-500 text-sm mb-3 font-mono">{user.email}</p>
              <div className="flex gap-2">
                <Badge type="tier" value={user.tier} />
                <Badge type="status" value={user.status} />
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-600/50 text-amber-500 hover:bg-amber-950/30 transition-colors text-sm font-medium">
              <UserIcon size={16} /> Impersonate
            </button>
            {user.status !== UserStatus.BANNED ? (
              <button 
                onClick={() => setShowBanModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-600/50 text-red-500 hover:bg-red-950/30 transition-colors text-sm font-medium"
              >
                <Ban size={16} /> Ban User
              </button>
            ) : (
              <button 
                onClick={() => onUpdateStatus(user.id, UserStatus.ACTIVE)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-600/50 text-emerald-500 hover:bg-emerald-950/30 transition-colors text-sm font-medium"
              >
                <CheckCircle size={16} /> Unban User
              </button>
            )}
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-600 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors text-sm font-medium">
              <Key size={16} /> Reset Password
            </button>
          </div>
        </div>

        {/* --- B. Tab Navigation --- */}
        <div className="border-b border-slate-800">
          <div className="flex gap-8">
            {['Overview', 'Subscription', 'Learning', 'Referral', 'Audit'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as TabType)}
                className={`pb-3 px-1 text-sm font-medium transition-all relative ${
                  activeTab === tab 
                    ? 'text-blue-400' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* --- C. Tab Content --- */}
        <div className="min-h-[400px]">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'Overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Left Column (60% -> col-span-3) */}
              <div className="lg:col-span-3 space-y-6">
                {/* Identity Info */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                    <UserIcon size={16} className="text-slate-500" /> Identity Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-slate-800/50 pb-2">
                      <span className="text-sm text-slate-500">Registration Date</span>
                      <span className="text-sm text-slate-200 font-mono">{new Date(user.joinDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/50 pb-2">
                      <span className="text-sm text-slate-500">Education</span>
                      <span className="text-sm text-slate-200">{user.grade} at {user.school}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/50 pb-2">
                      <span className="text-sm text-slate-500">Source</span>
                      <span className="text-sm text-slate-200">{user.joinSource}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/50 pb-2">
                      <span className="text-sm text-slate-500">Phone</span>
                      <span className="text-sm text-slate-200 font-mono">{user.phone}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-sm text-slate-500">Last Login IP</span>
                      <span className="text-sm text-slate-200 font-mono">192.168.43.21</span>
                    </div>
                  </div>
                </div>

                {/* Security Info */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                    <Shield size={16} className="text-slate-500" /> Security Status
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <div className="text-xs text-slate-500 mb-1">Last Login</div>
                      <div className="text-sm text-white font-medium">{generateRelativeTime(1).label}</div>
                      <div className="text-xs text-slate-600 mt-1 font-mono">US-West-1</div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <div className="text-xs text-slate-500 mb-1">Active Devices</div>
                      <div className="text-sm text-white font-medium flex items-center gap-2">
                        {user.activeDeviceCount} Devices
                        <Smartphone size={14} className="text-blue-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (40% -> col-span-2) */}
              <div className="lg:col-span-2">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 h-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-slate-200">Internal Notes</h3>
                    <button 
                      onClick={() => setShowNoteModal(true)}
                      className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="space-y-3">
                    {extraNotes.map((note, i) => (
                      <NoteBubble key={i} author={note.author} time={note.time} text={note.text} />
                    ))}
                    <NoteBubble author="Mike" time="2 days ago" text="User complained about API limits. Extended trial." />
                    <NoteBubble author="Sarah" time="1 month ago" text="Verified enterprise intent. Contact sales." />
                    
                    {showDeletedNotes && (
                      <NoteBubble 
                        author="Bot" 
                        time="3 months ago" 
                        text="Automated flag: multiple failed login attempts." 
                        isDeleted 
                        onRestore={() => {}}
                      />
                    )}
                  </div>
                  <button 
                    onClick={() => setShowDeletedNotes(!showDeletedNotes)}
                    className="mt-4 text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2"
                  >
                    {showDeletedNotes ? 'Hide deleted notes' : 'View deleted notes (1)'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUBSCRIPTION */}
          {activeTab === 'Subscription' && (
            <div className="max-w-3xl space-y-6">
              {/* Current Sub */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <CreditCard size={120} className="text-white" />
                </div>
                <div className="relative z-10">
                  <div className="mb-4">
                    <Badge type="tier" value={user.tier} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Duration</div>
                      <div className="text-slate-200 text-sm font-mono">Oct 24, 2023 - Oct 24, 2024</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Auto-Renew</div>
                      <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                        <div className="w-8 h-4 bg-emerald-900/50 rounded-full relative border border-emerald-800">
                          <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-emerald-500 rounded-full shadow-sm"></div>
                        </div>
                        ON
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Remaining</div>
                      <div className="text-blue-400 text-sm font-bold">18 Days</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-slate-200">Permission Overrides</h3>
                  <button className="text-xs border border-blue-600 text-blue-500 px-3 py-1.5 rounded hover:bg-blue-950/30 transition-colors">
                    Grant Permission
                  </button>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase">
                      <th className="px-3 py-2 font-medium">Type</th>
                      <th className="px-3 py-2 font-medium">Duration</th>
                      <th className="px-3 py-2 font-medium">Reason</th>
                      <th className="px-3 py-2 font-medium">Admin</th>
                      <th className="px-3 py-2 font-medium text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <PermissionRow type="Extended Trial" duration="7 Days" reason="Support Ticket #992" admin="Sarah" time="2h ago" />
                    <PermissionRow type="Feature Unlock" duration="Permanent" reason="Beta Tester Program" admin="Mike" time="3mo ago" />
                  </tbody>
                </table>
              </div>

              {/* Payments */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                 <h3 className="text-sm font-semibold text-slate-200 mb-4">Payment History</h3>
                 <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase">
                      <th className="px-3 py-2 font-medium">Date</th>
                      <th className="px-3 py-2 font-medium">Amount</th>
                      <th className="px-3 py-2 font-medium">Type</th>
                      <th className="px-3 py-2 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p.id} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/20">
                        <td className="py-3 px-3 text-sm text-slate-300 font-mono">{p.date}</td>
                        <td className="py-3 px-3 text-sm text-white font-medium">${p.amount}.00</td>
                        <td className="py-3 px-3 text-sm text-slate-400">{p.type}</td>
                        <td className="py-3 px-3 text-sm text-right">
                          <span className={`px-2 py-0.5 rounded text-xs ${p.status === 'Success' ? 'text-emerald-400 bg-emerald-950/30' : 'text-red-400 bg-red-950/30'}`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                 </table>
              </div>
            </div>
          )}

          {/* TAB 3: LEARNING */}
          {activeTab === 'Learning' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Col (55% rough) */}
              <div className="space-y-6">
                {/* 2x2 Stats */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Total Questions', val: user.learningStats.totalQuestions },
                    { label: 'Accuracy', val: `${user.learningStats.accuracy}%` },
                    { label: 'Mistakes Log', val: user.learningStats.mistakes },
                    { label: 'Days Active', val: user.learningStats.daysActive }
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col items-center justify-center text-center">
                      <div className="text-2xl font-bold text-white mb-1">{stat.val}</div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Vertical Timeline */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-slate-200 mb-6">Recent Activity Timeline</h3>
                  <div className="space-y-6 pl-2">
                    {[
                      { type: 'Login', color: 'bg-blue-500', time: '10 min ago' },
                      { type: 'Quiz Completed', color: 'bg-emerald-500', time: '45 min ago' },
                      { type: 'Mistake Review', color: 'bg-amber-500', time: '2 hours ago' },
                    ].map((evt, i) => (
                      <div key={i} className="relative flex gap-4">
                         {i !== 2 && <div className="absolute left-[5px] top-4 bottom-[-34px] w-px bg-slate-800" />}
                         <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${evt.color} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
                         <div className="flex-1 flex justify-between">
                            <span className="text-sm text-slate-200">{evt.type}</span>
                            <span className="text-xs text-slate-500">{evt.time}</span>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Col: Heatmap */}
              <div>
                <Heatmap />
              </div>
            </div>
          )}

          {/* TAB 4: GROWTH -> Changed to Referral */}
          {activeTab === 'Referral' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stats Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col justify-center gap-8">
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">My Referral Code</div>
                  <div className="flex items-center gap-3">
                     <code className="bg-slate-950 border border-slate-800 px-3 py-2 rounded text-lg font-mono text-emerald-400 tracking-widest">
                       REF-MK-2024
                     </code>
                     <button className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
                       <Copy size={18} />
                     </button>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Total Invites</div>
                  <div className="text-4xl font-bold text-white">42</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Rewards Earned</div>
                  <div className="text-xl font-medium text-slate-200">
                    <span className="text-white font-bold">3</span> months / <span className="text-white font-bold">$45</span> credit
                  </div>
                </div>
              </div>

              {/* Referral Tree */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 min-h-[400px]">
                <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <GitCommit size={16} className="text-slate-500" /> Referral Network
                </h3>
                <div className="pl-2">
                  <div className="flex items-center gap-3 p-2 rounded bg-slate-800/60 border border-blue-500/30 mb-2">
                    <div className="w-6 h-6 rounded-full bg-blue-900 flex items-center justify-center text-xs font-bold text-blue-200">
                      You
                    </div>
                    <span className="text-sm text-white font-medium">{referralTree.name}</span>
                    <Badge type="tier" value={referralTree.tier} />
                  </div>
                  {/* Render children */}
                  {referralTree.children?.map(child => (
                    <ReferralNodeView key={child.id} node={child} depth={1} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT */}
          {activeTab === 'Audit' && (
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
                  {filteredAuditLogs.map((log, i) => {
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
                            <span className="text-xs text-slate-500 font-mono">{log.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {log.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
      
      {/* Modals */}
      <BanUserModal 
        isOpen={showBanModal}
        userName={user.name}
        onClose={() => setShowBanModal(false)}
        onConfirm={(duration, reason) => {
          console.log(`Banning user ${user.id} for ${duration} because: ${reason}`);
          onUpdateStatus(user.id, UserStatus.BANNED);
        }}
      />

      <AddNoteModal 
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        onSave={(text) => {
          setExtraNotes(prev => [{text, time: 'Just now', author: 'You'}, ...prev]);
        }}
      />
    </div>
  );
};