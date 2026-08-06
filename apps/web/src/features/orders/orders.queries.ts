"use client";

import { useQuery } from "@tanstack/react-query";

import { orderKeys } from "./orders.keys";

import { QUERY_STALE_TIME } from "@/config/app";
import { getOrder, listOrders } from "@/services/orders.service";

export function useOrdersListQuery() {
  return useQuery({
    queryKey: orderKeys.lists(),
    queryFn: () => listOrders(),
    staleTime: QUERY_STALE_TIME.short,
  });
}

export function useOrderQuery(orderId: string) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => getOrder(orderId),
    staleTime: QUERY_STALE_TIME.short,
    enabled: orderId.length > 0,
  });
}
