import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

import { toApiError } from "./errors";
import { tokenStore } from "./token-store";

declare module "axios" {
  export interface InternalAxiosRequestConfig {
    _retriedAfterRefresh?: boolean;
  }
}

const AUTH_ENDPOINTS_EXEMPT_FROM_REFRESH = ["/auth/login", "/auth/signup", "/auth/refresh"];

function isExemptFromRefresh(url: string | undefined): boolean {
  if (!url) return false;
  return AUTH_ENDPOINTS_EXEMPT_FROM_REFRESH.some((path) => url.includes(path));
}

/** Only one refresh call is ever in flight — concurrent 401s all await this same
 *  promise instead of each firing their own POST /auth/refresh. */
let inFlightRefresh: Promise<string> | null = null;

async function refreshAccessToken(client: AxiosInstance): Promise<string> {
  if (inFlightRefresh) return inFlightRefresh;

  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) {
    tokenStore.clear();
    throw new Error("No refresh token available");
  }

  inFlightRefresh = client
    .post<{ data: { accessToken: string; refreshToken: string } }>("/auth/refresh", {
      refreshToken,
    })
    .then((response) => {
      const { accessToken, refreshToken: nextRefreshToken } = response.data.data;
      tokenStore.setTokens(accessToken, nextRefreshToken);
      return accessToken;
    })
    .catch((error: unknown) => {
      tokenStore.clear();
      throw error;
    })
    .finally(() => {
      inFlightRefresh = null;
    });

  return inFlightRefresh;
}

export type NovaHttpClient = AxiosInstance;

/** Loose shape for the backend's `{ data: ... }` envelope — real validation happens
 *  via the Zod schema each endpoint function parses the payload with afterward. */
export interface ApiEnvelope<T = unknown> {
  data: T;
}

export function createApiClient(baseURL: string): NovaHttpClient {
  const client = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 15000,
  });

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = tokenStore.getAccessToken();
    if (token && !isExemptFromRefresh(config.url)) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      const axiosError = error as {
        config?: InternalAxiosRequestConfig;
        response?: { status?: number };
      };
      const { config, response } = axiosError;

      const shouldAttemptRefresh =
        response?.status === 401 &&
        config &&
        !config._retriedAfterRefresh &&
        !isExemptFromRefresh(config.url);

      if (!shouldAttemptRefresh) {
        throw toApiError(error);
      }

      try {
        const newAccessToken = await refreshAccessToken(client);
        config._retriedAfterRefresh = true;
        config.headers.set("Authorization", `Bearer ${newAccessToken}`);
        return await client.request(config);
      } catch {
        // Refresh itself failed (expired/invalid refresh token) — surface the
        // ORIGINAL 401 as an ApiError; tokenStore.clear() already ran inside
        // refreshAccessToken, so subscribers (useAuthState) see the logout.
        throw toApiError(error);
      }
    },
  );

  return client;
}
