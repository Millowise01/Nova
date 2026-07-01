export type Brand<K extends string, T> = T & { readonly __brand: K };

export type ID = Brand<"ID", string>;
export type ISODateString = Brand<"ISODateString", string>;