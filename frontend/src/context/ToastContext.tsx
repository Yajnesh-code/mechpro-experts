"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: string;
  type: ToastType;
  message: string;
};

type ToastContextValue = {
  toast: (type: ToastType, message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toastStyles: Record<ToastType, { icon: typeof CheckCircle2; accent: string; bg: string }> = {
  success: { icon: CheckCircle2, accent: "text-emerald-600", bg: "border-emerald-100 bg-emerald-50" },
  error: { icon: AlertCircle, accent: "text-red-600", bg: "border-red-100 bg-red-50" },
  info: { icon: Info, accent: "text-violet-600", bg: "border-violet-100 bg-violet-50" },
};

function randomId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (type: ToastType, message: string) => {
      const id = randomId();
      setToasts((current) => [...current, { id, type, message }]);
      window.setTimeout(() => removeToast(id), 4200);
    },
    [removeToast],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
        <AnimatePresence>
          {toasts.map((item) => {
            const style = toastStyles[item.type];
            const Icon = style.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 24, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.98 }}
                className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur ${style.bg}`}
              >
                <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${style.accent}`} />
                <p className="flex-1 text-sm font-semibold leading-5 text-gray-800">{item.message}</p>
                <button
                  type="button"
                  onClick={() => removeToast(item.id)}
                  className="rounded-lg p-1 text-gray-400 transition hover:bg-white/70 hover:text-gray-700"
                  aria-label="Close notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
