import { AppShell } from '@/components/layout/AppShell';
import { PageState } from '@/components/ui/PageState';
import { useSellerDashboardQuery } from '@/hooks/useSeller';
import { formatNLE } from '@/utils/formatNLE';

export function SellerDashboardPage() {
  const dashboardQuery = useSellerDashboardQuery();

  return (
    <AppShell>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {dashboardQuery.isLoading ? <PageState title="Loading seller dashboard" description="Fetching metrics from the future seller API." /> : null}
        {dashboardQuery.isError ? <PageState title="Seller dashboard unavailable" description="The seller endpoints are wired but the backend is not live yet." /> : null}
        {dashboardQuery.data ? (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="nova-card p-6"><p className="text-sm text-gray-500">MTD revenue</p><p className="mt-2 text-3xl font-black text-gray-900">{formatNLE(dashboardQuery.data.mtdRevenue)}</p></div>
            <div className="nova-card p-6"><p className="text-sm text-gray-500">Orders</p><p className="mt-2 text-3xl font-black text-gray-900">{dashboardQuery.data.orderCount}</p></div>
            <div className="nova-card p-6"><p className="text-sm text-gray-500">Avg rating</p><p className="mt-2 text-3xl font-black text-gray-900">{dashboardQuery.data.avgRating.toFixed(1)}</p></div>
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}