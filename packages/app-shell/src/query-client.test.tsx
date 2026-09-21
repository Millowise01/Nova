import { QueryClient } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createQueryClient, useQueryClientInstance } from "./query-client";

describe("createQueryClient", () => {
  it("applies the stale time it is given, with one retry and no refetch on window focus", () => {
    const options = createQueryClient({ staleTime: 30_000 }).getDefaultOptions().queries;
    expect(options?.staleTime).toBe(30_000);
    expect(options?.retry).toBe(1);
    expect(options?.refetchOnWindowFocus).toBe(false);
  });

  it("does not hide the stale time behind a default: an app must state it", () => {
    expect(createQueryClient({ staleTime: 0 }).getDefaultOptions().queries?.staleTime).toBe(0);
  });

  it("builds an independent client on every call", () => {
    const a = createQueryClient({ staleTime: 1 });
    const b = createQueryClient({ staleTime: 1 });
    expect(a).toBeInstanceOf(QueryClient);
    expect(a).not.toBe(b);
  });
});

describe("useQueryClientInstance", () => {
  it("returns the same client across re-renders", () => {
    const { result, rerender } = renderHook(() => useQueryClientInstance({ staleTime: 5 }));
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});
