export type FeatureFlagName = "newCheckout" | "sellerInsights" | "adminMetrics";

export const defaultFeatureFlags: Record<FeatureFlagName, boolean> = {
  newCheckout: false,
  sellerInsights: false,
  adminMetrics: false
};