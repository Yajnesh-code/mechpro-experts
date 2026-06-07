'use client';
import React, { useState } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import MetricCard from '@/components/dashboard/MetricCard';
import type { UserRole } from '@/types';
import { DASHBOARD_DATA, ROLE_LABELS } from '@/lib/dashboard-data';

const ALL_ROLES: UserRole[] = ['admin', 'corporate', 'broker', 'fleet', 'insurance', 'workshop'];

interface DashboardContentProps {
  role: UserRole;
}

export default function DashboardContent({ role: initialRole }: DashboardContentProps) {
  const [role, setRole] = useState<UserRole>(initialRole);
  const data = DASHBOARD_DATA[role];
  const activeHref = `/dashboard/${
    role === 'corporate' ? 'business' :
    role === 'insurance' ? 'insurance' : role
  }`;

  return (
    <div>
      {/* Role switcher — demo only */}
      <div
        className="fixed top-3 right-3 z-50 hidden lg:flex items-center gap-2 rounded-xl px-3 py-1.5"
        style={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Demo Role
        </span>
        <select
          value={role}
          onChange={e => setRole(e.target.value as UserRole)}
          className="text-[11px] font-semibold bg-transparent outline-none cursor-pointer"
          style={{ color: '#a78bfa' }}
        >
          {ALL_ROLES.map(r => (
            <option key={r} value={r} style={{ background: '#1e1e2e', color: '#fff' }}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
      </div>

      <DashboardShell data={data} activeHref={activeHref}>
        <div className="max-w-6xl mx-auto flex flex-col gap-4">

          {/* Page header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">{data.greeting}</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {data.userCompany} · {data.userCity} &nbsp;·&nbsp; Sat, 23 May 2026
              </p>
            </div>
            {/* Alert pill */}
            {role === 'admin' && (
              <div
                className="hidden sm:flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium cursor-pointer hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg,#7C3AED22,#EC489922)', border: '1px solid #DDD6FE', color: '#5B21B6' }}
              >
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#EC4899' }} />
                8 accounts awaiting approval
              </div>
            )}
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {data.metrics.map(m => (
              <MetricCard key={m.label} label={m.label} value={m.value} sub={m.sub} accent={m.accent} icon={m.icon} />
            ))}
          </div>

          {/* Main content row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Recent activity */}
            <div
              className="lg:col-span-2 rounded-2xl p-4 flex flex-col gap-3"
              style={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Recent Activity
                </h2>
                <a href="#" className="text-[10px] font-semibold transition-colors hover:opacity-70" style={{ color: '#a78bfa' }}>
                  View all
                </a>
              </div>
              <div className="flex flex-col gap-0">
                {data.activity.map((item, i) => (
                  <div key={i} className="flex gap-3 pb-3.5 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: item.dot }} />
                      {i < data.activity.length - 1 && (
                        <div className="w-px flex-1 mt-1" style={{ background: 'rgba(255,255,255,0.06)', minHeight: 14 }} />
                      )}
                    </div>
                    <div className="flex-1 flex items-start justify-between gap-3 min-w-0">
                      <p className="text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.65)' }}>{item.text}</p>
                      <span className="text-[10px] flex-shrink-0 tabular-nums" style={{ color: 'rgba(255,255,255,0.25)' }}>{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex flex-col gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider px-0.5" style={{ color: 'rgba(0,0,0,0.4)' }}>
                Quick Actions
              </h2>
              {data.quickActions.map(action => (
                <a
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{ background: action.bg, border: `1px solid ${action.accent}22` }}
                >
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${action.accent}30` }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: action.accent }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold leading-tight truncate" style={{ color: action.accent }}>
                      {action.label}
                    </p>
                    <p className="text-[10px] mt-0.5 truncate" style={{ color: `${action.accent}88` }}>
                      {action.sub}
                    </p>
                  </div>
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: `${action.accent}55` }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Session / Security card */}
            <div
              className="rounded-2xl p-4"
              style={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Security &amp; Session
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: '#0d2420', color: '#6ee7b7' }}>
                  Secure
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Last Login',       value: 'Today, 09:31 AM · Mumbai',   ok: true },
                  { label: 'Session Status',   value: 'Active · expires in 6h 22m', ok: true },
                  { label: 'Two-Factor Auth',  value: 'Enabled via OTP',            ok: true },
                  { label: 'Device',           value: 'Chrome · MacBook Pro',        ok: true },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{row.label}</span>
                    <span className="text-[11px] font-medium" style={{ color: row.ok ? '#6ee7b7' : '#f87171' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Account / Approval status */}
            <div
              className="rounded-2xl p-4"
              style={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Account Status
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: '#1a1040', color: '#c4b5fd' }}>
                  Approved
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Account',        value: data.userCompany },
                  { label: 'Role',           value: ROLE_LABELS[role] },
                  { label: 'City',           value: data.userCity },
                  { label: 'Access Level',   value: 'Full dashboard access' },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{row.label}</span>
                    <span className="text-[11px] font-medium text-white/70 truncate max-w-[140px] text-right">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </DashboardShell>
    </div>
  );
}
