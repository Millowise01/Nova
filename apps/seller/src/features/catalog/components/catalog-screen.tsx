"use client";

import { useState } from "react";

import { Alert, Button, Card, Input, Select, DataTable, type DataTableColumn } from "@nova/ui";
import { formatMoney } from "@nova/utils";
import type { ProductResponse } from "@nova/validation";

import { useAuth } from "@/providers/auth-provider";

import { useCreateProductMutation } from "../catalog.mutations";
import { useCategoriesQuery, useMyProductsQuery } from "../catalog.queries";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Create + list only — there is no PATCH/DELETE for a product at the HTTP
 *  layer yet, despite the backend's ability policy already granting sellers
 *  update/delete on their own products (logged in backend/docs/10). Nothing
 *  here implies edit/deactivate exists; the "done when" in the original
 *  ticket ("create, edit, and deactivate") is only partially met — disclosed,
 *  not silently dropped. */
export function CatalogScreen() {
  const { session } = useAuth();
  const products = useMyProductsQuery(session?.userId);
  const categories = useCategoriesQuery();
  const createProduct = useCreateProductMutation();

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [priceAmount, setPriceAmount] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");

  const columns: DataTableColumn<ProductResponse>[] = [
    { key: "title", header: "Title" },
    {
      key: "id",
      header: "Price",
      render: (row) => {
        const variant = row.variants[0];
        if (!variant) return "—";
        return formatMoney({ amount: variant.priceAmount, currency: variant.priceCurrency });
      },
    },
    {
      key: "slug",
      header: "Stock",
      render: (row) => row.variants[0]?.stockQuantity ?? "—",
    },
    { key: "status", header: "Status" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[color:var(--color-foreground)]">Catalog</h1>
        <p className="text-sm text-[color:var(--color-foreground-muted)]">
          Products you&apos;ve listed on Nova.
        </p>
      </div>

      <Alert tone="info">
        Editing and deactivating a listing aren&apos;t available yet — only creating and viewing
        your products is wired up so far.
      </Alert>

      <Card className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-[color:var(--color-foreground)]">
          List a new product
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Select
            label="Category"
            placeholder="Select a category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            options={(categories.data?.data ?? []).map((c) => ({ value: c.id, label: c.name }))}
          />
          <Input
            label="Price (SLE)"
            type="number"
            min="0"
            step="0.01"
            value={priceAmount}
            onChange={(e) => setPriceAmount(e.target.value)}
          />
          <Input
            label="Stock quantity"
            type="number"
            min="0"
            step="1"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
          />
        </div>
        <Button
          disabled={!title || !categoryId || !priceAmount || !stockQuantity}
          loading={createProduct.isPending}
          onClick={() => {
            const slug = `${slugify(title)}-${Date.now().toString(36)}`;
            createProduct.mutate(
              {
                categoryId,
                title,
                slug,
                variants: [
                  {
                    sku: slug,
                    name: "Default",
                    priceAmount: Number(priceAmount).toFixed(2),
                    priceCurrency: "SLE",
                    stockQuantity: Number(stockQuantity),
                  },
                ],
              },
              {
                onSuccess: () => {
                  setTitle("");
                  setCategoryId("");
                  setPriceAmount("");
                  setStockQuantity("");
                },
              },
            );
          }}
        >
          List product
        </Button>
      </Card>

      <DataTable
        columns={columns}
        data={products.data?.data ?? []}
        keyField="id"
        loading={products.isLoading}
        emptyTitle="No products listed yet"
      />
    </div>
  );
}
