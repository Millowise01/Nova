import type { ListProductsParams } from "@nova/api-client";

export const searchKeys = {
  all: ["search"] as const,
  results: (params: ListProductsParams) => [...searchKeys.all, "results", params] as const,
};
