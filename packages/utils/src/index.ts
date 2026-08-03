import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { Money } from "@nova/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CURRENCY_DISPLAY: Record<Money["currency"], string> = {
  SLE: "NLe",
  USD: "$",
};

/** Formats a Money value for display. Never does arithmetic on the amount string directly. */
export function formatMoney({ amount, currency }: Money): string {
  const numeric = Number(amount);
  const formattedNumber = numeric.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const symbol = CURRENCY_DISPLAY[currency];
  return currency === "USD" ? `${symbol}${formattedNumber}` : `${symbol} ${formattedNumber}`;
}
