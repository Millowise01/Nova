export type Brand<K extends string, T> = T & { readonly __brand: K };

export type ID = Brand<"ID", string>;
export type ISODateString = Brand<"ISODateString", string>;

/**
 * Currencies supported at launch. SLE is Sierra Leone's New Leone (post-2022
 * redenomination) — never SLL, which is the retired pre-2022 code.
 */
export type CurrencyCode = "SLE" | "USD";

/**
 * Canonical money representation shared across the platform. Amount is a
 * decimal string, never a number/float, so precision is never lost across
 * serialization or arithmetic.
 */
export interface Money {
  amount: string;
  currency: CurrencyCode;
}
