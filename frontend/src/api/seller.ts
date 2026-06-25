import { api } from '@/lib/axios';

import type { ApiResponse } from '@/api/auth';
import type { Product, SellerSummary } from '@/api/products';
import type { Order } from '@/types/domain';

export type SellerProfile = SellerSummary & {
  userId: string;
  shopDescription?: string | null;
  ecoCertNumber?: string | null;
  totalSales: number;
};

export type SellerDashboard = {
  mtdRevenue: number;
  orderCount: number;
  avgRating: number;
  recentOrders: Order[];
  topProducts: Product[];
};

export type SellerAnalyticsPoint = {
  date: string;
  revenue: number;
  orders: number;
};

export async function fetchSellerProfile() {
  const response = await api.get<ApiResponse<SellerProfile>>('/seller/profile');
  return response.data.data;
}

export async function updateSellerProfile(payload: Partial<SellerProfile>) {
  const response = await api.patch<ApiResponse<SellerProfile>>('/seller/profile', payload);
  return response.data.data;
}

export async function fetchSellerDashboard() {
  const response = await api.get<ApiResponse<SellerDashboard>>('/seller/dashboard');
  return response.data.data;
}

export async function fetchSellerAnalytics(from: string, to: string) {
  const response = await api.get<ApiResponse<SellerAnalyticsPoint[]>>(`/seller/analytics?from=${from}&to=${to}`);
  return response.data.data;
}

export async function fetchSellerProducts(page = 1, limit = 12) {
  const response = await api.get<ApiResponse<{ data: Product[]; meta: { page: number; limit: number; total: number; totalPages: number } }>>(
    `/seller/products?page=${page}&limit=${limit}`,
  );
  return response.data.data;
}

export async function fetchSellerOrders(status?: string) {
  const query = status ? `?status=${status}` : '';
  const response = await api.get<ApiResponse<Order[]>>(`/seller/orders${query}`);
  return response.data.data;
}