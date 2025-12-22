'use client'

import React, { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/labeled-input';
import { useApp } from '@/providers/app-provider'; // Import Context
import { updateProfile } from '@/actions/profile';
import { updateAIConfig } from '@/actions/settings';
import { logoutAction } from '@/actions/auth';
import { generateInviteCode } from '@/actions/parent';
import {
  User, Shield, Brain, CreditCard, Camera,
  Bot, Glasses, ClipboardList, Link as LinkIcon, Copy,
  Moon, Sun, LogOut, CheckCircle2, Globe
} from 'lucide-react';

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" disabled={pending}>
      {pending ? '保存中...' : children}
    </Button>
  );
}

type TabId = 'profile' | 'account' | 'ai-config' | 'subscription';

const initialState = { error: undefined, success: undefined };

type UserProfile = {
  id: string;
  email: string;
  username: string | null;
  avatar: string | null;
  grade: number | null;
  role: string;
  settings: {
    aiPersonality?: string | null;
    difficultyCalibration?: number | null;
  } | null;
};

type SettingsViewProps = {
  user?: UserProfile | null;
};

export const SettingsView = ({ user }: SettingsViewProps) => {
  const { t, lang, setLang, theme, toggleTheme } = useApp(); // Use global state
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize AI settings from user data
  const initialAiPersonality = (user?.settings?.aiPersonality?.toLowerCase() as 'encouraging' | 'socratic' | 'strict') || 'encouraging';
  const initialDifficulty = user?.settings?.difficultyCalibration || 60;

  const [selectedTutor, setSelectedTutor] = useState<'encouraging' | 'socratic' | 'strict'>(initialAiPersonality);
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  // Form states
  const [profileState, profileAction] = useFormState(updateProfile, initialState);
  const [aiConfigState, aiConfigAction] = useFormState(updateAIConfig, initialState);

  const menuItems = [
    { id: 'profile', label: t.settings.tabs.profile, icon: User },
    { id: 'ai-config', label: t.settings.tabs.aiConfig, icon: Brain },
    { id: 'account', label: t.settings.tabs.account, icon: Shield },
    { id: 'subscription', label: t.settings.tabs.subscription, icon: CreditCard },
  ];

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    const result = await generateInviteCode();
    if (result.success && result.code) {
      setInviteCode(result.code);
    } else {
      alert(result.error || 'Failed to generate code.');
    }
    setIsGenerating(false);
  };

  const copyCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      alert('Code copied to clipboard!');
    }
  };

  const renderSidebar = () => (
    <div className="w-full lg:w-72 flex flex-col gap-2 lg:border-r border-slate-200 dark:border-slate-800 pr-0 lg:pr-8 mb-8 lg:mb-0 shrink-0">
      <div className="mb-4 px-2 hidden lg:block">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t.sidebar.settings}</h3>
        <p className="text-xs text-slate-500">{t.settings.managePrefs}</p>
      </div>
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id as TabId)}
          className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all text-sm font-bold ${
            activeTab === item.id 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <item.icon className="w-5 h-5" />
          {item.label}
        </button>
      ))}
      
      <div className="mt-auto pt-8 border-t border-slate-200 dark:border-slate-800">
        <form action={logoutAction}>
          <button type="submit" className="flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 w-full transition-colors">
            <LogOut className="w-5 h-5" />
            {t.sidebar.logout}
          </button>
        </form>
      </div>
    </div>
  );

  const renderProfileContent = () => (
    <form action={profileAction} className="space-y-8 animate-fade-in-up w-full">
      {/* Cover Image & Header */}
      <div className="relative h-48 rounded-t-3xl bg-gradient-to-r from-blue-600 to-indigo-600 overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
         <div className="absolute bottom-4 right-4">
            <Button type="button" size="sm" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md">
               <Camera className="w-4 h-4 mr-2" /> {t.common.edit} Cover
            </Button>
         </div>
      </div>

      <div className="px-8 relative -mt-16 pb-4 border-b border-slate-200 dark:border-slate-800">
         <div className="flex flex-col md:flex-row items-end md:items-center gap-6">
            <div className="relative group cursor-pointer">
               <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 shadow-xl">
                  <img src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=400&auto=format&fit=crop" alt="Avatar" className="w-full h-full object-cover" />
               </div>
               <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
               </div>
            </div>
            <div className="flex-1 mb-2">
               <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                 {user?.username || user?.email || 'User'}
               </h2>
               <p className="text-slate-500">
                 {user?.grade ? `Grade ${user.grade}` : 'Student'} • Science Stream
               </p>
            </div>
            <div className="flex gap-3 mb-2">
               <SubmitButton>{t.settings.profile.save}</SubmitButton>
            </div>
         </div>
      </div>

      {/* Success/Error Messages */}
      {profileState.success && (
        <div className="px-8">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl">
            保存成功!
          </div>
        </div>
      )}
      {profileState.error && (
        <div className="px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl">
            {profileState.error}
          </div>
        </div>
      )}

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
         <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
               <User className="w-5 h-5 text-blue-500" /> {t.settings.profile.displayName}
            </h3>
            <div className="space-y-4">
               <Input
                 label={t.settings.profile.displayName}
                 name="username"
                 defaultValue={user?.username || ''}
                 className="bg-white dark:bg-slate-800"
               />
               <Input
                 label="Grade (7-9)"
                 name="grade"
                 type="number"
                 min="7"
                 max="9"
                 defaultValue={user?.grade?.toString() || ''}
                 className="bg-white dark:bg-slate-800"
               />
            </div>
         </div>

         <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
               <Shield className="w-5 h-5 text-purple-500" /> Contact & Privacy
            </h3>
            <div className="space-y-4">
               <Input label="Email Address" defaultValue="alex@student.com" disabled className="bg-slate-100 dark:bg-slate-800/50 opacity-70" />
            </div>
         </div>
      </div>

      {/* Preferences Section */}
      <div className="px-4 pt-8 border-t border-slate-200 dark:border-slate-800">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">偏好设置</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Theme Card */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Moon className="w-4 h-4" /> {t.settings.preferences.theme}
            </h4>
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300">
                  {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{t.settings.preferences.darkMode}</div>
                  <div className="text-xs text-slate-500">{theme === 'dark' ? 'On' : 'Off'}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className={`w-14 h-8 rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>
          </div>

          {/* Language Card */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4" /> {t.settings.preferences.language}
            </h4>
            <div className="space-y-2">
              {[
                { id: 'en', label: 'English', icon: '🇺🇸' },
                { id: 'zh', label: '中文 (Chinese)', icon: '🇨🇳' },
                { id: 'ms', label: 'Bahasa Melayu', icon: '🇲🇾' },
              ].map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLang(l.id as 'en' | 'zh' | 'ms')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                    lang === l.id
                    ? 'bg-white dark:bg-slate-800 border-blue-500 shadow-md ring-1 ring-blue-500'
                    : 'bg-transparent border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl">{l.icon}</span>
                    <span className={`font-medium text-sm ${lang === l.id ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{l.label}</span>
                  </span>
                  {lang === l.id && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </form>
  );

  const renderAIConfigContent = () => (
    <form action={aiConfigAction} className="space-y-8 animate-fade-in-up w-full">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t.settings.ai.header}</h2>
          <p className="text-slate-500 text-base">{t.settings.ai.desc}</p>
        </div>
        <SubmitButton>保存配置</SubmitButton>
      </div>

      {/* Success/Error Messages */}
      {aiConfigState.success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl">
          AI配置保存成功!
        </div>
      )}
      {aiConfigState.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl">
          {aiConfigState.error}
        </div>
      )}

      {/* Personality Selector */}
      <section>
        <div className="flex justify-between items-center mb-6">
           <label className="text-lg font-bold text-slate-900 dark:text-white">{t.settings.ai.tutorStyle}</label>
           <span className="text-xs font-bold bg-blue-500/10 text-blue-500 px-2 py-1 rounded">Current: {selectedTutor.charAt(0).toUpperCase() + selectedTutor.slice(1)}</span>
        </div>

        {/* Hidden input for form submission */}
        <input type="hidden" name="aiPersonality" value={selectedTutor.toUpperCase()} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { id: 'encouraging', label: 'Encouraging', desc: 'Warm, patient, and celebrates every small win.', icon: Bot, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500' },
            { id: 'socratic', label: 'Socratic', desc: 'Answers with questions. Pushes you to think deeper.', icon: Glasses, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500' },
            { id: 'strict', label: 'Strict Coach', desc: 'No fluff. High standards. Optimization focused.', icon: ClipboardList, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500' },
          ].map((tutor) => (
            <div 
              key={tutor.id}
              onClick={() => setSelectedTutor(tutor.id as 'encouraging' | 'socratic' | 'strict')}
              className={`relative p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 group hover:-translate-y-1 h-full flex flex-col ${
                selectedTutor === tutor.id 
                  ? `${tutor.border} bg-slate-900/50 dark:bg-slate-800/50 shadow-xl` 
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/20 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {selectedTutor === tutor.id && (
                <div className={`absolute top-4 right-4 w-6 h-6 rounded-full ${tutor.bg} flex items-center justify-center`}>
                  <CheckCircle2 className={`w-4 h-4 ${tutor.color}`} />
                </div>
              )}
              <div className={`w-14 h-14 rounded-2xl ${tutor.bg} flex items-center justify-center mb-6`}>
                <tutor.icon className={`w-7 h-7 ${tutor.color}`} />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{tutor.label}</h4>
              <p className="text-sm text-slate-500 leading-relaxed flex-1">{tutor.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-200 dark:border-slate-800">
         {/* Difficulty Slider */}
         <section className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 h-full">
           <div className="flex justify-between items-center mb-6">
              <label className="text-base font-bold text-slate-700 dark:text-slate-300">{t.settings.ai.difficulty}</label>
              <span className="text-sm font-mono text-blue-500 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">
                {difficulty < 30 ? 'Foundational' : difficulty < 70 ? 'Proficient' : 'Olympiad'}
              </span>
           </div>
           <div className="relative py-4 px-2">
               <input
                 name="difficultyCalibration"
                 type="range"
                 min="0"
                 max="100"
                 value={difficulty}
                 onChange={(e) => setDifficulty(parseInt(e.target.value))}
                 className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-600"
               />
               <div className="flex justify-between text-xs text-slate-400 mt-4 font-bold uppercase tracking-wider">
                  <span>Standard</span>
                  <span>Advanced</span>
                  <span>Challenge</span>
               </div>
           </div>
         </section>

         {/* Curriculum */}
         <section className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 h-full flex flex-col">
            <label className="block text-base font-bold text-slate-700 dark:text-slate-300 mb-4">{t.settings.ai.curriculum}</label>
            <div className="relative mb-4">
               <select className="w-full p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer text-base font-medium">
                  <option>IGCSE (Cambridge International)</option>
                  <option>IGCSE (Edexcel)</option>
                  <option>UEC (Junior Middle)</option>
                  <option>UEC (Senior Middle)</option>
                  <option>SPM (KSSM)</option>
               </select>
            </div>
         </section>
      </div>
    </form>
  );

  const renderAccountContent = () => (
    <div className="space-y-8 animate-fade-in-up w-full">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t.settings.account.header}</h2>
        <p className="text-slate-500 text-base">{t.settings.managePrefs}</p>
      </div>

      {/* Parent Connection Widget - Only for Students */}
      {user?.role === 'STUDENT' && (
        <Card className="p-8 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/30 overflow-hidden relative">
           <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
              <div className="flex-1">
                 <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.settings.account.parentConnect}</h3>
                    {!inviteCode ? (
                       <span className="flex items-center gap-1.5 text-xs bg-red-500/10 text-red-500 px-3 py-1 rounded-full border border-red-500/20 font-bold">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span> Not Connected
                       </span>
                    ) : (
                       <span className="flex items-center gap-1.5 text-xs bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full border border-yellow-500/20 font-bold">
                          <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span> Waiting for Parent
                       </span>
                    )}
                 </div>
                 <p className="text-base text-slate-500 max-w-lg leading-relaxed">
                    Link a parent account to sync progress reports and unlock premium parental controls. Parents can view activity in real-time.
                 </p>
              </div>

              {inviteCode ? (
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-center min-w-[280px] animate-fade-in-up shadow-xl">
                    <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-bold">{t.settings.account.inviteCode}</div>
                    <div className="text-4xl font-mono font-bold text-indigo-500 mb-4 tracking-widest">{inviteCode}</div>
                    <Button size="md" variant="ghost" className="w-full" onClick={copyCode}>
                       <Copy className="w-4 h-4 mr-2" /> Copy Code
                    </Button>
                 </div>
              ) : (
                 <Button onClick={handleGenerateCode} disabled={isGenerating} size="lg" variant="glow" className="shrink-0 bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20 border-none px-8">
                    <LinkIcon className="w-5 h-5 mr-2" /> {isGenerating ? 'Generating...' : 'Generate Invite Code'}
                 </Button>
              )}
           </div>
        </Card>
      )}
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full min-h-full">
      {renderSidebar()}

      <div className="flex-1 w-full flex flex-col">
        <Card className="flex-1 w-full p-6 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl">
           {activeTab === 'profile' && renderProfileContent()}
           {activeTab === 'ai-config' && renderAIConfigContent()}
           {activeTab === 'account' && renderAccountContent()}
           {activeTab === 'subscription' && (
              <div className="text-center py-20 animate-fade-in-up">
                 <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CreditCard className="w-10 h-10 text-slate-400" />
                 </div>
                 <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Manage Subscription</h2>
                 <Button variant="outline" size="lg">View Billing History</Button>
              </div>
           )}
        </Card>
      </div>
    </div>
  );
};
