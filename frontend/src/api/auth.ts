import { api } from '@/lib/axios';

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
  avatarUrl?: string | null;
  isVerified: boolean;
};

export type AuthSession = {
  accessToken: string;
  user: AuthUser;
};

export type LoginInput = {
  identifier: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: 'CUSTOMER' | 'SELLER';
};

export type OtpSendInput = {
  phone: string;
};

export type OtpVerifyInput = {
  phone: string;
  otp: string;
};

export type ForgotPasswordInput = {
  email: string;
};

export type ResetPasswordInput = {
  token: string;
  password: string;
};

export async function login(payload: LoginInput) {
  const response = await api.post<ApiResponse<AuthSession>>('/auth/login', payload);
  return response.data.data;
}

export async function register(payload: RegisterInput) {
  const response = await api.post<ApiResponse<AuthSession>>('/auth/register', payload);
  return response.data.data;
}

export async function refreshSession() {
  const response = await api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh');
  return response.data.data;
}

export async function logout() {
  const response = await api.post<ApiResponse<null>>('/auth/logout');
  return response.data.data;
}

export async function sendOtp(payload: OtpSendInput) {
  const response = await api.post<ApiResponse<null>>('/auth/send-otp', payload);
  return response.data.data;
}

export async function verifyOtp(payload: OtpVerifyInput) {
  const response = await api.post<ApiResponse<{ verified: boolean }>>('/auth/verify-otp', payload);
  return response.data.data;
}

export async function forgotPassword(payload: ForgotPasswordInput) {
  const response = await api.post<ApiResponse<null>>('/auth/forgot-password', payload);
  return response.data.data;
}

export async function resetPassword(payload: ResetPasswordInput) {
  const response = await api.post<ApiResponse<null>>('/auth/reset-password', payload);
  return response.data.data;
}