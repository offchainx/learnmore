"use client";

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { 
  Bell, CheckCheck, Info, MessageSquare, 
  Trophy, CreditCard, ExternalLink, Inbox
} from 'lucide-react';
import { NotificationType } from '@prisma/client';
import { NotificationWithMetadata } from '@/lib/notification/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface NotificationDropdownProps {
  notifications: NotificationWithMetadata[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  isLoading: boolean;
}

const NotificationIcon = ({ type }: { type: NotificationType }) => {
  switch (type) {
    case 'SYSTEM': return <Info className="w-4 h-4 text-blue-500" />;
    case 'SOCIAL': return <MessageSquare className="w-4 h-4 text-green-500" />;
    case 'STUDY_REMINDER': return <Inbox className="w-4 h-4 text-orange-500" />;
    case 'ACHIEVEMENT': return <Trophy className="w-4 h-4 text-yellow-500" />;
    case 'BILLING': return <CreditCard className="w-4 h-4 text-purple-500" />;
    default: return <Bell className="w-4 h-4 text-slate-500" />;
  }
};

export function NotificationDropdown({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  isLoading
}: NotificationDropdownProps) {
  return (
    <div className="w-80 sm:w-96 max-h-[500px] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          通知中心
          {notifications.length > 0 && (
            <span className="px-2 py-0.5 text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
              {notifications.filter(n => !n.isRead).length} 条未读
            </span>
          )}
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onMarkAllAsRead}
          className="text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 gap-1.5 h-8"
          disabled={isLoading || notifications.length === 0}
        >
          <CheckCheck className="w-3.5 h-3.5" />
          全部已读
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              <Bell className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">暂时没有新通知</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">当你有新的动态时，我们会在这里提醒你</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
                className={`group p-4 transition-all duration-200 cursor-pointer flex gap-3 ${
                  notification.isRead 
                    ? 'opacity-70 grayscale-[0.2]' 
                    : 'bg-blue-50/30 dark:bg-blue-900/10'
                } hover:bg-slate-50 dark:hover:bg-slate-800/50`}
              >
                <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  notification.isRead 
                    ? 'bg-slate-100 dark:bg-slate-800' 
                    : 'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  <NotificationIcon type={notification.type} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <p className={`text-sm font-semibold truncate pr-2 ${
                      notification.isRead ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'
                    }`}>
                      {notification.title}
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: zhCN })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                    {notification.content}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    {notification.link && (
                      <Link 
                        href={notification.link}
                        className="text-[11px] font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        查看详情
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    )}
                    {!notification.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-xs font-medium rounded-xl h-9"
          asChild
        >
          <Link href="/dashboard/settings?tab=notifications">
            通知设置
          </Link>
        </Button>
      </div>
    </div>
  );
}
