import { createApiClient } from "@nova/api-client";
import { getEnvironment } from "@nova/config";

type ApiClient = ReturnType<typeof createApiClient>;

declare global {
  // eslint-disable-next-line no-var
  var __novaApiClient: ApiClient | undefined;
}

export function getApiClient(): ApiClient {
  if (!globalThis.__novaApiClient) {
    const env = getEnvironment();
    const client = createApiClient(env.NEXT_PUBLIC_API_BASE_URL);

    // Request Interceptor: Forward authorization cookies/headers during SSR or Server actions
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
            // Safe fallback if invoked outside Next.js request contexts
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor: Normalize all API error responses for Query states
    client.interceptors.response.use(
      (response) => response,
      (error) => {
        const normalizedError = {
          message:
            error.response?.data?.message ||
            error.message ||
            "An unexpected error occurred",
          status: error.response?.status,
          code: error.response?.data?.code || error.code,
          details: error.response?.data?.details || null
        };
        return Promise.reject(normalizedError);
      }
    );

    globalThis.__novaApiClient = client;
  }
  return globalThis.__novaApiClient;
}

