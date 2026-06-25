import { useState } from 'react';

import { AppShell } from '@/components/layout/AppShell';
import { ErrorCard, LoadingCard } from '@/components/ui/StateCards';
import { useAdminUsersQuery, useToggleUserBanMutation } from '@/hooks/useAdmin';

export function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const usersQuery = useAdminUsersQuery(page, 10, search);
  const toggleBanMutation = useToggleUserBanMutation();

  return (
    <AppShell>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="nova-card p-6">
          <h1 className="text-3xl font-black text-gray-900">Admin users</h1>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users" className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-3" />
        </div>

        <div className="mt-6">
          {usersQuery.isLoading ? <LoadingCard label="Loading users" /> : null}
          {usersQuery.isError ? <ErrorCard title="Users unavailable" message="The admin users endpoint is wired but not live yet." /> : null}
          {usersQuery.data ? (
            <div className="nova-card overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 text-left text-sm text-gray-500">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white text-sm">
                  {usersQuery.data.data.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 font-semibold text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 text-gray-700">{user.email}</td>
                      <td className="px-6 py-4 text-gray-700">{user.role}</td>
                      <td className="px-6 py-4">
                        <button type="button" onClick={() => toggleBanMutation.mutate(user.id)} className="nova-button-secondary">
                          {user.isVerified ? 'Ban / unban' : 'Review'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 text-sm text-gray-600">
                <span>
                  Page {usersQuery.data.meta.page} of {usersQuery.data.meta.totalPages}
                </span>
                <div className="flex gap-2">
                  <button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="nova-button-secondary disabled:opacity-50">
                    Previous
                  </button>
                  <button type="button" disabled={page >= usersQuery.data.meta.totalPages} onClick={() => setPage((value) => value + 1)} className="nova-button-secondary disabled:opacity-50">
                    Next
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}