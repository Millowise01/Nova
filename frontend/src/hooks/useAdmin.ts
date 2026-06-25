import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ecoCertifySeller, fetchAdminAnalytics, fetchAdminDashboard, fetchAdminOrders, fetchSellers, fetchUsers, toggleUserBan, verifySeller } from '@/api/admin';

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

export function useToggleUserBanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleUserBan,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export function useVerifySellerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifySeller,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'sellers'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export function useEcoCertifySellerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ecoCertifySeller,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'sellers'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}