import { z } from "zod";

import {
  refundRequestSchema,
  walletBalanceSchema,
  type ListRefundsQuery,
  type RefundRequestResponse,
  type WalletBalanceResponse,
} from "@nova/validation";

import type { ApiEnvelope, NovaHttpClient } from "../http-client";

/** The balance read is a customer-facing wallet feature. The refund admin queue
 *  (GET /wallet/refunds) and approve/reject actions are apps/admin-only —
 *  backend/docs/10's disclosed addition, added for that consumer, not a
 *  self-service customer wallet operation. Top-up, withdraw, transaction
 *  history, rewards, cashback, and coupons have no backend endpoint at all
 *  (confirmed against the live route table). */
export function createWalletEndpoints(client: NovaHttpClient) {
  return {
    async getBalance(): Promise<WalletBalanceResponse> {
      const response = await client.get<ApiEnvelope>("/wallet/balance");
      return walletBalanceSchema.parse(response.data.data);
    },

    async listRefunds(params: ListRefundsQuery = {}): Promise<RefundRequestResponse[]> {
      const response = await client.get<ApiEnvelope>("/wallet/refunds", { params });
      return z.array(refundRequestSchema).parse(response.data.data);
    },

    async approveRefund(id: string): Promise<RefundRequestResponse> {
      const response = await client.patch<ApiEnvelope>(`/wallet/refunds/${id}/approve`);
      return refundRequestSchema.parse(response.data.data);
    },

    async rejectRefund(id: string, reason: string): Promise<RefundRequestResponse> {
      const response = await client.patch<ApiEnvelope>(`/wallet/refunds/${id}/reject`, { reason });
      return refundRequestSchema.parse(response.data.data);
    },
  };
}
