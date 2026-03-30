'use client'

import React from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { ContentStatus, QuestionType } from '@prisma/client'
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  FileText, 
  AlertCircle, 
  BarChart3, 
  PieChart as PieChartIcon
} from 'lucide-react'
import { AdminClientWrapper } from '@/components/admin/common'

interface StatisticsClientProps {
  userRole: string
  stats: {
    totalQuestions: number
    byStatus: Record<ContentStatus, number>
    byType: Record<QuestionType, number>
    pendingReports: number
    recentlyAdded: number
  }
}

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: '#22c55e', // green-500
  REVIEW_PENDING: '#f97316', // orange-500
  DRAFT: '#94a3b8', // slate-400
  REVIEW_REJECTED: '#ef4444', // red-500
  ARCHIVED: '#64748b', // slate-500
  OCR_PROCESSING: '#3b82f6', // blue-500
  OCR_COMPLETED: '#6366f1', // indigo-500
  STRUCTURING: '#8b5cf6', // violet-500
  VERIFIED: '#10b981', // emerald-500
  FAILED: '#ef4444', // red-500
}

const TYPE_NAMES: Record<string, string> = {
  SINGLE_CHOICE: '单选题',
  MULTIPLE_CHOICE: '多选题',
  FILL_BLANK: '填空题',
  ESSAY: '解答题',
  TRUE_FALSE: '判断题',
}

export function StatisticsClient({ userRole, stats }: StatisticsClientProps) {
  // 准备图表数据
  const statusData = Object.entries(stats.byStatus)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: key,
      value,
      color: STATUS_COLORS[key] || '#cbd5e1'
    }))

  const typeData = Object.entries(stats.byType)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: TYPE_NAMES[key] || key,
      value
    }))
    .sort((a, b) => b.value - a.value)

  const publishedCount = stats.byStatus.PUBLISHED || 0
  const passRate = stats.totalQuestions > 0 
    ? ((publishedCount / stats.totalQuestions) * 100).toFixed(1) 
    : '0.0'

  return (
    <AdminClientWrapper userRole={userRole}>
      <div className="container mx-auto py-8 space-y-8 max-w-7xl">
        <div className="flex flex-col justify-between gap-4 tablet:flex-row tablet:items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-text-primary dark:text-white">
              数据看板
            </h1>
            <p className="text-text-secondary dark:text-slate-400 font-medium">
              题目内容生产与质量监控中心
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-4">
          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative group">
            <div className="absolute right-0 top-0 h-32 w-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-blue-100">
                总题目数
              </CardTitle>
              <FileText className="h-4 w-4 text-blue-100" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{stats.totalQuestions}</div>
              <p className="text-xs text-blue-100 mt-1 flex items-center">
                <Activity className="h-3 w-3 mr-1" />
                本周新增 {stats.recentlyAdded} 题
              </p>
            </CardContent>
          </Card>

          <Card className="border-borderTone dark:border-none shadow-surface dark:shadow-lg bg-surface dark:bg-slate-900 hover:shadow-lg dark:hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary dark:text-slate-400">
                已发布
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-text-primary dark:text-white">{publishedCount}</div>
              <p className="text-xs text-text-tertiary dark:text-slate-500 mt-1">
                发布率 {passRate}%
              </p>
            </CardContent>
          </Card>

          <Card className="border-borderTone dark:border-none shadow-surface dark:shadow-lg bg-surface dark:bg-slate-900 hover:shadow-lg dark:hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary dark:text-slate-400">
                待审核
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-text-primary dark:text-white">
                {stats.byStatus.REVIEW_PENDING || 0}
              </div>
              <p className="text-xs text-text-tertiary dark:text-slate-500 mt-1">
                需要尽快处理
              </p>
            </CardContent>
          </Card>

          <Card className="border-borderTone dark:border-none shadow-surface dark:shadow-lg bg-surface dark:bg-slate-900 hover:shadow-lg dark:hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary dark:text-slate-400">
                用户纠错
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-text-primary dark:text-white">
                {stats.pendingReports}
              </div>
              <p className="text-xs text-text-tertiary dark:text-slate-500 mt-1">
                待处理反馈
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-8 desktop:grid-cols-2">
          
          {/* Status Distribution */}
          <Card className="border-borderTone dark:border-none shadow-surface dark:shadow-lg bg-surface dark:bg-slate-900 rounded-[2rem]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <PieChartIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">状态分布</CardTitle>
                  <CardDescription>题目生命周期状态概览</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Type Distribution */}
          <Card className="border-borderTone dark:border-none shadow-surface dark:shadow-lg bg-surface dark:bg-slate-900 rounded-[2rem]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">题型分布</CardTitle>
                  <CardDescription>按题目类型统计</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" hide />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={80} 
                      tick={{ fontSize: 12 }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <RechartsTooltip 
                       cursor={{ fill: 'transparent' }}
                       contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminClientWrapper>
  )
}
