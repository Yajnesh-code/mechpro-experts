import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';
type Toast = { id: number; type: ToastType; message: string };

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const COLORS = {
  success: 'var(--success)',
  error: 'var(--danger)',
  info: 'var(--purple-600)',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts((current) => [...current, { id, type, message }]);
    window.setTimeout(() => removeToast(id), 3600);
  }, [removeToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={{ position: 'fixed', right: 20, top: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360 }}>
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type];
          return (
            <div key={toast.id} className="card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: 'var(--shadow-lg)' }}>
              <Icon size={18} color={COLORS[toast.type]} />
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{toast.message}</span>
              <button className="icon-btn btn-sm" onClick={() => removeToast(toast.id)}><X size={12} /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) return { showToast: () => undefined };
  return context;
}
