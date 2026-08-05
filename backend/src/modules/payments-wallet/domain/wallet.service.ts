import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

import { BadRequestError } from "../../../common/errors/api-error";
import { PrismaService } from "../../../prisma/prisma.service";

export type WalletOwnerType = "customer" | "seller";

/**
 * Vol 5, C1: "balances are always derived from immutable, append-only ledger entries,
 * never stored and mutated as a mutable number." There is no `balance` column
 * anywhere in this module — `getBalance` is the ONLY way a balance is ever computed,
 * and it always re-sums from `wallet_ledger_entries`. No other file writes a balance.
 */
@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateAccount(
    tx: Prisma.TransactionClient,
    ownerId: string,
    ownerType: WalletOwnerType,
    currency: string,
  ) {
    const existing = await tx.walletAccount.findUnique({
      where: { ownerId_currency: { ownerId, currency } },
    });
    if (existing) return existing;
    return tx.walletAccount.create({ data: { ownerId, ownerType, currency } });
  }

  async getBalance(ownerId: string, currency: string): Promise<string> {
    const account = await this.prisma.walletAccount.findUnique({
      where: { ownerId_currency: { ownerId, currency } },
    });
    if (!account) return "0.00";

    const result = await this.prisma.walletLedgerEntry.aggregate({
      where: { walletAccountId: account.id },
      _sum: { amount: true },
    });
    return (result._sum.amount ?? 0).toFixed(2);
  }

  /** Positive ledger entry — refund credits, cashback, store credit. */
  async credit(
    tx: Prisma.TransactionClient,
    walletAccountId: string,
    amount: string,
    currency: string,
    type: string,
    reference?: { referenceType: string; referenceId: string },
  ) {
    return tx.walletLedgerEntry.create({
      data: {
        walletAccountId,
        amount,
        currency,
        type,
        referenceType: reference?.referenceType,
        referenceId: reference?.referenceId,
      },
    });
  }

  /** Negative ledger entry — checkout-by-wallet. Checks sufficient balance first
   *  (within the caller's transaction) and throws rather than allowing an overdraft. */
  async debit(
    tx: Prisma.TransactionClient,
    walletAccountId: string,
    amount: string,
    currency: string,
    type: string,
    reference?: { referenceType: string; referenceId: string },
  ) {
    const result = await tx.walletLedgerEntry.aggregate({
      where: { walletAccountId },
      _sum: { amount: true },
    });
    const currentBalance = Number(result._sum.amount ?? 0);
    if (currentBalance < Number(amount)) {
      throw new BadRequestError(
        "WALLET_INSUFFICIENT_BALANCE",
        "The wallet does not have sufficient balance for this payment.",
      );
    }

    return tx.walletLedgerEntry.create({
      data: {
        walletAccountId,
        amount: (-Number(amount)).toFixed(2),
        currency,
        type,
        referenceType: reference?.referenceType,
        referenceId: reference?.referenceId,
      },
    });
  }
}
