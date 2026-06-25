import { AppShell } from '@/components/layout/AppShell';
import { ErrorCard, LoadingCard } from '@/components/ui/StateCards';
import { useAdminAnalyticsQuery } from '@/hooks/useAdmin';
import { formatNLE } from '@/utils/formatNLE';

export function AdminAnalyticsPage() {
  const analyticsQuery = useAdminAnalyticsQuery();

  return (
    <AppShell>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="nova-card p-6">
          <h1 className="text-3xl font-black text-gray-900">Admin analytics</h1>
          <p className="mt-1 text-sm text-gray-600">Revenue, user growth, and category breakdown from the future admin API.</p>
        </div>

        <div className="mt-6">
          {analyticsQuery.isLoading ? <LoadingCard label="Loading analytics" /> : null}
          {analyticsQuery.isError ? <ErrorCard title="Admin analytics unavailable" message="The admin analytics endpoint is wired but not live yet." /> : null}
          {analyticsQuery.data ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="nova-card p-6">
                <p className="text-sm text-gray-500">Revenue</p>
                <p className="mt-2 text-3xl font-black text-gray-900">{formatNLE(analyticsQuery.data.revenue)}</p>
              </div>
              <div className="nova-card p-6">
                <p className="text-sm text-gray-500">User growth points</p>
                <p className="mt-2 text-3xl font-black text-gray-900">{analyticsQuery.data.userGrowth.length}</p>
              </div>
              <div className="nova-card p-6">
                <p className="text-sm text-gray-500">Category buckets</p>
                <p className="mt-2 text-3xl font-black text-gray-900">{analyticsQuery.data.categoryBreakdown.length}</p>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}