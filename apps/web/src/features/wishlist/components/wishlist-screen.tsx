"use client";

import Link from "next/link";

import { Button, Card, EmptyState, ErrorState, Spinner } from "@nova/ui";
import type { WishlistItemResponse } from "@nova/validation";

import { useAuth } from "@/providers/auth-provider";

import { useRemoveFromWishlistMutation } from "../wishlist.mutations";
import { useWishlistQuery } from "../wishlist.queries";

function WishlistProductRow({
  item,
  onRemove,
  removing,
}: {
  item: WishlistItemResponse;
  onRemove: (itemId: string) => void;
  removing: boolean;
}) {
  return (
    <Card className="flex items-center justify-between gap-4 rounded-xl p-4">
      {item.product ? (
        <Link
          className="font-semibold text-[color:var(--color-foreground)] transition-colors hover:text-[color:var(--color-primary)]"
          href={`/product/${item.product.slug}`}
        >
          {item.product.title}
        </Link>
      ) : (
        <span className="text-sm text-[color:var(--color-foreground-muted)]">
          Product no longer available
        </span>
      )}
      <Button disabled={removing} onClick={() => onRemove(item.id)} size="sm" variant="outline">
        Remove
      </Button>
    </Card>
  );
}

export function WishlistScreen() {
  const { isAuthenticated } = useAuth();
  const query = useWishlistQuery();
  const removeItem = useRemoveFromWishlistMutation();

  if (!isAuthenticated) {
    return <EmptyState description="Sign in to view your wishlist." title="Wishlist" />;
  }

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-sm text-[color:var(--color-foreground-muted)]">
        <Spinner className="h-4 w-4" /> Loading wishlist...
      </div>
    );
  }

  if (query.isError) {
    return (
      <ErrorState
        action={<Button onClick={() => void query.refetch()}>Try again</Button>}
        description="We couldn't load your wishlist."
        title="Something went wrong"
      />
    );
  }

  const items = query.data?.items ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[color:var(--color-foreground)]">
          Wishlist
        </h1>
        <p className="mt-1 text-sm text-[color:var(--color-foreground-muted)]">
          Products you&apos;ve saved for later.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState description="Save products to see them here." title="Your wishlist is empty" />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <WishlistProductRow
              item={item}
              key={item.id}
              onRemove={(id) => removeItem.mutate(id)}
              removing={removeItem.isPending && removeItem.variables === item.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
