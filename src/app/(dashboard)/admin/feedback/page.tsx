'use client';

import React, { useEffect, useState } from 'react';
import { getFeedbackList } from '@/actions/support';
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
import { format } from 'date-fns';
import Link from 'next/link';
import { MessageSquare, Filter, ChevronRight, Loader2 } from 'lucide-react';

const statusColors: Record<FeedbackStatus, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  RESOLVED: 'bg-green-500/10 text-green-500 border-green-500/20',
  REJECTED: 'bg-red-500/10 text-red-500 border-red-500/20',
  CLOSED: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
};

const categoryLabels: Record<FeedbackCategory, string> = {
  BUG: 'Bug',
  FEATURE: 'Feature',
  SUGGESTION: 'Suggestion',
  BILLING: 'Billing',
  CONTENT_ISSUE: 'Content',
  OTHER: 'Other',
};

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<FeedbackCategory | 'ALL'>('ALL');

  const fetchFeedbacks = async () => {
    setLoading(true);
    const result = await getFeedbackList({
      status: statusFilter === 'ALL' ? undefined : statusFilter as FeedbackStatus,
      category: categoryFilter === 'ALL' ? undefined : categoryFilter as FeedbackCategory,
    });
    if (result.success) {
      setFeedbacks(result.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [statusFilter, categoryFilter]);

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Feedback Inbox</h1>
          <p className="text-slate-400 mt-1">Manage and respond to user feedback and bug reports.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="w-[150px] bg-slate-900 border-slate-800">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-white">
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={categoryFilter} onValueChange={(v: any) => setCategoryFilter(v)}>
            <SelectTrigger className="w-[150px] bg-slate-900 border-slate-800">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white">
              <SelectItem value="ALL">All Categories</SelectItem>
              {Object.entries(categoryLabels).map(([val, label]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center text-slate-400 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p>Loading feedbacks...</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-slate-400 gap-4">
            <MessageSquare className="h-12 w-12 opacity-20" />
            <p>No feedbacks found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-950/50">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-300 font-semibold">User</TableHead>
                <TableHead className="text-slate-300 font-semibold">Category</TableHead>
                <TableHead className="text-slate-300 font-semibold">Title</TableHead>
                <TableHead className="text-slate-300 font-semibold">Status</TableHead>
                <TableHead className="text-slate-300 font-semibold">Submitted</TableHead>
                <TableHead className="text-right text-slate-300 font-semibold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedbacks.map((item) => (
                <TableRow key={item.id} className="border-slate-800 hover:bg-slate-800/30 transition-colors group">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-white">
                        {item.user?.username || 'Anonymous'}
                      </span>
                      <span className="text-xs text-slate-500">{item.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal border-slate-700 bg-slate-800/50">
                      {categoryLabels[item.category as FeedbackCategory]}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <p className="truncate text-white font-medium">{item.title}</p>
                    <p className="truncate text-xs text-slate-500">{item.content}</p>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${statusColors[item.status as FeedbackStatus]} border font-medium`}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-400 text-sm">
                    {format(new Date(item.createdAt), 'MMM d, HH:mm')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/feedback/${item.id}`}>
                      <Button variant="ghost" size="sm" className="hover:bg-blue-500/10 hover:text-blue-400">
                        View <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
