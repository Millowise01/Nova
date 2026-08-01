"use client";

import { useState, type HTMLAttributes } from "react";
import { cn } from "@nova/utils";
import { Minus, Plus } from "lucide-react";

export interface QuantityInputProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  onChange?: (value: number) => void;
}

const sizeClasses = {
  sm: { btn: "h-7 w-7", input: "h-7 w-10 text-xs", icon: 12 },
  md: { btn: "h-9 w-9", input: "h-9 w-12 text-sm", icon: 14 },
  lg: { btn: "h-10 w-10", input: "h-10 w-14 text-base", icon: 16 },
};

export function QuantityInput({
  value: controlledValue,
  defaultValue = 1,
  min = 1,
  max = 999,
  step = 1,
  disabled = false,
  size = "md",
  onChange,
  className,
  ...props
}: QuantityInputProps) {
  const [internal, setInternal] = useState(defaultValue);
  const value = controlledValue ?? internal;

  function update(next: number) {
    const clamped = Math.min(max, Math.max(min, next));
    setInternal(clamped);
    onChange?.(clamped);
  }

  const s = sizeClasses[size];

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border border-[color:var(--color-border-input)]",
        className,
      )}
      {...props}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || value <= min}
        onClick={() => update(value - step)}
        className={cn(
          s.btn,
          "flex items-center justify-center rounded-l-md border-r border-[color:var(--color-border-input)]",
          "text-[color:var(--color-foreground-muted)] hover:bg-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)]",
          "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)]",
          "disabled:pointer-events-none disabled:opacity-40",
        )}
      >
        <Minus size={s.icon} aria-hidden="true" />
      </button>

      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        aria-label="Quantity"
        onChange={(e) => update(Number(e.target.value))}
        className={cn(
          s.input,
          "border-0 bg-transparent text-center font-medium text-[color:var(--color-foreground)]",
          "[appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          "disabled:opacity-50",
        )}
      />

      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled || value >= max}
        onClick={() => update(value + step)}
        className={cn(
          s.btn,
          "flex items-center justify-center rounded-r-md border-l border-[color:var(--color-border-input)]",
          "text-[color:var(--color-foreground-muted)] hover:bg-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)]",
          "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)]",
          "disabled:pointer-events-none disabled:opacity-40",
        )}
      >
        <Plus size={s.icon} aria-hidden="true" />
      </button>
    </div>
  );
}
