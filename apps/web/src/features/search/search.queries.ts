"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_STALE_TIME } from "@/config/app";
import { listProducts } from "@/services/catalog.service";

import { searchKeys } from "./search.keys";

/** Real GET /v1/products?q= full-text search (Postgres tsvector/tsquery, ranked by
 *  ts_rank) — callers debounce `q` before it reaches here (see use-debounced-value.ts),
 *  so this hook itself fires one request per settled query, not one per keystroke. */
export function useSearchQuery(q: string) {
  return useQuery({
    queryKey: searchKeys.results({ q }),
    queryFn: () => listProducts({ q }),
    staleTime: QUERY_STALE_TIME.medium,
    enabled: q.trim().length > 0,
  });
}
