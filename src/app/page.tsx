'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LandingPageNavbar } from '@/components/layout/LandingPageNavbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Brain, Zap, ArrowRight, Target, 
  PenTool, Calculator, FlaskConical, Atom, Languages, CheckCircle2
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [supabaseStatus, setSupabaseStatus] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.getSession();
        if (error) {
          console.error('Supabase connection error:', error.message);
          setSupabaseStatus(`Supabase connection failed: ${error.message}`);
        } else {
           // Connection successful, no need to clutter UI unless user wants to see it
           // console.log(`Supabase connected. User: ${data.session?.user?.email || 'None'}`);
        }
      } catch (err: unknown) {
        let errorMessage = "An unknown error occurred";
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === "object" && err !== null && "message" in err) {
          errorMessage = (err as { message: string }).message;
        }
        setSupabaseStatus(`Supabase error: ${errorMessage}`);
      }
    };
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden font-sans selection:bg-blue-500/30 selection:text-blue-100">
      <LandingPageNavbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 max-w-7xl mx-auto flex flex-col items-center text-center">
        
        {/* Abstract Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"></div>
        </div>

        <div className="relative z-10 animate-fade-in-up max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 hover:bg-white/10 transition-colors cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-medium tracking-wide text-slate-300">New Curriculum Updated for 2025</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">
            Master Middle School<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400">With Confidence.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 leading-relaxed mb-10">
            A comprehensive learning ecosystem for Grades 7-9. Expert video lessons, AI-powered practice, and personalized roadmap to high school success.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Button size="xl" variant="glow" onClick={() => router.push('/register')} className="min-w-[200px] h-14 text-lg">
              Start Free Trial
            </Button>
            <Button size="xl" variant="secondary" onClick={() => router.push('/login')} className="min-w-[200px] h-14 text-lg group bg-white/5 hover:bg-white/10 text-white border-white/10">
              View Syllabus <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" /> <span>Aligned to Curriculum</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" /> <span>Expert Teachers</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" /> <span>Data-Driven</span>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section (Bento Grid) */}
      <section className="py-24 px-4 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-sm font-semibold tracking-widest text-blue-400 uppercase mb-2">Platform Features</h2>
            <p className="text-3xl md:text-4xl font-bold tracking-tight text-white">Engineered for Academic Excellence.</p>
          </div>
          <p className="text-slate-400 max-w-sm text-sm leading-relaxed">
            We combine cognitive science with modern technology to create the most effective learning experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">
          
          {/* Main Card: 6 Subjects */}
          <Card className="md:col-span-4 lg:col-span-2 lg:row-span-2 relative overflow-hidden group border-white/5 bg-[#0a0a0a] hover:bg-[#0f0f0f] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardContent className="h-full flex flex-col justify-between p-8 relative z-10">
              <div className="grid grid-cols-2 gap-4 mb-8">
                 {[
                   { name: 'Math', icon: Calculator, color: 'text-blue-400', bg: 'bg-blue-900/20' },
                   { name: 'Physics', icon: Atom, color: 'text-purple-400', bg: 'bg-purple-900/20' },
                   { name: 'Chemistry', icon: FlaskConical, color: 'text-green-400', bg: 'bg-green-900/20' },
                   { name: 'English', icon: Languages, color: 'text-pink-400', bg: 'bg-pink-900/20' },
                 ].map((sub, i) => (
                   <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className={`p-2 rounded-lg ${sub.bg}`}>
                        <sub.icon className={`w-4 h-4 ${sub.color}`} />
                      </div>
                      <span className="text-sm font-medium text-slate-200">{sub.name}</span>
                   </div>
                 ))}
                 <div className="col-span-2 text-center text-xs text-slate-500 mt-2">+ Biology & Chinese</div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 text-white">6 Core Subjects</h3>
                <p className="text-slate-400 text-sm">Comprehensive coverage of the middle school curriculum. Every chapter, every theorem, explained.</p>
              </div>
            </CardContent>
          </Card>

          {/* Feature: Question Bank */}
          <Card className="md:col-span-3 lg:col-span-1 relative overflow-hidden group border-white/5 bg-[#0a0a0a] hover:bg-[#0f0f0f] transition-all">
             <CardContent className="h-full flex flex-col justify-center p-8">
               <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition-transform">
                 <PenTool className="w-6 h-6" />
               </div>
               <h3 className="text-lg font-bold mb-2 text-white">Smart Question Bank</h3>
               <p className="text-sm text-slate-400">Adaptive difficulty levels. From basics to Olympiad level problems.</p>
             </CardContent>
          </Card>

          {/* Feature: Gamification */}
          <Card className="md:col-span-3 lg:col-span-1 relative overflow-hidden group border-white/5 bg-[#0a0a0a] hover:bg-[#0f0f0f] transition-all">
             <CardContent className="h-full flex flex-col justify-center p-8">
               <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center mb-6 text-yellow-400 group-hover:scale-110 transition-transform">
                 <Target className="w-6 h-6" />
               </div>
               <h3 className="text-lg font-bold mb-2 text-white">Gamified Growth</h3>
               <p className="text-sm text-slate-400">Earn XP, level up, and unlock achievements to stay motivated.</p>
             </CardContent>
          </Card>

          {/* Feature: Analytics */}
          <Card className="md:col-span-6 lg:col-span-2 relative overflow-hidden group border-white/5 bg-[#0a0a0a] hover:bg-[#0f0f0f] transition-all">
             <div className="absolute right-0 bottom-0 opacity-20 w-32 h-32 bg-gradient-to-tl from-emerald-500 to-transparent blur-3xl"></div>
             <CardContent className="h-full flex flex-col sm:flex-row items-center gap-8 p-8">
               <div className="flex-1">
                 <h3 className="text-xl font-bold mb-2 text-white">Knowledge Graph</h3>
                 <p className="text-sm text-slate-400 mb-4">Visualise your weak points. Our AI analyzes your quiz performance to recommend specific revision topics.</p>
                 <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                   <Zap className="w-3 h-3" /> Data-Driven Insights
                 </span>
               </div>
               <div className="w-full sm:w-1/3 aspect-square bg-white/5 rounded-full border border-white/10 flex items-center justify-center relative">
                  <div className="absolute inset-2 border border-white/5 rounded-full"></div>
                  <Brain className="w-12 h-12 text-slate-500" />
               </div>
             </CardContent>
          </Card>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-20 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: 'Active Students', value: '50k+' },
            { label: 'Questions Solved', value: '1.2M+' },
            { label: 'Video Lessons', value: '8,000+' },
            { label: 'Avg Grade Boost', value: '25%' },
          ].map((stat, i) => (
            <div key={i} className="space-y-2">
              <div className="text-4xl lg:text-5xl font-bold text-white tracking-tight">{stat.value}</div>
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative text-center px-4">
        <div className="absolute inset-0 bg-gradient-to-t from-[#050a1f] to-transparent pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-white">Ready to improve your grades?</h2>
          <p className="text-lg text-slate-400 mb-10">Join the platform that helps you learn smarter, not harder.</p>
          <Button size="xl" variant="glow" onClick={() => router.push('/register')} className="px-12 py-6 text-lg shadow-xl shadow-blue-900/20">
            Get Started for Free
          </Button>
          <p className="mt-6 text-xs text-slate-600">No credit card required. Free 7-day trial for Pro features.</p>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-8 border-t border-white/5 text-center text-sm text-slate-600 bg-black">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2025 LearnMore Edu. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Contact</a>
          </div>
        </div>
        {/* Developer Info Area - Hidden unless there's an error */}
        {supabaseStatus && (
           <div className="mt-4 text-xs text-red-500 bg-red-950/20 py-1">{supabaseStatus}</div>
        )}
        <div className="mt-4 text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer" onClick={() => router.push('/demo/course-tree')}>
            [Dev] View Component Demos
        </div>
      </footer>
    </div>
  );
}