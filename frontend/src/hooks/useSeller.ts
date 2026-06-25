import { useQuery } from '@tanstack/react-query';

import { fetchSellerAnalytics, fetchSellerDashboard, fetchSellerOrders, fetchSellerProducts, fetchSellerProfile } from '@/api/seller';

export function useSellerProfileQuery() {
  return useQuery({ queryKey: ['seller', 'profile'], queryFn: fetchSellerProfile });
}

export function useSellerDashboardQuery() {
  return useQuery({ queryKey: ['seller', 'dashboard'], queryFn: fetchSellerDashboard });
}

export function useSellerAnalyticsQuery(from: string, to: string) {
  return useQuery({ queryKey: ['seller', 'analytics', from, to], queryFn: () => fetchSellerAnalytics(from, to), enabled: Boolean(from && to) });
}

export function useSellerProductsQuery(page = 1, limit = 12) {
  return useQuery({ queryKey: ['seller', 'products', page, limit], queryFn: () => fetchSellerProducts(page, limit) });
}

export function useSellerOrdersQuery(status?: string) {
  return useQuery({ queryKey: ['seller', 'orders', status ?? 'all'], queryFn: () => fetchSellerOrders(status) });
}