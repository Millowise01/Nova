// Creates the catalog data the browser (Playwright) journeys need on an empty database: one
// category and one published, in-stock product. Run it once against a running backend, before the
// E2E suites:  node scripts/e2e-seed.mjs
//
// It goes through the real API, the same way the journeys do; the two throwaway accounts it needs
// (an admin to create the category, a seller to list the product) come from e2e-accounts.mjs, which
// explains the one test-only step (role promotion).
//
// Idempotent: if the catalog already has a product (a developer database), it does nothing.
import { createRequire } from "node:module";

import { call, createAccount, loginToken } from "./e2e-accounts.mjs";

const require = createRequire(import.meta.url);

async function main() {
  const existing = await call("GET", "/products?limit=1");
  if (existing.data.length > 0) {
    console.log("e2e-seed: the catalog already has products; nothing to do.");
    return;
  }

  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();
  try {
    const admin = await loginToken(
      await createAccount(prisma, "seed-admin", ["customer", "admin"]),
    );
    const seller = await loginToken(
      await createAccount(prisma, "seed-seller", ["customer", "seller"]),
    );

    const categories = await call("GET", "/categories");
    const category =
      categories.data[0] ??
      (
        await call("POST", "/categories", {
          token: admin,
          body: { name: "E2E Electronics", slug: "e2e-electronics" },
        })
      ).data;

    const stamp = Date.now();
    const product = await call("POST", "/products", {
      token: seller,
      body: {
        categoryId: category.id,
        title: "E2E Fixture Product",
        slug: `e2e-fixture-product-${stamp}`,
        description: "Created by backend/scripts/e2e-seed.mjs for the browser journeys.",
        isFeatured: true,
        variants: [
          {
            sku: `E2E-${stamp}`,
            name: "Default",
            priceAmount: "25.00",
            priceCurrency: "SLE",
            stockQuantity: 100,
          },
        ],
      },
    });
    console.log(
      `e2e-seed: created category "${category.slug}" and product "${product.data.slug}".`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
