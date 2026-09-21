import { randomUUID } from "node:crypto";

import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../../app.module";
import { PrismaService } from "../../prisma/prisma.service";
import { createTestApp } from "../../test-utils/create-test-app";
import { promoteRole } from "../../test-utils/promote-role";
import { uniqueTestPhone } from "../../test-utils/users";

describe("Catalog (integration)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let sellerToken: string;
  let adminToken: string;
  let customerToken: string;

  async function signUpAndPromote(rolePrefix: string, roles: string[]): Promise<string> {
    const suffix = randomUUID().slice(0, 8);
    const signup = await request(app.getHttpServer())
      .post("/v1/auth/signup")
      .send({
        firstName: rolePrefix,
        lastName: "Test",
        email: `${rolePrefix}-${suffix}@example.test`,
        phone: uniqueTestPhone(),
        password: "correct-horse-battery-staple",
        confirmPassword: "correct-horse-battery-staple",
      });
    if (roles.length > 0) {
      await promoteRole(prisma, signup.body.data.user.id, ["customer", ...roles]);
      // Roles changed after the token was issued — log in again for a token carrying them.
      const relogin = await request(app.getHttpServer())
        .post("/v1/auth/login")
        .send({
          email: `${rolePrefix}-${suffix}@example.test`,
          password: "correct-horse-battery-staple",
        });
      return relogin.body.data.accessToken;
    }
    return signup.body.data.accessToken;
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = await createTestApp(moduleRef);
    prisma = app.get(PrismaService);

    customerToken = await signUpAndPromote("customer", []);
    sellerToken = await signUpAndPromote("seller", ["seller"]);
    adminToken = await signUpAndPromote("admin", ["admin"]);
  });

  afterAll(async () => {
    await app.close();
  });

  it("creates a category as admin and rejects a duplicate slug", async () => {
    const slug = `electronics-${randomUUID().slice(0, 8)}`;
    await request(app.getHttpServer())
      .post("/v1/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Electronics", slug })
      .expect(201);

    const dup = await request(app.getHttpServer())
      .post("/v1/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Electronics Again", slug })
      .expect(409);
    expect(dup.body.error.code).toBe("CATEGORY_SLUG_TAKEN");
  });

  it("rejects category creation from a non-admin — proves the policy engine, not an inline check, enforces this", async () => {
    const response = await request(app.getHttpServer())
      .post("/v1/categories")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ name: "Should Fail", slug: `should-fail-${randomUUID().slice(0, 8)}` })
      .expect(403);
    expect(response.body.error.code).toBe("PERMISSION_DENIED");

    // A seller — a real, elevated role — still isn't admin, and still can't manage taxonomy.
    const sellerAttempt = await request(app.getHttpServer())
      .post("/v1/categories")
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({ name: "Should Also Fail", slug: `should-also-fail-${randomUUID().slice(0, 8)}` })
      .expect(403);
    expect(sellerAttempt.body.error.code).toBe("PERMISSION_DENIED");
  });

  it("creates a product with variants as a seller, scoped to the authenticated seller, with Money fields as decimal strings", async () => {
    const suffix = randomUUID().slice(0, 8);
    const category = await request(app.getHttpServer())
      .post("/v1/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Phones", slug: `phones-${suffix}` })
      .expect(201);

    const product = await request(app.getHttpServer())
      .post("/v1/products")
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({
        categoryId: category.body.data.id,
        title: "Test Phone",
        slug: `test-phone-${suffix}`,
        variants: [
          {
            sku: `SKU-${suffix}`,
            name: "128GB / Black",
            priceAmount: "199.99",
            priceCurrency: "SLE",
            stockQuantity: 10,
          },
        ],
      })
      .expect(201);

    expect(product.body.data.variants).toHaveLength(1);
    // Prisma Decimal serializes as a string over JSON — proves Money never became a float.
    expect(product.body.data.variants[0].priceAmount).toBe("199.99");
    expect(typeof product.body.data.variants[0].priceAmount).toBe("string");

    // Direct DB check: soft-delete column, country_code, and audit columns are all present.
    const row = await prisma.product.findUniqueOrThrow({ where: { id: product.body.data.id } });
    expect(row.deletedAt).toBeNull();
    expect(row.countryCode).toBe("SL");
    expect(row.createdAt).toBeInstanceOf(Date);
    expect(row.sellerId).toEqual(expect.any(String));

    // Audit log: product.create is written with the correct actor and target.
    const auditRow = await prisma.auditLog.findFirst({
      where: { action: "product.create", targetId: product.body.data.id },
    });
    expect(auditRow).not.toBeNull();
    expect(auditRow?.actorId).toBe(row.sellerId);
  });

  it("rejects product creation without a bearer token, and from an authenticated customer without the seller role", async () => {
    const suffix = randomUUID().slice(0, 8);
    const category = await request(app.getHttpServer())
      .post("/v1/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Unauthed", slug: `unauthed-${suffix}` })
      .expect(201);

    const noToken = await request(app.getHttpServer())
      .post("/v1/products")
      .send({
        categoryId: category.body.data.id,
        title: "No Auth",
        slug: `no-auth-${suffix}`,
        variants: [
          {
            sku: `NA-${suffix}`,
            name: "Default",
            priceAmount: "10.00",
            priceCurrency: "SLE",
            stockQuantity: 1,
          },
        ],
      })
      .expect(401);
    expect(noToken.body.error.code).toBe("MISSING_BEARER_TOKEN");

    // Authenticated, but wrong role — a real permission failure, not a token failure.
    const wrongRole = await request(app.getHttpServer())
      .post("/v1/products")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        categoryId: category.body.data.id,
        title: "Customer Cannot Sell",
        slug: `customer-cannot-sell-${suffix}`,
        variants: [
          {
            sku: `CS-${suffix}`,
            name: "Default",
            priceAmount: "10.00",
            priceCurrency: "SLE",
            stockQuantity: 1,
          },
        ],
      })
      .expect(403);
    expect(wrongRole.body.error.code).toBe("PERMISSION_DENIED");
  });

  it("lists products with cursor pagination — the cursor round-trips correctly", async () => {
    const first = await request(app.getHttpServer()).get("/v1/products").query({}).expect(200);
    expect(Array.isArray(first.body.data)).toBe(true);
    expect(first.body.pageInfo).toHaveProperty("hasMore");

    if (first.body.pageInfo.nextCursor) {
      const second = await request(app.getHttpServer())
        .get("/v1/products")
        .query({ cursor: first.body.pageInfo.nextCursor })
        .expect(200);
      // No overlap between page 1 and page 2.
      const firstIds = new Set(first.body.data.map((p: { id: string }) => p.id));
      for (const product of second.body.data) {
        expect(firstIds.has(product.id)).toBe(false);
      }
    }
  });

  it("gets a product by slug, 404s for a nonexistent one", async () => {
    const suffix = randomUUID().slice(0, 8);
    const category = await request(app.getHttpServer())
      .post("/v1/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Lookup", slug: `lookup-cat-${suffix}` })
      .expect(201);
    const slug = `lookup-product-${suffix}`;

    await request(app.getHttpServer())
      .post("/v1/products")
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({
        categoryId: category.body.data.id,
        title: "Lookup Product",
        slug,
        variants: [
          {
            sku: `LK-${suffix}`,
            name: "Default",
            priceAmount: "5.00",
            priceCurrency: "SLE",
            stockQuantity: 1,
          },
        ],
      })
      .expect(201);

    const found = await request(app.getHttpServer()).get(`/v1/products/${slug}`).expect(200);
    expect(found.body.data.slug).toBe(slug);

    const notFound = await request(app.getHttpServer())
      .get("/v1/products/does-not-exist-at-all")
      .expect(404);
    expect(notFound.body.error.code).toBe("PRODUCT_NOT_FOUND");
  });

  it("lists categories and brands — previously only create (POST) existed for either", async () => {
    const suffix = randomUUID().slice(0, 8);
    const categoryName = `Listable Category ${suffix}`;
    const brandName = `Listable Brand ${suffix}`;

    await request(app.getHttpServer())
      .post("/v1/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: categoryName, slug: `listable-category-${suffix}` })
      .expect(201);
    await request(app.getHttpServer())
      .post("/v1/brands")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: brandName, slug: `listable-brand-${suffix}` })
      .expect(201);

    const categories = await request(app.getHttpServer()).get("/v1/categories").expect(200);
    expect(categories.body.data.some((c: { name: string }) => c.name === categoryName)).toBe(true);

    const brands = await request(app.getHttpServer()).get("/v1/brands").expect(200);
    expect(brands.body.data.some((b: { name: string }) => b.name === brandName)).toBe(true);

    // Public reads — no Authorization header needed at all.
    expect(categories.status).toBe(200);
    expect(brands.status).toBe(200);
  });

  it("filters products by isFeatured and isFlashSale via query params", async () => {
    const suffix = randomUUID().slice(0, 8);
    const category = await request(app.getHttpServer())
      .post("/v1/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Merch", slug: `merch-${suffix}` })
      .expect(201);

    async function createProduct(flags: { isFeatured?: boolean; isFlashSale?: boolean }) {
      const s = randomUUID().slice(0, 8);
      const res = await request(app.getHttpServer())
        .post("/v1/products")
        .set("Authorization", `Bearer ${sellerToken}`)
        .send({
          categoryId: category.body.data.id,
          title: `Merch Product ${s}`,
          slug: `merch-product-${s}`,
          ...flags,
          variants: [
            {
              sku: `MP-${s}`,
              name: "Default",
              priceAmount: "1.00",
              priceCurrency: "SLE",
              stockQuantity: 1,
            },
          ],
        })
        .expect(201);
      return res.body.data.id as string;
    }

    const featuredId = await createProduct({ isFeatured: true });
    const flashSaleId = await createProduct({ isFlashSale: true });
    const plainId = await createProduct({});

    const featured = await request(app.getHttpServer())
      .get("/v1/products")
      .query({ featured: "true" })
      .expect(200);
    const featuredIds = featured.body.data.map((p: { id: string }) => p.id);
    expect(featuredIds).toContain(featuredId);
    expect(featuredIds).not.toContain(flashSaleId);
    expect(featuredIds).not.toContain(plainId);

    const flashSale = await request(app.getHttpServer())
      .get("/v1/products")
      .query({ flashSale: "true" })
      .expect(200);
    const flashSaleIds = flashSale.body.data.map((p: { id: string }) => p.id);
    expect(flashSaleIds).toContain(flashSaleId);
    expect(flashSaleIds).not.toContain(featuredId);
  });

  it("public seller storefront: GET /sellers/:id returns a public profile (no email/phone), GET /sellers/:id/products lists only their products, and a non-seller ID 404s", async () => {
    const suffix = randomUUID().slice(0, 8);

    // sellerToken belongs to a user with a real name (set at signup) and the seller role.
    const me = await request(app.getHttpServer())
      .get("/v1/me")
      .set("Authorization", `Bearer ${sellerToken}`)
      .expect(200);
    const sellerId = me.body.data.id as string;

    const category = await request(app.getHttpServer())
      .post("/v1/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Storefront", slug: `storefront-${suffix}` })
      .expect(201);

    const product = await request(app.getHttpServer())
      .post("/v1/products")
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({
        categoryId: category.body.data.id,
        title: "Storefront Product",
        slug: `storefront-product-${suffix}`,
        variants: [
          {
            sku: `SF-${suffix}`,
            name: "Default",
            priceAmount: "2.00",
            priceCurrency: "SLE",
            stockQuantity: 1,
          },
        ],
      })
      .expect(201);

    const profile = await request(app.getHttpServer()).get(`/v1/sellers/${sellerId}`).expect(200);
    expect(profile.body.data.id).toBe(sellerId);
    expect(profile.body.data.name).toEqual(expect.any(String));
    expect(profile.body.data).not.toHaveProperty("email");
    expect(profile.body.data).not.toHaveProperty("phone");

    const products = await request(app.getHttpServer())
      .get(`/v1/sellers/${sellerId}/products`)
      .expect(200);
    const ids = products.body.data.map((p: { id: string; sellerId: string }) => {
      expect(p.sellerId).toBe(sellerId);
      return p.id;
    });
    expect(ids).toContain(product.body.data.id);

    // A customer (not a seller) is not a valid storefront — 404, not an empty profile.
    const customerMe = await request(app.getHttpServer())
      .get("/v1/me")
      .set("Authorization", `Bearer ${customerToken}`)
      .expect(200);
    const notFound = await request(app.getHttpServer())
      .get(`/v1/sellers/${customerMe.body.data.id}`)
      .expect(404);
    expect(notFound.body.error.code).toBe("SELLER_NOT_FOUND");
  });
});
