import React from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  sub: string;
  accent: string;
  icon?: string;
}

export default function MetricCard({ label, value, sub, accent, icon }: MetricCardProps) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3 transition-all hover:-translate-y-0.5 hover:shadow-lg cursor-default"
      style={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider leading-tight" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {label}
        </span>
        {icon && (
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
            style={{ background: `${accent}22` }}
          >
            {icon}
          </div>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold tracking-tight text-white leading-none">{value}</div>
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: accent }} />
          <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>{sub}</span>
        </div>
      </div>
      {/* Bottom accent bar */}
      <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full w-2/3 rounded-full" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}44)` }} />
      </div>
    </div>
  );
}
