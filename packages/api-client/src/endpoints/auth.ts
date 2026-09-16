import {
  authResponseSchema,
  meSchema,
  otpStatusResponseSchema,
  refreshResponseSchema,
  type AuthResponse,
  type LoginInput,
  type MeResponse,
  type OtpStatusResponse,
  type RefreshResponse,
  type RegisterInput,
  type UpdateMeInput,
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

    /** GET /v1/me — own profile, including read-only decrypted email/phone. */
    async getMe(): Promise<MeResponse> {
      const response = await client.get<ApiEnvelope>("/me");
      return meSchema.parse(response.data.data);
    },

    /** PATCH /v1/me — name/locale only; email/phone aren't accepted (see
     *  @nova/validation's updateMeSchema for why). */
    async updateMe(input: UpdateMeInput): Promise<MeResponse> {
      const response = await client.patch<ApiEnvelope>("/me", input);
      return meSchema.parse(response.data.data);
    },

    /** POST /v1/auth/otp — sends a code to destination; doesn't issue a session. */
    async requestOtp(destination: string): Promise<OtpStatusResponse> {
      const response = await client.post<ApiEnvelope>("/auth/otp", { destination });
      return otpStatusResponseSchema.parse(response.data.data);
    },

    /** POST /v1/auth/otp/verify — confirms destination+code; doesn't issue a session. */
    async verifyOtp(destination: string, code: string): Promise<OtpStatusResponse> {
      const response = await client.post<ApiEnvelope>("/auth/otp/verify", { destination, code });
      return otpStatusResponseSchema.parse(response.data.data);
    },
  };
}
