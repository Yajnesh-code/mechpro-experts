'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RoleBadge from '@/components/dashboard/RoleBadge';
import type { DashboardData } from '@/lib/dashboard-data';
import { notificationsApi } from '@/lib/operations';

interface TopbarProps {
  data: DashboardData;
  onMenuToggle?: () => void;
}

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  readAt?: string | null;
  createdAt: string;
};

export default function Topbar({ data, onMenuToggle }: TopbarProps) {
  const router = useRouter();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const closeAll = () => { setShowNotif(false); setShowProfile(false); };
  const unreadCount = notifications.filter((notification) => !notification.readAt).length;

  async function loadNotifications(status = notificationFilter) {
    setNotificationsLoading(true);
    try {
      setNotifications(await notificationsApi.list(status) as NotificationItem[]);
    } catch {
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  }

  async function markNotificationRead(id: string) {
    await notificationsApi.markRead(id);
    loadNotifications();
  }

  async function markAllNotificationsRead() {
    await notificationsApi.markAllRead();
    loadNotifications();
  }

  useEffect(() => {
    if (showNotif) loadNotifications();
  }, [showNotif, notificationFilter]);

  return (
    <div
      className="h-14 flex items-center gap-3 px-4 flex-shrink-0 z-10"
      style={{ background: '#10101b', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Mobile toggle */}
      <button
        className="lg:hidden p-1.5 rounded-lg transition-colors hover:bg-white/10"
        style={{ color: 'rgba(255,255,255,0.5)' }}
        onClick={onMenuToggle}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Search */}
      <div className="flex-1 max-w-xs hidden sm:block">
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-1.5 transition-all focus-within:ring-1 focus-within:ring-violet-500/50"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 bg-transparent text-xs outline-none placeholder-white/25 text-white/80 min-w-0"
          />
        </div>
      </div>

      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-1.5">
        {/* Help */}
        <button
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.4)' }}
          title="Help"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(v => !v); setShowProfile(false); }}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10 relative"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full border border-[#10101b]" style={{ background: '#EC4899' }} />}
          </button>
          {showNotif && (
            <>
              <div className="fixed inset-0 z-40" onClick={closeAll} />
              <div className="absolute right-0 top-10 w-68 rounded-2xl z-50 overflow-hidden shadow-2xl" style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', width: 264 }}>
                <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-white">Notifications</p>
                    {unreadCount > 0 && <button onClick={markAllNotificationsRead} className="text-[10px] font-bold text-violet-300 hover:text-white">Mark all read</button>}
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-1">
                    {(['all', 'unread', 'read'] as const).map((filter) => (
                      <button key={filter} onClick={() => setNotificationFilter(filter)} className={`rounded-lg px-2 py-1 text-[10px] font-bold capitalize ${notificationFilter === filter ? 'bg-violet-500 text-white' : 'bg-white/5 text-white/45 hover:text-white'}`}>{filter}</button>
                    ))}
                  </div>
                </div>
                {notificationsLoading && <p className="px-4 py-4 text-xs font-semibold text-white/45">Loading notifications...</p>}
                {!notificationsLoading && notifications.length === 0 && <p className="px-4 py-4 text-xs font-semibold text-white/45">No notifications yet.</p>}
                {!notificationsLoading && notifications.map((notification, i) => {
                  const unread = !notification.readAt;
                  return (
                    <button key={notification.id} onClick={() => markNotificationRead(notification.id)} className="flex w-full items-start gap-2.5 px-4 py-3 text-left transition-colors hover:bg-white/5" style={{ borderBottom: i < notifications.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: unread ? '#7C3AED' : 'rgba(255,255,255,0.15)' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold leading-snug" style={{ color: unread ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)' }}>{notification.title}</p>
                        <p className="mt-1 text-[11px] leading-snug" style={{ color: unread ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.35)' }}>{notification.message}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Profile pill */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(v => !v); setShowNotif(false); }}
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl transition-all hover:bg-white/10"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)' }}>
              {data.userInitials}
            </div>
            <span className="text-xs font-medium text-white/80 hidden sm:block">{data.userName.split(' ')[0]}</span>
            <RoleBadge role={data.role} size="xs" />
          </button>
          {showProfile && (
            <>
              <div className="fixed inset-0 z-40" onClick={closeAll} />
              <div className="absolute right-0 top-10 w-48 rounded-2xl z-50 overflow-hidden shadow-2xl" style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-xs font-semibold text-white">{data.userName}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{data.userCompany}</p>
                </div>
                {['My Profile', 'Security Settings', 'Preferences'].map(item => (
                  <a key={item} href="#" className="flex items-center px-4 py-2.5 text-xs transition-colors hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.6)' }}>{item}</a>
                ))}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  <button onClick={() => { closeAll(); router.push('/auth/login'); }} className="w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors hover:bg-red-500/10" style={{ color: '#f87171' }}>
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
