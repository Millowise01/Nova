import type { AxiosError } from "axios";
import { createApiClient } from "@nova/api-client";
import { getEnvironment } from "@nova/config";

type ApiClient = ReturnType<typeof createApiClient>;

declare global {
  var __novaApiClient: ApiClient | undefined; // eslint-disable-line no-var
}

export function getApiClient(): ApiClient {
  if (!globalThis.__novaApiClient) {
    const env = getEnvironment();
    const client = createApiClient(env.NEXT_PUBLIC_API_BASE_URL);

    client.interceptors.request.use(
      async (config) => {
        if (typeof window === "undefined") {
          try {
            const { cookies } = await import("next/headers");
            const cookieStore = await cookies();
            const session = cookieStore.get("nova_session")?.value;
            if (session) {
              config.headers.Cookie = `nova_session=${session}`;
              config.headers.Authorization = `Bearer ${session}`;
            }
          } catch {
            // Safe fallback outside Next.js request context
          }
        }
        return config;
      },
      (error: unknown) => Promise.reject(error instanceof Error ? error : new Error(String(error))),
    );

    client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<{ message?: string; code?: string; details?: unknown }>) => {
        const normalizedError = new Error(
          error.response?.data?.message ?? error.message ?? "An unexpected error occurred",
        );
        Object.assign(normalizedError, {
          status: error.response?.status,
          code: error.response?.data?.code ?? error.code,
          details: error.response?.data?.details ?? null,
        });
        return Promise.reject(normalizedError);
      },
    );

    globalThis.__novaApiClient = client;
  }
  return globalThis.__novaApiClient;
}
