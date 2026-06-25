import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { PageState } from '@/components/ui/PageState';
import { useAddressesQuery, useMeQuery, useWishlistQuery } from '@/hooks/useUsers';
import { useOrdersQuery } from '@/hooks/useOrders';
import { formatPhone } from '@/utils/formatPhone';

export function ProfilePage() {
  const meQuery = useMeQuery();
  const ordersQuery = useOrdersQuery(1, 5);
  const wishlistQuery = useWishlistQuery();
  const addressesQuery = useAddressesQuery();

  return (
    <AppShell>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {meQuery.isLoading ? <PageState title="Loading profile" description="Fetching the current user and recent account data." /> : null}
        {meQuery.isError ? <PageState title="Profile unavailable" description="The future /users/me endpoint is wired but not live yet." /> : null}

        {meQuery.data ? (
          <div className="space-y-6">
            <div className="nova-card p-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone="brand">{meQuery.data.role}</Badge>
                <Badge tone={meQuery.data.isVerified ? 'brand' : 'neutral'}>{meQuery.data.isVerified ? 'Verified' : 'Unverified'}</Badge>
              </div>
              <h1 className="mt-4 text-3xl font-black text-gray-900">{meQuery.data.name}</h1>
              <p className="mt-1 text-gray-600">{meQuery.data.email}</p>
              <p className="text-gray-600">{formatPhone(meQuery.data.phone)}</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="nova-card p-6">
                <h2 className="text-xl font-bold text-gray-900">Orders</h2>
                <p className="mt-2 text-3xl font-black text-gray-900">{ordersQuery.data?.meta.total ?? 0}</p>
              </div>
              <div className="nova-card p-6">
                <h2 className="text-xl font-bold text-gray-900">Wishlist</h2>
                <p className="mt-2 text-3xl font-black text-gray-900">{wishlistQuery.data?.length ?? 0}</p>
              </div>
              <div className="nova-card p-6">
                <h2 className="text-xl font-bold text-gray-900">Addresses</h2>
                <p className="mt-2 text-3xl font-black text-gray-900">{addressesQuery.data?.length ?? 0}</p>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}