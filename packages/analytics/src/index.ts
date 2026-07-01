export type AnalyticsEvent = {
  name: string;
  properties?: Record<string, string | number | boolean>;
};

export function trackEvent(event: AnalyticsEvent) {
  return event;
}