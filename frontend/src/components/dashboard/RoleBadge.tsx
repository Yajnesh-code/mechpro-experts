import React from 'react';
import type { UserRole } from '@/types';
import { ROLE_LABELS, ROLE_BADGE_STYLES } from '@/lib/dashboard-data';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'xs' | 'sm';
}

export default function RoleBadge({ role, size = 'sm' }: RoleBadgeProps) {
  const s = ROLE_BADGE_STYLES[role];
  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full tracking-wide ${
        size === 'xs' ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-0.5'
      }`}
      style={{ background: s.bg, color: s.text }}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}

const statusStyles = {
  purple: { bg: '#EDE9FE', text: '#5B21B6' },
  green: { bg: '#D1FAE5', text: '#065F46' },
  amber: { bg: '#FEF3C7', text: '#92400E' },
  red: { bg: '#FEE2E2', text: '#991B1B' },
  blue: { bg: '#DBEAFE', text: '#1D4ED8' },
} as const;

export function StatusBadge({ label, tone = 'purple' }: { label: string; tone?: keyof typeof statusStyles }) {
  const style = statusStyles[tone];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold"
      style={{ background: style.bg, color: style.text }}
    >
      {label}
    </span>
  );
}
