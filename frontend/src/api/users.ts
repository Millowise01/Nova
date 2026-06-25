import { api } from '@/lib/axios';

import type { ApiResponse, AuthUser } from '@/api/auth';
import type { Address } from '@/types/domain';

export type UpdateProfileInput = {
  name?: string;
  email?: string;
  avatarUrl?: string | null;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type WishlistItem = {
  id: string;
  productId: string;
  addedAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: { id: string; url: string; alt?: string | null }[];
  };
};

export async function fetchMe() {
  const response = await api.get<ApiResponse<AuthUser>>('/users/me');
  return response.data.data;
}

export async function updateMe(payload: UpdateProfileInput) {
  const response = await api.patch<ApiResponse<AuthUser>>('/users/me', payload);
  return response.data.data;
}

export async function changePassword(payload: ChangePasswordInput) {
  const response = await api.patch<ApiResponse<null>>('/users/me/password', payload);
  return response.data.data;
}

export async function fetchAddresses() {
  const response = await api.get<ApiResponse<Address[]>>('/users/me/addresses');
  return response.data.data;
}

export async function createAddress(payload: Omit<Address, 'id' | 'userId'>) {
  const response = await api.post<ApiResponse<Address>>('/users/me/addresses', payload);
  return response.data.data;
}

export async function deleteAddress(addressId: string) {
  const response = await api.delete<ApiResponse<null>>(`/users/me/addresses/${addressId}`);
  return response.data.data;
}

export async function fetchWishlist() {
  const response = await api.get<ApiResponse<WishlistItem[]>>('/users/me/wishlist');
  return response.data.data;
}

export async function toggleWishlist(productId: string) {
  const response = await api.post<ApiResponse<{ wished: boolean }>>(`/users/me/wishlist/${productId}`);
  return response.data.data;
}