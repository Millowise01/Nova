import { apiClient } from "@/lib/axios";

export const authApi = {
  login: (payload: { email: string; password: string }) => apiClient.post("/auth/login", payload),
  register: (payload: Record<string, unknown>) => apiClient.post("/auth/register", payload),
};

export const orderApi = {
  list: () => apiClient.get("/orders"),
  track: (id: string) => apiClient.get(`/orders/${id}/tracking`),
};

export const sellerApi = {
  dashboard: () => apiClient.get("/seller/dashboard"),
};

export const adminApi = {
  analytics: () => apiClient.get("/admin/analytics"),
};
