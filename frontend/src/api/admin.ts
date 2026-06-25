import { api } from '@/lib/axios';

import type { ApiResponse } from '@/api/auth';
import type { Order, User } from '@/types/domain';
import type { SellerProfile } from '@/api/seller';

export type AdminDashboard = {
  revenue: number;
  users: number;
  sellers: number;
  orders: number;
};

export type AdminAnalytics = {
  revenue: number;
  userGrowth: Array<{ date: string; count: number }>;
  categoryBreakdown: Array<{ category: string; count: number }>;
};

export async function fetchAdminDashboard() {
  const response = await api.get<ApiResponse<AdminDashboard>>('/admin/dashboard');
  return response.data.data;
}

export async function fetchUsers(page = 1, limit = 10, search = '') {
  const response = await api.get<ApiResponse<{ data: User[]; meta: { page: number; limit: number; total: number; totalPages: number } }>>(
    `/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
  );
  return response.data.data;
}

export async function toggleUserBan(userId: string) {
  const response = await api.patch<ApiResponse<User>>(`/admin/users/${userId}/ban`);
  return response.data.data;
}

export async function fetchSellers() {
  const response = await api.get<ApiResponse<SellerProfile[]>>('/admin/sellers');
  return response.data.data;
}

export async function verifySeller(sellerId: string) {
  const response = await api.patch<ApiResponse<SellerProfile>>(`/admin/sellers/${sellerId}/verify`);
  return response.data.data;
}

export async function ecoCertifySeller(sellerId: string) {
  const response = await api.patch<ApiResponse<SellerProfile>>(`/admin/sellers/${sellerId}/eco-certify`);
  return response.data.data;
}

export async function fetchAdminOrders() {
  const response = await api.get<ApiResponse<Order[]>>('/admin/orders');
  return response.data.data;
}

export async function fetchAdminAnalytics() {
  const response = await api.get<ApiResponse<AdminAnalytics>>('/admin/analytics');
  return response.data.data;
}