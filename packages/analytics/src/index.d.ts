export type AnalyticsEvent = {
    name: string;
    properties?: Record<string, string | number | boolean>;
};
export declare function trackEvent(event: AnalyticsEvent): AnalyticsEvent;
