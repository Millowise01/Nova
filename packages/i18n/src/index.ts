import { APP_NAME } from "@nova/constants";

export const defaultMessages = {
  appName: APP_NAME,
  loading: "Loading"
} as const;

export type MessageKey = keyof typeof defaultMessages;
