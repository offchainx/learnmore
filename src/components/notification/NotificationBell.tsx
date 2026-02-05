"use client";

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { Bell } from 'lucide-react';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllAsRead 
} from '@/actions/notification';
import { NotificationWithMetadata } from '@/lib/notification/types';
import { NotificationDropdown } from './NotificationDropdown';
import { useOnClickOutside } from '@/lib/hooks/use-on-click-outside';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationWithMetadata[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useOnClickOutside(dropdownRef as React.RefObject<HTMLDivElement>, () => setIsOpen(false));

  const fetchNotifications = async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    const result = await getNotifications(undefined, 10);
    if (result.success && result.data) {
      setNotifications(result.data as NotificationWithMetadata[]);
      setUnreadCount(result.unreadCount || 0);
    }
    if (isInitial) setIsLoading(false);
  };

  // 轮询：每 60 秒刷新一次
  useEffect(() => {
    fetchNotifications(true);
    pollingRef.current = setInterval(() => {
      fetchNotifications();
    }, 60000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handleMarkAsRead = async (id: string) => {
    // 乐观更新
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    startTransition(async () => {
      await markNotificationAsRead(id);
    });
  };

  const handleMarkAllAsRead = async () => {
    // 乐观更新
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);

    startTransition(async () => {
      await markAllAsRead();
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl transition-all duration-300 group ${
          isOpen 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-105' 
            : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-900/50'
        }`}
      >
        <Bell className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-12' : 'group-hover:rotate-12'}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 z-[100] animate-in fade-in zoom-in duration-200 origin-top-right">
          <NotificationDropdown 
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
}
