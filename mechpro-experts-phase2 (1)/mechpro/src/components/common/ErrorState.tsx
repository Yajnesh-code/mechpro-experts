import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><AlertCircle size={24} /></div>
      <div className="empty-title">Unable to load data</div>
      <div className="empty-desc">{message}</div>
      {onRetry && (
        <button className="btn btn-secondary btn-sm" style={{ marginTop: 14 }} onClick={onRetry}>
          <RefreshCcw size={14} /> Retry
        </button>
      )}
    </div>
  );
}
