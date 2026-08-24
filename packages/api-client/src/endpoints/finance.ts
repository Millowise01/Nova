import { z } from "zod";

import {
  sellerPayoutSchema,
  type ListSellerPayoutsQuery,
  type SellerPayoutResponse,
} from "@nova/validation";

import type { ApiEnvelope, NovaHttpClient } from "../http-client";

/** apps/admin-only — Finance's SellerPayout dual-authorization queue (backend/docs/10).
 *  Propose isn't exposed here: the Refunds & Payouts admin screen reviews and acts on
 *  existing proposals, it doesn't create new ones (backend/docs/10's disclosed-addition
 *  note — narrowly scoped to what that screen actually needs). */
export function createFinanceEndpoints(client: NovaHttpClient) {
  return {
    async listPayouts(params: ListSellerPayoutsQuery = {}): Promise<SellerPayoutResponse[]> {
      const response = await client.get<ApiEnvelope>("/finance/payouts", { params });
      return z.array(sellerPayoutSchema).parse(response.data.data);
    },

    async approvePayout(id: string): Promise<SellerPayoutResponse> {
      const response = await client.patch<ApiEnvelope>(`/finance/payouts/${id}/approve`);
      return sellerPayoutSchema.parse(response.data.data);
    },

    async rejectPayout(id: string, reason: string): Promise<SellerPayoutResponse> {
      const response = await client.patch<ApiEnvelope>(`/finance/payouts/${id}/reject`, { reason });
      return sellerPayoutSchema.parse(response.data.data);
    },
  };
}
