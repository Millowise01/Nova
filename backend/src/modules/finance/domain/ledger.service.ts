import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

import { PrismaService } from "../../../prisma/prisma.service";

export interface DoubleEntryInput {
  debitAccountCode: string;
  creditAccountCode: string;
  amount: string;
  currency: string;
  referenceType: string;
  referenceId: string;
  description: string;
}

/** Vol 3, E2's deferred "immutable financial ledger" made real (backend/docs/10). Every
 *  posting is a balanced pair — same amount, one row debits, one row credits — so the
 *  books always sum to zero across the two accounts touched. Append-only: no method on
 *  this service (or anywhere else in this module) ever updates or deletes a LedgerEntry. */
@Injectable()
export class LedgerService {
  constructor(private readonly prisma: PrismaService) {}

  async postDoubleEntry(tx: Prisma.TransactionClient, input: DoubleEntryInput): Promise<void> {
    const [debitAccount, creditAccount] = await Promise.all([
      tx.ledgerAccount.findUniqueOrThrow({ where: { code: input.debitAccountCode } }),
      tx.ledgerAccount.findUniqueOrThrow({ where: { code: input.creditAccountCode } }),
    ]);

    await tx.ledgerEntry.createMany({
      data: [
        {
          ledgerAccountId: debitAccount.id,
          debitAmount: input.amount,
          creditAmount: "0.00",
          currency: input.currency,
          referenceType: input.referenceType,
          referenceId: input.referenceId,
          description: input.description,
        },
        {
          ledgerAccountId: creditAccount.id,
          debitAmount: "0.00",
          creditAmount: input.amount,
          currency: input.currency,
          referenceType: input.referenceType,
          referenceId: input.referenceId,
          description: input.description,
        },
      ],
    });
  }

  /** A simplified net figure (SUM(debit) - SUM(credit)), not a real accounting
   *  normal-balance-signed balance (which account type is debit-normal vs
   *  credit-normal isn't specified anywhere in the blueprint, and this pass only ever
   *  posts one transaction shape — a payout — so there's nothing yet that would need
   *  the distinction). Good enough to prove entries balance; not a real ledger report. */
  async getNetByAccountCode(code: string): Promise<string> {
    const account = await this.prisma.ledgerAccount.findUniqueOrThrow({ where: { code } });
    const result = await this.prisma.ledgerEntry.aggregate({
      where: { ledgerAccountId: account.id },
      _sum: { debitAmount: true, creditAmount: true },
    });
    const debit = Number(result._sum.debitAmount ?? 0);
    const credit = Number(result._sum.creditAmount ?? 0);
    return (debit - credit).toFixed(2);
  }
}
