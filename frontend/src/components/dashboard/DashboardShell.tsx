'use client';
import React, { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import type { DashboardData } from '@/lib/dashboard-data';

interface DashboardShellProps {
  data: DashboardData;
  activeHref: string;
  children: React.ReactNode;
}

export default function DashboardShell({ data, activeHref, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    /* Outer shell — dark background */
    <div className="min-h-screen flex items-center justify-center p-0 lg:p-4" style={{ background: '#0a0a12' }}>
      {/* Dashboard frame */}
      <div
        className="w-full lg:max-w-[1380px] lg:h-[calc(100vh-2rem)] h-screen flex flex-col lg:flex-row overflow-hidden"
        style={{ borderRadius: '0 0 0 0', background: '#0a0a12' }}
      >
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex flex-col w-56 xl:w-60 flex-shrink-0 overflow-hidden lg:rounded-l-2xl">
          <Sidebar data={data} activeHref={activeHref} />
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/70" onClick={() => setSidebarOpen(false)} />
            <div className="relative z-10 w-56 flex flex-col shadow-2xl">
              <Sidebar data={data} activeHref={activeHref} onClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Right section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar data={data} onMenuToggle={() => setSidebarOpen(v => !v)} />

          {/* Main workspace */}
          <main
            className="flex-1 overflow-y-auto p-4 xl:p-5"
            style={{ background: '#f4f1fb' }}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
