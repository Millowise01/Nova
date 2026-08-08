"use client";

import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useId, useEffect, useMemo, type KeyboardEvent } from "react";

import { cn } from "@nova/utils";

export interface DatePickerProps {
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date) => void;
  label?: string;
  helperText?: string;
  error?: string;
  placeholder?: string;
  hideLabel?: boolean;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  inputSize?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 px-2.5 text-xs",
  md: "h-10 px-3 text-sm",
  lg: "h-11 px-4 text-base",
};

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function isBeforeDay(a: Date, b: Date) {
  return (
    new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime() <
    new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime()
  );
}
function isAfterDay(a: Date, b: Date) {
  return (
    new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime() >
    new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime()
  );
}
function isDisabled(day: Date, min?: Date, max?: Date) {
  if (min && isBeforeDay(day, min)) return true;
  if (max && isAfterDay(day, max)) return true;
  return false;
}
function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric" }).format(
    date,
  );
}
function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "long" }).format(date);
}
function buildGrid(viewDate: Date): (Date | null)[] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array.from({ length: firstWeekday }, () => null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

/** Single-date picker — button trigger + popover calendar grid, full keyboard navigation. */
export function DatePicker({
  value,
  defaultValue,
  onChange,
  label,
  helperText,
  error,
  placeholder = "Select a date",
  hideLabel = false,
  disabled = false,
  minDate,
  maxDate,
  inputSize = "md",
  className,
}: DatePickerProps) {
  const [internal, setInternal] = useState<Date | undefined>(defaultValue);
  const selected = value ?? internal;

  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(selected ?? new Date());
  const [focusedDate, setFocusedDate] = useState(selected ?? new Date());

  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const hasError = Boolean(error);

  const cells = useMemo(() => buildGrid(viewDate), [viewDate]);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", onOutside);
      document.addEventListener("keydown", onEsc);
      requestAnimationFrame(() => {
        gridRef.current?.querySelector<HTMLButtonElement>('[tabindex="0"]')?.focus();
      });
    }
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  function commit(date: Date) {
    if (value === undefined) setInternal(date);
    onChange?.(date);
    setOpen(false);
  }

  function moveFocus(days: number) {
    const next = new Date(focusedDate);
    next.setDate(next.getDate() + days);
    setFocusedDate(next);
    if (next.getMonth() !== viewDate.getMonth() || next.getFullYear() !== viewDate.getFullYear()) {
      setViewDate(next);
    }
  }

  function onGridKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        moveFocus(1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        moveFocus(-1);
        break;
      case "ArrowDown":
        e.preventDefault();
        moveFocus(7);
        break;
      case "ArrowUp":
        e.preventDefault();
        moveFocus(-7);
        break;
      case "PageUp": {
        e.preventDefault();
        const next = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
        setViewDate(next);
        setFocusedDate(next);
        break;
      }
      case "PageDown": {
        e.preventDefault();
        const next = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
        setViewDate(next);
        setFocusedDate(next);
        break;
      }
      case "Enter":
      case " ":
        e.preventDefault();
        if (!isDisabled(focusedDate, minDate, maxDate)) commit(focusedDate);
        break;
    }
  }

  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)} ref={rootRef}>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "text-sm font-medium text-[color:var(--color-foreground)]",
            hideLabel && "sr-only",
            disabled && "opacity-50",
          )}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          id={id}
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-invalid={hasError || undefined}
          aria-describedby={
            [hasError && errorId, helperText && helperId].filter(Boolean).join(" ") || undefined
          }
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex w-full items-center gap-2 rounded-md border bg-[color:var(--color-background)] text-left outline-none transition-colors duration-100",
            "focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)] focus-visible:ring-offset-1",
            "disabled:cursor-not-allowed disabled:bg-[color:var(--color-muted)] disabled:opacity-50",
            hasError
              ? "border-[color:var(--color-error)]"
              : "border-[color:var(--color-border-input)] hover:border-[color:var(--color-border-strong)]",
            sizeClasses[inputSize],
          )}
        >
          <Calendar
            size={16}
            aria-hidden="true"
            className="shrink-0 text-[color:var(--color-foreground-subtle)]"
          />
          <span
            className={cn(
              "flex-1 truncate",
              selected
                ? "text-[color:var(--color-foreground)]"
                : "text-[color:var(--color-foreground-subtle)]",
            )}
          >
            {selected ? formatDate(selected) : placeholder}
          </span>
        </button>

        {open && (
          <div
            role="dialog"
            aria-label="Choose date"
            className="absolute z-[1000] mt-1 w-72 animate-[nova-scale-in_150ms_ease-out_both] rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] p-3 shadow-lg"
          >
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() =>
                  setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
                }
                className="rounded-md p-1.5 text-[color:var(--color-foreground-muted)] hover:bg-[color:var(--color-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)]"
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
                {monthLabel(viewDate)}
              </p>
              <button
                type="button"
                aria-label="Next month"
                onClick={() =>
                  setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
                }
                className="rounded-md p-1.5 text-[color:var(--color-foreground-muted)] hover:bg-[color:var(--color-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)]"
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 pb-1 text-center text-xs font-medium text-[color:var(--color-foreground-subtle)]">
              {WEEKDAYS.map((w) => (
                <span key={w}>{w}</span>
              ))}
            </div>

            <div
              ref={gridRef}
              role="grid"
              onKeyDown={onGridKeyDown}
              className="grid grid-cols-7 gap-1"
            >
              {cells.map((day, i) => {
                if (!day) return <span key={`pad-${i}`} />;
                const dayDisabled = isDisabled(day, minDate, maxDate);
                const isSelected = selected && sameDay(day, selected);
                const isFocused = sameDay(day, focusedDate);
                const isToday = sameDay(day, new Date());

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    role="gridcell"
                    aria-selected={isSelected || undefined}
                    aria-current={isToday ? "date" : undefined}
                    disabled={dayDisabled}
                    tabIndex={isFocused ? 0 : -1}
                    onClick={() => commit(day)}
                    onFocus={() => setFocusedDate(day)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors duration-75",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)]",
                      "disabled:pointer-events-none disabled:opacity-35",
                      isSelected
                        ? "bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)]"
                        : "text-[color:var(--color-foreground)] hover:bg-[color:var(--color-muted)]",
                      !isSelected && isToday && "font-semibold text-[color:var(--color-primary)]",
                    )}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p id={errorId} role="alert" className="text-xs text-[color:var(--color-error)]">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="text-xs text-[color:var(--color-foreground-muted)]">
          {helperText}
        </p>
      )}
    </div>
  );
}
