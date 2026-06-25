import { apiClient } from "@/lib/axios";
import type {
  User,
  Product,
  Order,
  Address,
  WishlistItem,
  Notification,
  Seller,
  Category,
  Brand,
  Review,
  SellerDashboard,
  AdminDashboard,
  Coupon,
} from "@/types/domain";

type ApiResponse<T> = { success: boolean; data: T; message?: string };
type Paginated<T> = { data: T[]; meta: { page: number; limit: number; total: number; totalPages: number } };

/* ── Auth ── */
export const authApi = {
  login: (payload: { email: string; password: string }) =>
    apiClient.post<ApiResponse<{ accessToken: string; user: User }>>("/auth/login", payload),
  signup: (payload: Record<string, unknown>) =>
    apiClient.post<ApiResponse<{ accessToken: string; user: User }>>("/auth/register", payload),
  logout: () => apiClient.post<ApiResponse<null>>("/auth/logout"),
  refresh: () => apiClient.post<ApiResponse<{ accessToken: string }>>("/auth/refresh"),
  sendOtp: (phone: string) => apiClient.post<ApiResponse<null>>("/auth/send-otp", { phone }),
  verifyOtp: (phone: string, otp: string) =>
    apiClient.post<ApiResponse<{ verified: boolean }>>("/auth/verify-otp", { phone, otp }),
  forgotPassword: (email: string) =>
    apiClient.post<ApiResponse<null>>("/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string) =>
    apiClient.post<ApiResponse<null>>("/auth/reset-password", { token, password }),
};

/* ── Products ── */
export const productsApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<ApiResponse<Paginated<Product>>>("/products", { params }),
  featured: () => apiClient.get<ApiResponse<Product[]>>("/products/featured"),
  bySlug: (slug: string) => apiClient.get<ApiResponse<{ product: Product; reviews: Paginated<Review> }>>(`/products/${slug}`),
  related: (slug: string) => apiClient.get<ApiResponse<Product[]>>(`/products/${slug}/related`),
  incrementView: (slug: string) => apiClient.post(`/products/${slug}/view`),
};

/* ── Categories ── */
export const categoriesApi = {
  list: () => apiClient.get<ApiResponse<Category[]>>("/categories"),
};

/* ── Brands ── */
export const brandsApi = {
  list: () => apiClient.get<ApiResponse<Brand[]>>("/brands"),
};

/* ── Orders ── */
export const ordersApi = {
  list: (page = 1, limit = 10) =>
    apiClient.get<ApiResponse<Paginated<Order>>>(`/orders?page=${page}&limit=${limit}`),
  byId: (id: string) => apiClient.get<ApiResponse<Order>>(`/orders/${id}`),
  place: (payload: Record<string, unknown>) =>
    apiClient.post<ApiResponse<Order>>("/orders", payload),
  cancel: (id: string) => apiClient.post<ApiResponse<Order>>(`/orders/${id}/cancel`),
};

/* ── Users ── */
export const usersApi = {
  me: () => apiClient.get<ApiResponse<User>>("/users/me"),
  updateMe: (payload: Partial<User>) => apiClient.patch<ApiResponse<User>>("/users/me", payload),
  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    apiClient.patch<ApiResponse<null>>("/users/me/password", payload),
  addresses: () => apiClient.get<ApiResponse<Address[]>>("/users/me/addresses"),
  createAddress: (payload: Partial<Address>) =>
    apiClient.post<ApiResponse<Address>>("/users/me/addresses", payload),
  deleteAddress: (id: string) => apiClient.delete(`/users/me/addresses/${id}`),
  wishlist: () => apiClient.get<ApiResponse<WishlistItem[]>>("/users/me/wishlist"),
  toggleWishlist: (productId: string) =>
    apiClient.post<ApiResponse<{ wished: boolean }>>(`/users/me/wishlist/${productId}`),
  notifications: () => apiClient.get<ApiResponse<Notification[]>>("/users/me/notifications"),
  markNotificationRead: (id: string) =>
    apiClient.patch<ApiResponse<null>>(`/users/me/notifications/${id}/read`),
};

/* ── Seller ── */
export const sellerApi = {
  dashboard: () => apiClient.get<ApiResponse<SellerDashboard>>("/seller/dashboard"),
  profile: () => apiClient.get<ApiResponse<Seller>>("/seller/profile"),
  updateProfile: (payload: Partial<Seller>) =>
    apiClient.patch<ApiResponse<Seller>>("/seller/profile", payload),
  products: (page = 1) =>
    apiClient.get<ApiResponse<Paginated<Product>>>(`/seller/products?page=${page}`),
  orders: (status?: string) =>
    apiClient.get<ApiResponse<Order[]>>(`/seller/orders${status ? `?status=${status}` : ""}`),
  analytics: (from: string, to: string) =>
    apiClient.get(`/seller/analytics?from=${from}&to=${to}`),
  coupons: () => apiClient.get<ApiResponse<Coupon[]>>("/seller/coupons"),
  createCoupon: (payload: Partial<Coupon>) =>
    apiClient.post<ApiResponse<Coupon>>("/seller/coupons", payload),
  register: (payload: Record<string, unknown>) =>
    apiClient.post<ApiResponse<Seller>>("/seller/register", payload),
};

/* ── Admin ── */
export const adminApi = {
  dashboard: () => apiClient.get<ApiResponse<AdminDashboard>>("/admin/dashboard"),
  users: (page = 1, search = "") =>
    apiClient.get<ApiResponse<Paginated<User>>>(`/admin/users?page=${page}&search=${encodeURIComponent(search)}`),
  toggleBan: (userId: string) => apiClient.patch(`/admin/users/${userId}/ban`),
  sellers: () => apiClient.get<ApiResponse<Seller[]>>("/admin/sellers"),
  verifySeller: (id: string) => apiClient.patch(`/admin/sellers/${id}/verify`),
  products: (page = 1) => apiClient.get<ApiResponse<Paginated<Product>>>(`/admin/products?page=${page}`),
  categories: () => apiClient.get<ApiResponse<Category[]>>("/admin/categories"),
  createCategory: (payload: Partial<Category>) =>
    apiClient.post<ApiResponse<Category>>("/admin/categories", payload),
  orders: () => apiClient.get<ApiResponse<Order[]>>("/admin/orders"),
  analytics: () => apiClient.get("/admin/analytics"),
};
