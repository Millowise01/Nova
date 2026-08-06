import { walletBalanceSchema, type WalletBalanceResponse } from "@nova/validation";

import type { ApiEnvelope, NovaHttpClient } from "../http-client";

/** Only the balance read is a genuine customer-facing wallet feature today.
 *  POST /wallet/refunds and PATCH /wallet/refunds/:id/{approve,reject} are
 *  admin dual-authorization actions (backend/docs/09-payments-wallet-design.md),
 *  not self-service customer wallet operations — deliberately not exposed here.
 *  Top-up, withdraw, transaction history, rewards, cashback, and coupons have
 *  no backend endpoint at all (confirmed against the live route table). */
export function createWalletEndpoints(client: NovaHttpClient) {
  return {
    async getBalance(): Promise<WalletBalanceResponse> {
      const response = await client.get<ApiEnvelope>("/wallet/balance");
      return walletBalanceSchema.parse(response.data.data);
    },
  };
}
