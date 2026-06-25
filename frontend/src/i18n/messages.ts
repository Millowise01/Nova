export const messages = {
  en: {
    greeting: "Welcome to Nova",
  },
  kri: {
    greeting: "Kushe na Nova",
  },
} as const;

export type Locale = keyof typeof messages;
