import { useMemo, useState } from 'react';

import { AppShell } from '@/components/layout/AppShell';
import { ErrorCard, LoadingCard } from '@/components/ui/StateCards';
import { useSellerAnalyticsQuery } from '@/hooks/useSeller';
import { formatNLE } from '@/utils/formatNLE';

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function SellerAnalyticsPage() {
  const today = useMemo(() => new Date(), []);
  const [from, setFrom] = useState(toDateInputValue(new Date(today.getFullYear(), today.getMonth(), 1)));
  const [to, setTo] = useState(toDateInputValue(today));
  const analyticsQuery = useSellerAnalyticsQuery(from, to);

  return (
    <AppShell>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="nova-card p-6">
          <h1 className="text-3xl font-black text-gray-900">Seller analytics</h1>
          <p className="mt-1 text-sm text-gray-600">Choose a date range to query revenue and order trends.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="space-y-2 text-sm font-medium text-gray-700">
              <span>From</span>
              <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3" />
            </label>
            <label className="space-y-2 text-sm font-medium text-gray-700">
              <span>To</span>
              <input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3" />
            </label>
          </div>
        </div>

        <div className="mt-6">
          {analyticsQuery.isLoading ? <LoadingCard label="Loading analytics" /> : null}
          {analyticsQuery.isError ? <ErrorCard title="Seller analytics unavailable" message="The seller analytics endpoint is wired but not live yet." /> : null}
          {analyticsQuery.data ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {analyticsQuery.data.map((point) => (
                <div key={point.date} className="nova-card p-6">
                  <p className="text-sm text-gray-500">{point.date}</p>
                  <p className="mt-2 text-2xl font-black text-gray-900">{formatNLE(point.revenue)}</p>
                  <p className="mt-1 text-sm text-gray-600">{point.orders} orders</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}