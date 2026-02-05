'use client';

import React, { useState } from 'react';
import { FeedbackStatus, FeedbackCategory } from '@prisma/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import Link from 'next/link';
import { 
  MessageSquare, 
  Filter, 
  ChevronRight, 
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Inbox
} from 'lucide-react';

const statusColors: Record<FeedbackStatus, string> = {
  PENDING: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  RESOLVED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  REJECTED: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  CLOSED: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
};

const categoryLabels: Record<FeedbackCategory, string> = {
  BUG: 'Bug',
  FEATURE: '功能请求',
  SUGGESTION: '建议',
  BILLING: '账单',
  CONTENT_ISSUE: '内容错误',
  OTHER: '其他',
};

interface FeedbackListProps {
  initialData: any[];
  totalCount: number;
}

export function FeedbackList({ initialData, totalCount }: FeedbackListProps) {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // 统计逻辑
  const stats = {
    pending: initialData.filter(i => i.status === 'PENDING').length,
    resolved: initialData.filter(i => i.status === 'RESOLVED').length,
    total: totalCount
  };

  return (
    <div className="space-y-6">
      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
              <Inbox className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400">总反馈量</p>
              <h3 className="text-2xl font-bold text-white">{stats.total}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400">待处理</p>
              <h3 className="text-2xl font-bold text-white">{stats.pending}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400">已解决</p>
              <h3 className="text-2xl font-bold text-white">{stats.resolved}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 列表容器 */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/30">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              placeholder="搜索反馈内容..." 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-slate-500" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-slate-950 border-slate-800 text-white">
                <SelectValue placeholder="所有状态" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-white">
                <SelectItem value="ALL">所有状态</SelectItem>
                <SelectItem value="PENDING">待处理</SelectItem>
                <SelectItem value="IN_PROGRESS">处理中</SelectItem>
                <SelectItem value="RESOLVED">已解决</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader className="bg-slate-900/50">
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400 font-medium py-4">用户信息</TableHead>
              <TableHead className="text-slate-400 font-medium">分类</TableHead>
              <TableHead className="text-slate-400 font-medium">反馈标题</TableHead>
              <TableHead className="text-slate-400 font-medium">状态</TableHead>
              <TableHead className="text-slate-400 font-medium">提交时间</TableHead>
              <TableHead className="text-right text-slate-400 font-medium pr-6">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-500 gap-2">
                    <MessageSquare className="h-10 w-10 opacity-10" />
                    <p>暂无反馈记录</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              initialData.map((item) => (
                <TableRow key={item.id} className="border-slate-800 hover:bg-slate-800/20 transition-all group">
                  <TableCell className="py-4">
                    <div className="flex flex-col">
                      <span className="text-white font-medium">{item.user?.username || '匿名用户'}</span>
                      <span className="text-xs text-slate-500">{item.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal border-slate-700 bg-slate-800/30 text-slate-300">
                      {categoryLabels[item.category as FeedbackCategory]}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[240px]">
                    <p className="text-slate-200 truncate font-medium">{item.title}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{item.content}</p>
                  </TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[item.status as FeedbackStatus]}`}>
                      {item.status === 'PENDING' && <AlertCircle className="mr-1 h-3 w-3" />}
                      {item.status}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-400 text-xs">
                    {format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm')}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Link href={`/admin/feedback/${item.id}`}>
                      <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                        处理 <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
