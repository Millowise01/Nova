"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Toast } from "@nova/ui";

export type ToastType = "success" | "error" | "warning" | "info";

export type ToastItem = {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
};

type ToastContextType = {
  toasts: ToastItem[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
  };
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToast = (message: string, type: ToastType, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const toastHelpers = {
    success: (msg: string, dur?: number) => addToast(msg, "success", dur),
    error: (msg: string, dur?: number) => addToast(msg, "error", dur),
    warning: (msg: string, dur?: number) => addToast(msg, "warning", dur),
    info: (msg: string, dur?: number) => addToast(msg, "info", dur),
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast: toastHelpers }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {toasts.map((t) => {
          let bgColor = "bg-white text-slate-900 border-slate-200";
          if (t.type === "success") bgColor = "bg-[color:var(--ds-success)] text-white border-transparent";
          if (t.type === "error") bgColor = "bg-[color:var(--ds-danger)] text-white border-transparent";
          if (t.type === "warning") bgColor = "bg-[color:var(--ds-warning)] text-white border-transparent";
          if (t.type === "info") bgColor = "bg-[color:var(--ds-info)] text-white border-transparent";

          return (
            <div key={t.id} className="pointer-events-auto">
              <Toast>
                <div
                  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border shadow-lg ${bgColor} transition duration-300`}
                >
                  <span className="text-sm font-semibold">{t.message}</span>
                  <button
                    onClick={() => removeToast(t.id)}
                    className="text-white/80 hover:text-white transition font-bold"
                  >
                    ×
                  </button>
                </div>
              </Toast>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
