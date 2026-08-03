"use client";

import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

import { cn } from "@nova/utils";

export type ToastTone = "success" | "error" | "warning" | "info" | "neutral";

export interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  tone?: ToastTone;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastContextValue {
  toast: (item: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (item: Omit<ToastItem, "id">) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { ...item, id }]);
      const duration = item.duration ?? 4000;
      if (duration > 0) setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

const iconMap: Record<ToastTone, ReactNode> = {
  success: (
    <CheckCircle2 size={16} className="text-[color:var(--color-success)]" aria-hidden="true" />
  ),
  error: <AlertCircle size={16} className="text-[color:var(--color-error)]" aria-hidden="true" />,
  warning: (
    <AlertTriangle size={16} className="text-[color:var(--color-warning)]" aria-hidden="true" />
  ),
  info: <Info size={16} className="text-[color:var(--color-info)]" aria-hidden="true" />,
  neutral: (
    <Info size={16} className="text-[color:var(--color-foreground-muted)]" aria-hidden="true" />
  ),
};

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (!toasts.length) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-[1400] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
    >
      {toasts.map((t) => (
        <Toast key={t.id} item={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

export function Toast({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const tone = item.tone ?? "neutral";

  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 rounded-lg border bg-[color:var(--color-surface-raised)] p-3.5 shadow-lg",
        "animate-[nova-slide-in-right_200ms_var(--ease-spring)_both]",
        tone === "error" && "border-[color:var(--color-error-border)]",
        tone === "success" && "border-[color:var(--color-success-border)]",
        tone === "warning" && "border-[color:var(--color-warning-border)]",
        tone === "info" && "border-[color:var(--color-info-border)]",
        tone === "neutral" && "border-[color:var(--color-border)]",
      )}
    >
      <span className="mt-0.5 shrink-0">{iconMap[tone]}</span>

      <div className="min-w-0 flex-1">
        {item.title && (
          <p className="text-sm font-semibold text-[color:var(--color-foreground)]">{item.title}</p>
        )}
        {item.description && (
          <p className="mt-0.5 text-xs text-[color:var(--color-foreground-muted)]">
            {item.description}
          </p>
        )}
        {item.action && (
          <button
            type="button"
            onClick={() => {
              item.action!.onClick();
              onDismiss(item.id);
            }}
            className="mt-1.5 text-xs font-semibold text-[color:var(--color-primary)] hover:underline focus-visible:outline-none"
          >
            {item.action.label}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss"
        className="shrink-0 rounded p-0.5 text-[color:var(--color-foreground-muted)] hover:text-[color:var(--color-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)]"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
