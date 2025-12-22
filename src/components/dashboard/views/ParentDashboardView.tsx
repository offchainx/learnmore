'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Users, UserPlus, Clock, BookOpen, Target,
  TrendingUp, Award, Calendar, ChevronRight,
  AlertCircle, CheckCircle2, Sparkles
} from 'lucide-react'
import { getLinkedStudents, bindStudent, getStudentStats } from '@/actions/parent'
import { toast } from '@/components/ui/use-toast'
import { formatDistanceToNow } from 'date-fns'

interface Student {
  id: string
  username: string | null
  email: string
  avatar: string | null
  grade: number | null
}

export const ParentDashboardView = () => {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [studentStats, setStudentStats] = useState<{
    student: { username: string | null; totalStudyTime: number; xp: number; streak: number; grade: number | null } | null;
    stats: { completedLessons: number; totalStudyTime: number; xp: number; streak: number; errorCount: number; accuracy: number };
    recentActivities: Array<{ id: string; type: string; title: string; subtitle: string; time: Date; result: string }>;
  } | null>(null)
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [binding, setBinding] = useState(false)

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const linked = await getLinkedStudents()
      setStudents(linked || [])
      if (linked && linked.length > 0) {
        setSelectedStudentId(linked[0].id)
      }
    } catch (err) {
      console.error('Error fetching students:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    if (selectedStudentId) {
      loadStudentStats(selectedStudentId)
    }
  }, [selectedStudentId])

  const loadStudentStats = async (id: string) => {
    setStudentStats(null) 
    try {
      // Direct call to server action
      const stats = await getStudentStats(id)
      if (stats) {
        setStudentStats(stats)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
      toast({ title: 'Error', description: 'Could not connect to server.', variant: 'destructive' })
    }
  }

  const handleBind = async () => {
    if (!inviteCode) return
    setBinding(true)
    const result = await bindStudent(inviteCode)
    if (result.success) {
      toast({ title: 'Success', description: 'Student linked successfully!' })
      setInviteCode('')
      fetchStudents()
    } else {
      toast({ title: 'Error', description: result.error || 'Failed to bind student.', variant: 'destructive' })
    }
    setBinding(false)
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Loading parent dashboard...</div>

  // Empty state: No students linked
  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-fade-in">
        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
          <Users className="w-10 h-10 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome, Parent!</h2>
        <p className="text-slate-500 mb-8 max-w-md">
          Link your child&apos;s account to start monitoring their learning progress and achievements.
        </p>
        <Card className="w-full max-w-sm p-6 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl">
          <h3 className="text-sm font-semibold mb-4 text-left">Enter Child&apos;s Invite Code</h3>
          <div className="flex gap-2">
            <Input 
              placeholder="e.g. AB12CD" 
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="uppercase font-mono tracking-widest"
              maxLength={6}
            />
            <Button onClick={handleBind} disabled={binding}>
              {binding ? 'Linking...' : 'Link'}
            </Button>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 text-left">
            Ask your child to generate a code in their dashboard settings.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in-up pb-12">
      {/* Parent Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            Parent Dashboard
            <span className="text-xs font-normal px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full border border-blue-500/20">Read-Only</span>
          </h2>
          <p className="text-slate-500">Monitoring your children&apos;s academic growth</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={() => { /* Modal for binding another child */ }}>
             <UserPlus className="w-4 h-4 mr-2" /> Add Child
           </Button>
        </div>
      </div>

      {/* Child Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {students.map(student => (
          <button
            key={student.id}
            onClick={() => setSelectedStudentId(student.id)}
            className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all ${
              selectedStudentId === student.id
              ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-transparent shadow-lg'
              : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-blue-500/50'
            }`}
          >
            <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200">
               <img src={student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`} alt={student.username || ''} />
            </div>
            <span className="text-sm font-bold">{student.username}</span>
          </button>
        ))}
      </div>

      {studentStats ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Stats Cards (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <StatCard 
                icon={<Clock className="text-blue-500" />} 
                label="Study Time" 
                value={`${Math.round((studentStats.stats?.totalStudyTime || 0) / 3600)}h`}
                subtitle="This Week"
               />
               <StatCard 
                icon={<BookOpen className="text-green-500" />} 
                label="Lessons" 
                value={studentStats.stats?.completedLessons || 0}
                subtitle="Completed"
               />
               <StatCard 
                icon={<Target className="text-orange-500" />} 
                label="Accuracy" 
                value={`${studentStats.stats?.accuracy || 0}%`}
                subtitle="Quiz Average"
               />
               <StatCard 
                icon={<TrendingUp className="text-purple-500" />} 
                label="Streak" 
                value={`${studentStats.stats?.streak || 0}d`}
                subtitle="Continuous"
               />
            </div>

            {/* Recent Activity Timeline */}
            <Card className="p-6 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" /> Recent Activity
                  </h3>
               </div>
               <div className="space-y-6">
                  {studentStats.recentActivities?.map((act) => (
                    <div key={act.id} className="flex gap-4 group">
                       <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                            act.result === 'correct' ? 'border-green-500/50 bg-green-500/10 text-green-500' : 'border-orange-500/50 bg-orange-500/10 text-orange-500'
                          }`}>
                             {act.result === 'correct' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 w-0.5 bg-slate-200 dark:bg-slate-700 my-1 group-last:hidden"></div>
                       </div>
                       <div className="pb-6 flex-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                          <div className="flex justify-between items-start mb-1">
                             <h4 className="text-sm font-bold">{act.title}</h4>
                             <span className="text-[10px] text-slate-400">{act.time ? formatDistanceToNow(new Date(act.time)) : 'Unknown time'} ago</span>
                          </div>
                          <p className="text-xs text-slate-500">{act.subtitle}</p>
                       </div>
                    </div>
                  ))}
                  {(!studentStats.recentActivities || studentStats.recentActivities.length === 0) && (
                    <p className="text-center text-slate-500 py-4 text-sm">No recent activity found.</p>
                  )}
               </div>
            </Card>
          </div>

          {/* Right Column: Sidebar Widgets (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
             {/* Progress Summary Card */}
             <Card className="p-6 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
                <h3 className="font-bold mb-4">Academic Health</h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-center p-3 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 shadow-sm">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-red-100 dark:bg-red-500/10 text-red-600 rounded-lg"><AlertCircle className="w-4 h-4" /></div>
                         <span className="text-xs font-medium">Weakness in Errors</span>
                      </div>
                      <span className="text-sm font-bold text-red-500">{studentStats.stats.errorCount} Items</span>
                   </div>
                   <div className="flex justify-between items-center p-3 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 shadow-sm">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 rounded-lg"><Award className="w-4 h-4" /></div>
                         <span className="text-xs font-medium">Rank in Leaderboard</span>
                      </div>
                      <span className="text-sm font-bold">Top 15%</span>
                   </div>
                </div>
                <Button variant="outline" fullWidth className="mt-6 text-xs h-9 border-slate-200 dark:border-slate-700">
                  Detailed Report <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
             </Card>

             {/* Motivation Widget */}
             <Card className="p-5 bg-slate-900 text-white border-transparent">
                <div className="flex items-center gap-3 mb-4">
                   <Sparkles className="w-5 h-5 text-yellow-500" />
                   <h3 className="font-bold text-sm">Send Encouragement</h3>
                </div>
                <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                   Your child is on a {studentStats.stats.streak} day streak! Send a small praise to keep them motivated.
                </p>
                <div className="flex gap-2">
                   <Button size="sm" className="flex-1 h-8 text-[10px] bg-blue-600 hover:bg-blue-700">Well Done! 👍</Button>
                   <Button size="sm" className="flex-1 h-8 text-[10px] bg-slate-800 hover:bg-slate-700">Keep it up! 🔥</Button>
                </div>
             </Card>
          </div>
        </div>
      ) : selectedStudentId && (
        <div className="p-20 text-center text-slate-400">Loading student stats...</div>
      )}
    </div>
  )
}

const StatCard = ({ icon, label, value, subtitle }: { icon: React.ReactNode, label: string, value: string | number, subtitle: string }) => (
  <Card className="p-4 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
     <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">{icon}</div>
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{label}</span>
     </div>
     <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold">{value}</span>
        <span className="text-[10px] text-slate-400 font-medium">{subtitle}</span>
     </div>
  </Card>
)
