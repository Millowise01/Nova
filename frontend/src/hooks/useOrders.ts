import { useMutation, useQuery } from '@tanstack/react-query';

import { cancelOrder, fetchOrderById, fetchOrders, placeOrder } from '@/api/orders';

export function useOrdersQuery(page = 1, limit = 10) {
  return useQuery({ queryKey: ['orders', 'list', page, limit], queryFn: () => fetchOrders(page, limit) });
}

export function useOrderQuery(orderId: string) {
  return useQuery({ queryKey: ['orders', orderId], queryFn: () => fetchOrderById(orderId), enabled: Boolean(orderId) });
}

export function usePlaceOrderMutation() {
  return useMutation({ mutationFn: placeOrder });
}

export function useCancelOrderMutation() {
  return useMutation({ mutationFn: cancelOrder });
}