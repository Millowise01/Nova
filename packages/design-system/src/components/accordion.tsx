"use client";

import { ChevronDown } from "lucide-react";
import {
  createContext,
  useContext,
  useState,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

import { cn } from "@nova/utils";

interface AccordionContextValue {
  openItems: Set<string>;
  toggle: (id: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext() {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error("Accordion sub-components must be used within <Accordion>");
  return ctx;
}

export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple";
  defaultValue?: string | string[];
}

export function Accordion({
  type = "single",
  defaultValue,
  children,
  className,
  ...props
}: AccordionProps) {
  const initial = defaultValue
    ? new Set(Array.isArray(defaultValue) ? defaultValue : [defaultValue])
    : new Set<string>();

  const [openItems, setOpenItems] = useState<Set<string>>(initial);

  function toggle(id: string) {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (type === "single") next.clear();
        next.add(id);
      }
      return next;
    });
  }

  return (
    <AccordionContext.Provider value={{ openItems, toggle }}>
      <div className={cn("divide-y divide-[color:var(--color-border)]", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function AccordionItem({ value, children, className, ...props }: AccordionItemProps) {
  return (
    <div data-value={value} className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

export interface AccordionTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  icon?: ReactNode;
}

export function AccordionTrigger({
  value,
  icon,
  children,
  className,
  ...props
}: AccordionTriggerProps) {
  const { openItems, toggle } = useAccordionContext();
  const isOpen = openItems.has(value);

  return (
    <button
      type="button"
      aria-expanded={isOpen}
      onClick={() => toggle(value)}
      className={cn(
        "flex w-full items-center justify-between gap-4 py-4 text-sm font-medium text-[color:var(--color-foreground)]",
        "transition-colors hover:text-[color:var(--color-primary)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)] focus-visible:ring-offset-1",
        className,
      )}
      {...props}
    >
      <span className="flex items-center gap-2 text-left">
        {icon && <span aria-hidden="true">{icon}</span>}
        {children}
      </span>
      <ChevronDown
        size={16}
        aria-hidden="true"
        className={cn("shrink-0 transition-transform duration-200", isOpen && "rotate-180")}
      />
    </button>
  );
}

export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function AccordionContent({ value, children, className, ...props }: AccordionContentProps) {
  const { openItems } = useAccordionContext();
  const isOpen = openItems.has(value);

  if (!isOpen) return null;

  return (
    <div
      className={cn("pb-4 text-sm text-[color:var(--color-foreground-muted)]", className)}
      {...props}
    >
      {children}
    </div>
  );
}
