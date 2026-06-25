import { useQuery } from '@tanstack/react-query';

import { fetchAdminAnalytics, fetchAdminDashboard, fetchAdminOrders, fetchSellers, fetchUsers } from '@/api/admin';

export function useAdminDashboardQuery() {
  return useQuery({ queryKey: ['admin', 'dashboard'], queryFn: fetchAdminDashboard });
}

export function useAdminAnalyticsQuery() {
  return useQuery({ queryKey: ['admin', 'analytics'], queryFn: fetchAdminAnalytics });
}

export function useAdminUsersQuery(page = 1, limit = 10, search = '') {
  return useQuery({ queryKey: ['admin', 'users', page, limit, search], queryFn: () => fetchUsers(page, limit, search) });
}

export function useAdminSellersQuery() {
  return useQuery({ queryKey: ['admin', 'sellers'], queryFn: fetchSellers });
}

export function useAdminOrdersQuery() {
  return useQuery({ queryKey: ['admin', 'orders'], queryFn: fetchAdminOrders });
}