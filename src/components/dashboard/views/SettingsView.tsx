/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { User, Bell } from 'lucide-react';

interface SettingsViewProps {
  t: Record<string, unknown>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ t }) => (
  <div className="animate-fade-in-up max-w-3xl">
     <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{t.settings}</h2>
     
     <div className="space-y-6">
        <Card className="p-6 bg-white dark:bg-slate-800">
           <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><User className="w-5 h-5" /> Profile Settings</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-500">Display Name</label>
                 <input type="text" defaultValue="Alex Student" className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700" />
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-500">Email</label>
                 <input type="email" defaultValue="alex@example.com" className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700" />
              </div>
           </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-800">
           <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Bell className="w-5 h-5" /> Notifications</h3>
           <div className="space-y-4">
              {['Daily Study Reminders', 'New Assignments', 'Community Replies', 'Achievement Unlocks'].map(setting => (
                 <div key={setting} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{setting}</span>
                    <div className="w-10 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                       <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                 </div>
              ))}
           </div>
        </Card>
     </div>
  </div>
);