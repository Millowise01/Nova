"use client";

import { cva } from "class-variance-authority";
import {
  createContext,
  useContext,
  useState,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

import { cn } from "@nova/utils";

interface TabsContextValue {
  active: string;
  setActive: (id: string) => void;
  variant: "line" | "pill" | "enclosed";
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tab components must be used within <Tabs>");
  return ctx;
}

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: "line" | "pill" | "enclosed";
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  variant = "line",
  children,
  className,
  ...props
}: TabsProps) {
  const [internal, setInternal] = useState(defaultValue);
  const active = value ?? internal;

  const setActive = (id: string) => {
    setInternal(id);
    onValueChange?.(id);
  };

  return (
    <TabsContext.Provider value={{ active, setActive, variant }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

const listVariants = cva("flex", {
  variants: {
    variant: {
      line: "border-b border-[color:var(--color-border)] gap-0",
      pill: "gap-1 p-1 bg-[color:var(--color-muted)] rounded-lg w-fit",
      enclosed: "border border-[color:var(--color-border)] rounded-t-lg gap-0 overflow-hidden",
    },
  },
});

export function TabsList({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { variant } = useTabsContext();
  return (
    <div role="tablist" className={cn(listVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
}

const triggerVariants = cva(
  "inline-flex items-center gap-2 text-sm font-medium transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        line: "px-4 py-2.5 border-b-2 border-transparent -mb-px rounded-none text-[color:var(--color-foreground-muted)] hover:text-[color:var(--color-foreground)] data-[active=true]:border-[color:var(--color-primary)] data-[active=true]:text-[color:var(--color-primary)]",
        pill: "px-3 py-1.5 rounded-md text-[color:var(--color-foreground-muted)] hover:text-[color:var(--color-foreground)] data-[active=true]:bg-[color:var(--color-background)] data-[active=true]:text-[color:var(--color-foreground)] data-[active=true]:shadow-sm",
        enclosed:
          "px-4 py-2.5 border-r border-[color:var(--color-border)] last:border-r-0 text-[color:var(--color-foreground-muted)] hover:bg-[color:var(--color-muted)] data-[active=true]:bg-[color:var(--color-background)] data-[active=true]:text-[color:var(--color-foreground)]",
      },
    },
  },
);

export interface TabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  icon?: ReactNode;
  badge?: ReactNode;
}

export function TabsTrigger({
  value,
  icon,
  badge,
  children,
  className,
  ...props
}: TabsTriggerProps) {
  const { active, setActive, variant } = useTabsContext();
  const isActive = active === value;

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isActive}
      data-active={isActive}
      tabIndex={isActive ? 0 : -1}
      onClick={() => setActive(value)}
      className={cn(triggerVariants({ variant }), className)}
      {...props}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
      {badge && <span>{badge}</span>}
    </button>
  );
}

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({ value, children, className, ...props }: TabsContentProps) {
  const { active } = useTabsContext();
  if (active !== value) return null;

  return (
    <div
      role="tabpanel"
      tabIndex={0}
      className={cn("mt-4 focus-visible:outline-none", className)}
      {...props}
    >
      {children}
    </div>
  );
}
