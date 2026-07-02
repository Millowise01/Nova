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
    globalThis.__novaApiClient = createApiClient(env.NEXT_PUBLIC_API_BASE_URL);
  }
  return globalThis.__novaApiClient;
}
