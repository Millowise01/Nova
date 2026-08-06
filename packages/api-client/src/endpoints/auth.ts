import {
  authResponseSchema,
  refreshResponseSchema,
  type AuthResponse,
  type LoginInput,
  type RefreshResponse,
  type RegisterInput,
} from "@nova/validation";

import type { ApiEnvelope, NovaHttpClient } from "../http-client";

export function createAuthEndpoints(client: NovaHttpClient) {
  return {
    async signup(input: RegisterInput): Promise<AuthResponse> {
      const response = await client.post<ApiEnvelope>("/auth/signup", input);
      return authResponseSchema.parse(response.data.data);
    },

    async login(input: LoginInput): Promise<AuthResponse> {
      const response = await client.post<ApiEnvelope>("/auth/login", input);
      return authResponseSchema.parse(response.data.data);
    },

    async refresh(refreshToken: string): Promise<RefreshResponse> {
      const response = await client.post<ApiEnvelope>("/auth/refresh", { refreshToken });
      return refreshResponseSchema.parse(response.data.data);
    },
  };
}
