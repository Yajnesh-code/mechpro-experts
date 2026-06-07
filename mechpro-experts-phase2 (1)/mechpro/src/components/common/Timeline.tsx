import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { TimelineEvent } from '../../types';
import { formatDateTime } from '../../utils';

interface TimelineProps {
  events: TimelineEvent[];
}

export default function Timeline({ events }: TimelineProps) {
  return (
    <div className="timeline">
      {events.map((event, i) => (
        <div key={event.status} className="timeline-item">
          <div className={`timeline-dot ${event.isCompleted ? 'completed' : event.isCurrent ? 'current' : 'pending'}`}>
            {event.isCompleted && (
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <div className="timeline-content">
            <div className="timeline-status" style={{ color: event.isCurrent ? 'var(--purple-700)' : event.isCompleted ? 'var(--navy)' : 'var(--text-muted)' }}>
              {event.status}
              {event.isCurrent && (
                <span className="badge badge-purple" style={{ marginLeft: 8, fontSize: 10 }}>Current</span>
              )}
            </div>
            {event.timestamp ? (
              <div className="timeline-meta">
                {formatDateTime(event.timestamp)}
                {event.performedBy && ` · ${event.performedBy}`}
              </div>
            ) : (
              <div className="timeline-meta" style={{ fontStyle: 'italic' }}>Pending</div>
            )}
            {event.notes && <div className="timeline-note">{event.notes}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
