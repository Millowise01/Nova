"use client";

import { Check, ChevronDown, X } from "lucide-react";
import { useState, useRef, useId, useEffect, useMemo, type KeyboardEvent } from "react";

import { cn } from "@nova/utils";

import type { SelectOption } from "./select";

export interface ComboboxProps {
  options: SelectOption[];
  /** Selected value(s). Single string in single mode, string[] in multi mode. */
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  multiple?: boolean;
  label?: string;
  helperText?: string;
  error?: string;
  placeholder?: string;
  hideLabel?: boolean;
  disabled?: boolean;
  loading?: boolean;
  inputSize?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "min-h-8 px-2.5 text-xs",
  md: "min-h-10 px-3 text-sm",
  lg: "min-h-11 px-4 text-base",
};

function toArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Searchable single/multi-select — WAI-ARIA combobox pattern (role="combobox"
 * + listbox popup, not native `<select>`). Use `multiple` for a multi-select
 * / tag-picker with filter-as-you-type autocomplete behavior.
 */
export function Combobox({
  options,
  value,
  defaultValue,
  onChange,
  multiple = false,
  label,
  helperText,
  error,
  placeholder = "Select...",
  hideLabel = false,
  disabled = false,
  loading = false,
  inputSize = "md",
  className,
}: ComboboxProps) {
  const [internal, setInternal] = useState<string[]>(toArray(defaultValue));
  const selected = value !== undefined ? toArray(value) : internal;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const id = useId();
  const listboxId = `${id}-listbox`;
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const hasError = Boolean(error);

  const filtered = useMemo(() => {
    if (!query) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (activeIndex >= filtered.length) setActiveIndex(Math.max(0, filtered.length - 1));
  }, [filtered.length, activeIndex]);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    if (open) document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  function commit(next: string[]) {
    if (value === undefined) setInternal(next);
    onChange?.(multiple ? next : (next[0] ?? ""));
  }

  function selectOption(opt: SelectOption) {
    if (opt.disabled) return;
    if (multiple) {
      const next = selected.includes(opt.value)
        ? selected.filter((v) => v !== opt.value)
        : [...selected, opt.value];
      commit(next);
      setQuery("");
      inputRef.current?.focus();
    } else {
      commit([opt.value]);
      setOpen(false);
      setQuery("");
    }
  }

  function removeChip(v: string) {
    commit(selected.filter((s) => s !== v));
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(filtered.length - 1);
        break;
      case "Enter":
        e.preventDefault();
        if (filtered[activeIndex]) selectOption(filtered[activeIndex]);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        setQuery("");
        break;
      case "Backspace":
        if (multiple && query === "" && selected.length > 0) {
          removeChip(selected[selected.length - 1]);
        }
        break;
    }
  }

  const selectedOptions = options.filter((o) => selected.includes(o.value));
  const activeOption = filtered[activeIndex];

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
        <div
          className={cn(
            "flex w-full flex-wrap items-center gap-1.5 rounded-md border bg-[color:var(--color-background)] outline-none transition-colors duration-100",
            "focus-within:ring-2 focus-within:ring-[color:var(--color-border-focus)] focus-within:ring-offset-1",
            "disabled:cursor-not-allowed",
            hasError
              ? "border-[color:var(--color-error)]"
              : "border-[color:var(--color-border-input)] hover:border-[color:var(--color-border-strong)]",
            disabled && "cursor-not-allowed bg-[color:var(--color-muted)] opacity-50",
            sizeClasses[inputSize],
          )}
          onClick={() => !disabled && inputRef.current?.focus()}
        >
          {multiple &&
            selectedOptions.map((o) => (
              <span
                key={o.value}
                className="inline-flex items-center gap-1 rounded bg-[color:var(--color-secondary)] px-1.5 py-0.5 text-xs font-medium text-[color:var(--color-secondary-foreground)]"
              >
                {o.label}
                <button
                  type="button"
                  aria-label={`Remove ${o.label}`}
                  className="rounded-sm hover:opacity-70"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeChip(o.value);
                  }}
                >
                  <X size={12} aria-hidden="true" />
                </button>
              </span>
            ))}

          <input
            ref={inputRef}
            id={id}
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={
              open && activeOption ? `${listboxId}-${activeOption.value}` : undefined
            }
            aria-invalid={hasError || undefined}
            aria-describedby={
              [hasError && errorId, helperText && helperId].filter(Boolean).join(" ") || undefined
            }
            disabled={disabled}
            placeholder={multiple && selectedOptions.length > 0 ? "" : placeholder}
            value={query || (!multiple && !open ? (selectedOptions[0]?.label ?? "") : query)}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActiveIndex(0);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            className="min-w-[4rem] flex-1 bg-transparent text-[color:var(--color-foreground)] outline-none placeholder:text-[color:var(--color-foreground-subtle)] disabled:cursor-not-allowed"
            {...(!multiple ? { readOnly: !open } : {})}
          />

          <ChevronDown
            size={16}
            aria-hidden="true"
            className={cn(
              "ml-auto shrink-0 text-[color:var(--color-foreground-subtle)] transition-transform duration-100",
              open && "rotate-180",
            )}
          />
        </div>

        {open && (
          <ul
            id={listboxId}
            role="listbox"
            aria-multiselectable={multiple || undefined}
            className="absolute z-[1000] mt-1 max-h-60 w-full animate-[nova-scale-in_150ms_ease-out_both] overflow-auto rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] py-1 shadow-lg"
          >
            {loading && (
              <li className="px-3 py-2 text-sm text-[color:var(--color-foreground-muted)]">
                Loading…
              </li>
            )}
            {!loading && filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-[color:var(--color-foreground-muted)]">
                No results
              </li>
            )}
            {!loading &&
              filtered.map((opt, i) => {
                const isSelected = selected.includes(opt.value);
                const isActive = i === activeIndex;
                return (
                  <li
                    key={opt.value}
                    id={`${listboxId}-${opt.value}`}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={opt.disabled || undefined}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => selectOption(opt)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm text-[color:var(--color-foreground)] transition-colors duration-75",
                      isActive && "bg-[color:var(--color-muted)]",
                      opt.disabled && "pointer-events-none opacity-50",
                    )}
                  >
                    {opt.label}
                    {isSelected && (
                      <Check
                        size={14}
                        aria-hidden="true"
                        className="shrink-0 text-[color:var(--color-primary)]"
                      />
                    )}
                  </li>
                );
              })}
          </ul>
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
