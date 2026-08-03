"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";

import { cn } from "@nova/utils";

export interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "end" | "center";
  side?: "top" | "bottom";
  className?: string;
}

const alignClasses = {
  start: "left-0",
  end: "right-0",
  center: "left-1/2 -translate-x-1/2",
};

const sideClasses = {
  top: "bottom-full mb-2",
  bottom: "top-full mt-2",
};

export function Popover({
  trigger,
  children,
  align = "start",
  side = "bottom",
  className,
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", onOutside);
      document.addEventListener("keydown", onEsc);
    }
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <span onClick={() => setOpen((v) => !v)} className="cursor-pointer">
        {trigger}
      </span>

      {open && (
        <div
          role="dialog"
          className={cn(
            "absolute z-[1000] min-w-[12rem] rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] p-4 shadow-lg",
            "animate-[nova-scale-in_150ms_var(--ease-spring)_both]",
            alignClasses[align],
            sideClasses[side],
            className,
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
