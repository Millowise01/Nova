import { AppShell } from '@/components/layout/AppShell';
import { PageState } from '@/components/ui/PageState';
import { useAdminDashboardQuery } from '@/hooks/useAdmin';
import { formatNLE } from '@/utils/formatNLE';

export function AdminDashboardPage() {
  const dashboardQuery = useAdminDashboardQuery();

  return (
    <AppShell>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {dashboardQuery.isLoading ? <PageState title="Loading admin dashboard" description="Fetching platform KPIs from the future admin API." /> : null}
        {dashboardQuery.isError ? <PageState title="Admin dashboard unavailable" description="The admin endpoints are wired but the backend is not live yet." /> : null}
        {dashboardQuery.data ? (
          <div className="grid gap-4 md:grid-cols-4">
            <div className="nova-card p-6"><p className="text-sm text-gray-500">Revenue</p><p className="mt-2 text-3xl font-black text-gray-900">{formatNLE(dashboardQuery.data.revenue)}</p></div>
            <div className="nova-card p-6"><p className="text-sm text-gray-500">Users</p><p className="mt-2 text-3xl font-black text-gray-900">{dashboardQuery.data.users}</p></div>
            <div className="nova-card p-6"><p className="text-sm text-gray-500">Sellers</p><p className="mt-2 text-3xl font-black text-gray-900">{dashboardQuery.data.sellers}</p></div>
            <div className="nova-card p-6"><p className="text-sm text-gray-500">Orders</p><p className="mt-2 text-3xl font-black text-gray-900">{dashboardQuery.data.orders}</p></div>
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}