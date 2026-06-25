import { api } from '@/lib/axios';

import type { ApiResponse } from '@/api/auth';
import type { Address, Order } from '@/types/domain';

export type PlaceOrderInput = {
  addressId: string;
  paymentMethod: 'ORANGE_MONEY' | 'AFRICELL_MONEY' | 'CARD';
  notes?: string;
  what3words?: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
};

export type OrderDetail = Order & {
  items: Order['items'];
  deliveryAddress: Address;
};

export async function placeOrder(payload: PlaceOrderInput) {
  const response = await api.post<ApiResponse<OrderDetail>>('/orders', payload);
  return response.data.data;
}

export async function fetchOrders(page = 1, limit = 10) {
  const response = await api.get<ApiResponse<{ data: Order[]; meta: { page: number; limit: number; total: number; totalPages: number } }>>(
    `/orders?page=${page}&limit=${limit}`,
  );
  return response.data.data;
}

export async function fetchOrderById(orderId: string) {
  const response = await api.get<ApiResponse<OrderDetail>>(`/orders/${orderId}`);
  return response.data.data;
}

export async function cancelOrder(orderId: string) {
  const response = await api.post<ApiResponse<OrderDetail>>(`/orders/${orderId}/cancel`);
  return response.data.data;
}