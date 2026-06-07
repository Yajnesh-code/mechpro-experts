import React from 'react';
import { LeadStatus, Priority } from '../../types';
import { getStatusClass, getPriorityClass } from '../../utils';

export function StatusBadge({ status }: { status: LeadStatus }) {
  return <span className={`badge ${getStatusClass(status)}`}>{status}</span>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={`badge ${getPriorityClass(priority)}`}>{priority}</span>;
}

export function ServiceTypeBadge({ type }: { type: string }) {
  return <span className="badge badge-purple">{type}</span>;
}

export function PartnerTypeBadge({ type, code }: { type: string; code: string }) {
  return (
    <span className="badge badge-blue">
      <span style={{ opacity: 0.7, fontSize: 10 }}>{code}</span> {type}
    </span>
  );
}
