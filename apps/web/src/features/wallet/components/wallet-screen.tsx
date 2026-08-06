"use client";

import Link from "next/link";

import { Button, Card, ErrorState, Spinner } from "@nova/ui";
import { formatMoney } from "@nova/utils";

import { useWalletBalanceQuery } from "../wallet.queries";

import { useAuth } from "@/providers/auth-provider";

// Confirmed against the real backend route table (backend/src/modules/payments-wallet):
// only GET /wallet/balance is a genuine self-service customer feature. There is no
// top-up, withdraw, transaction history, rewards, cashback, or coupons endpoint at
// all — those remain explicitly unavailable below rather than showing fake data.
const UNAVAILABLE_FEATURES = [
  "Top-up",
  "Withdraw",
  "Rewards",
  "Cashback",
  "Coupons",
  "Transaction History",
];

export function WalletScreen() {
  const { isAuthenticated } = useAuth();
  const query = useWalletBalanceQuery();

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md space-y-4 px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Sign in to view your wallet</h1>
        <Link href="/auth/login">
          <Button>Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-8 md:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold">Nova Wallet</h1>

      <Card className="space-y-2">
        <p className="text-sm text-slate-500">Balance</p>
        {query.isLoading ? (
          <Spinner className="h-5 w-5" />
        ) : query.isError || !query.data ? (
          <ErrorState
            action={<Button onClick={() => void query.refetch()}>Try again</Button>}
            description="We couldn't load your wallet balance."
            title="Something went wrong"
          />
        ) : (
          <p className="text-3xl font-semibold">{formatMoney(query.data)}</p>
        )}
      </Card>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-500">Not yet available</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {UNAVAILABLE_FEATURES.map((feature) => (
            <Card className="text-sm text-slate-400" key={feature}>
              {feature}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
