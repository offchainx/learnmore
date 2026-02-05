'use client';

import React, { useEffect, useState, use } from 'react';
import { getFeedbackDetail, replyToFeedback } from '@/actions/support';
import { FeedbackStatus, FeedbackCategory } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { ArrowLeft, Send, Loader2, User, Clock, Tag, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const statusColors: Record<FeedbackStatus, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  RESOLVED: 'bg-green-500/10 text-green-500 border-green-500/20',
  REJECTED: 'bg-red-500/10 text-red-500 border-red-500/20',
  CLOSED: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
};

export default function FeedbackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState<FeedbackStatus>('RESOLVED');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const fetchFeedback = async () => {
    setLoading(true);
    const result = await getFeedbackDetail(id);
    if (result.success) {
      setFeedback(result.data);
      setReply(result.data.adminReply || '');
      setStatus(result.data.status);
    } else {
      toast({
        title: 'Error',
        description: 'Failed to fetch feedback details',
        variant: 'destructive',
      });
      router.push('/admin/feedback');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFeedback();
  }, [id]);

  const handleReply = async () => {
    if (!reply.trim()) {
      toast({
        title: 'Empty reply',
        description: 'Please enter a response before sending.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    const result = await replyToFeedback(id, reply, status);
    if (result.success) {
      toast({
        title: 'Response sent',
        description: 'The user has been notified via email and in-app notification.',
      });
      router.refresh();
      fetchFeedback();
    } else {
      toast({
        title: 'Error',
        description: result.error as string || 'Failed to send response',
        variant: 'destructive',
      });
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <Link href="/admin/feedback" className="flex items-center text-slate-400 hover:text-white transition-colors mb-4 group">
        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to feedback inbox
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Detail */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-slate-900 border-slate-800 text-white overflow-hidden shadow-2xl">
            <CardHeader className="bg-slate-950/50 border-b border-slate-800">
              <div className="flex justify-between items-start">
                <div>
                  <Badge className={`${statusColors[feedback.status as FeedbackStatus]} border mb-3`}>
                    {feedback.status}
                  </Badge>
                  <CardTitle className="text-2xl font-bold">{feedback.title}</CardTitle>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400 flex items-center justify-end gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(feedback.createdAt), 'PPpp')}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="prose prose-invert max-w-none">
                <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {feedback.content}
                </p>
              </div>

              {feedback.attachments && feedback.attachments.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-800">
                  <p className="text-sm font-semibold text-slate-400 mb-3">Attachments</p>
                  <div className="grid grid-cols-2 gap-4">
                    {feedback.attachments.map((url: string, idx: number) => (
                      <img 
                        key={idx} 
                        src={url} 
                        alt="Attachment" 
                        className="rounded-lg border border-slate-800 max-h-48 object-cover cursor-pointer hover:opacity-80 transition-opacity" 
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Response Form */}
          <Card className="bg-slate-900 border-slate-800 text-white shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-400" />
                Response to User
              </CardTitle>
              <CardDescription className="text-slate-400">
                The user will be notified of your response via email and in-app notification.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                placeholder="Write your response here..."
                className="min-h-[200px] bg-slate-950 border-slate-800 text-white focus:ring-blue-500/20"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-400 font-medium">Set status to:</span>
                  <Select value={status} onValueChange={(v: FeedbackStatus) => setStatus(v)}>
                    <SelectTrigger className="w-[150px] bg-slate-950 border-slate-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-white">
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleReply} 
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-8"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                  Send Response
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: User Info */}
        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <User className="h-4 w-4" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Username</p>
                <p className="font-medium">{feedback.user?.username || 'Anonymous'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Email</p>
                <p className="font-medium text-blue-400 underline cursor-pointer">{feedback.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Account Role</p>
                <Badge variant="outline" className="border-slate-700">
                  {feedback.user?.role || 'GUEST'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Category</p>
                <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                  {feedback.category}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Feedback ID</p>
                <p className="text-[10px] font-mono text-slate-500 break-all">{feedback.id}</p>
              </div>
              {feedback.repliedAt && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Last Replied At</p>
                  <p className="text-xs text-slate-400">{format(new Date(feedback.repliedAt), 'PPpp')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
