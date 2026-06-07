'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import RoleBadge from '@/components/dashboard/RoleBadge';
import type { DashboardData } from '@/lib/dashboard-data';

interface SidebarProps {
  data: DashboardData;
  activeHref: string;
  onClose?: () => void;
}

export default function Sidebar({ data, activeHref, onClose }: SidebarProps) {
  const router = useRouter();

  return (
    <div
      className="flex flex-col h-full w-full select-none"
      style={{ background: '#10101b', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Logo */}
      <div className="px-4 py-4 flex items-center gap-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)', letterSpacing: '-0.5px' }}
        >
          ME
        </div>
        <div>
          <div className="text-sm font-semibold text-white leading-tight">MechPro Experts</div>
          <div className="text-[9px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>B2B2C Platform</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        <div className="flex flex-col gap-0.5">
          {data.navItems.map(item => {
            const isActive = item.href === activeHref;
            return (
              <a
                key={item.label}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
                  background: isActive ? 'rgba(124,58,237,0.22)' : 'transparent',
                  borderLeft: `2px solid ${isActive ? '#7C3AED' : 'transparent'}`,
                }}
              >
                <span className="text-[15px] w-5 flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </span>
                <span className="flex-1 text-[13px]">{item.label}</span>
                {item.badge != null && (
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: '#EC4899', color: '#fff' }}
                  >
                    {item.badge}
                  </span>
                )}
              </a>
            );
          })}
        </div>

        {/* Divider + general items */}
        <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="px-3 mb-1.5 text-[9px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>
            General
          </p>
          {[
            { icon: '🔔', label: 'Notifications' },
            { icon: '⚙',  label: 'Settings' },
            { icon: '❓',  label: 'Support' },
          ].map(item => (
            <a key={item.label} href="#" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-all hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.35)' }}>
              <span className="text-[14px] w-5 flex items-center justify-center flex-shrink-0">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      {/* User */}
      <div className="px-2 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)' }}
          >
            {data.userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate leading-tight">{data.userName}</div>
            <RoleBadge role={data.role} size="xs" />
          </div>
          <button
            onClick={() => router.push('/auth/login')}
            title="Sign out"
            className="flex-shrink-0 transition-colors hover:opacity-80"
            style={{ color: 'rgba(255,255,255,0.25)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
