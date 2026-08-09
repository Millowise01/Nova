import { randomUUID } from "node:crypto";

import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../../app.module";
import { PrismaService } from "../../prisma/prisma.service";
import { createTestApp } from "../../test-utils/create-test-app";
import { promoteRole } from "../../test-utils/promote-role";

describe("Wishlist (integration)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let categoryId: string;

  async function signUp() {
    const suffix = randomUUID().slice(0, 8);
    const signup = await request(app.getHttpServer())
      .post("/v1/auth/signup")
      .send({
        firstName: "Wish",
        lastName: "Lister",
        email: `wishlist-${suffix}@example.test`,
        phone: `+2327500${suffix.slice(0, 4)}`,
        password: "correct-horse-battery-staple",
        confirmPassword: "correct-horse-battery-staple",
      })
      .expect(201);
    return signup.body.data.accessToken as string;
  }

  async function createProduct(sellerToken: string) {
    const suffix = randomUUID().slice(0, 8);
    const product = await request(app.getHttpServer())
      .post("/v1/products")
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({
        categoryId,
        title: "Wishlist Test Product",
        slug: `wishlist-product-${suffix}`,
        variants: [
          {
            sku: `WL-${suffix}`,
            name: "Default",
            priceAmount: "9.99",
            priceCurrency: "SLE",
            stockQuantity: 5,
          },
        ],
      })
      .expect(201);
    return product.body.data.id as string;
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = await createTestApp(moduleRef);
    prisma = app.get(PrismaService);

    const adminEmail = `wishlist-admin-${randomUUID().slice(0, 8)}@example.test`;
    const adminSignup = await request(app.getHttpServer())
      .post("/v1/auth/signup")
      .send({
        firstName: "Admin",
        lastName: "User",
        email: adminEmail,
        phone: `+2327501${randomUUID().slice(0, 4)}`,
        password: "correct-horse-battery-staple",
        confirmPassword: "correct-horse-battery-staple",
      })
      .expect(201);
    await promoteRole(prisma, adminSignup.body.data.user.id, ["customer", "admin"]);

    // Role changed after the token was issued — log in again for a token carrying it,
    // same reasoning as catalog.integration.spec.ts's signUpAndPromote.
    const adminRelogin = await request(app.getHttpServer())
      .post("/v1/auth/login")
      .send({ email: adminEmail, password: "correct-horse-battery-staple" })
      .expect(200);

    const category = await request(app.getHttpServer())
      .post("/v1/categories")
      .set("Authorization", `Bearer ${adminRelogin.body.data.accessToken}`)
      .send({ name: "Wishlist Category", slug: `wishlist-category-${randomUUID().slice(0, 8)}` })
      .expect(201);
    categoryId = category.body.data.id as string;
  });

  afterAll(async () => {
    await app.close();
  });

  it("requires auth for all wishlist routes", async () => {
    await request(app.getHttpServer()).get("/v1/wishlist").expect(401);
    await request(app.getHttpServer())
      .post("/v1/wishlist/items")
      .send({ productId: randomUUID() })
      .expect(401);
    await request(app.getHttpServer()).delete(`/v1/wishlist/items/${randomUUID()}`).expect(401);
  });

  it("creates a wishlist lazily — GET returns an empty one on first access", async () => {
    const token = await signUp();

    const response = await request(app.getHttpServer())
      .get("/v1/wishlist")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.data.items).toEqual([]);
    expect(response.body.data.userId).toEqual(expect.any(String));
  });

  it("adds an item, is idempotent on a duplicate add, lists it, and audit-logs the create", async () => {
    const sellerToken = await signUp();
    await promoteRole(prisma, (await getUserId(sellerToken)) ?? "", ["customer", "seller"]);
    const relogin = await reloginAfterPromote(sellerToken);
    const productId = await createProduct(relogin);

    const buyerToken = await signUp();

    const added = await request(app.getHttpServer())
      .post("/v1/wishlist/items")
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({ productId })
      .expect(201);
    expect(added.body.data.productId).toBe(productId);
    // Enriched via a synchronous call into Catalog's public service — proves the
    // cross-module read works, not just that the raw FK was stored.
    expect(added.body.data.product.id).toBe(productId);
    expect(added.body.data.product.title).toBe("Wishlist Test Product");
    expect(added.body.data.product.slug).toEqual(expect.any(String));

    // Duplicate add — same product, no variant — must not create a second row.
    await request(app.getHttpServer())
      .post("/v1/wishlist/items")
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({ productId })
      .expect(201);

    const list = await request(app.getHttpServer())
      .get("/v1/wishlist")
      .set("Authorization", `Bearer ${buyerToken}`)
      .expect(200);
    expect(list.body.data.items).toHaveLength(1);

    const auditRow = await prisma.auditLog.findFirst({
      where: { action: "wishlist.item.create", targetId: added.body.data.id },
    });
    expect(auditRow).not.toBeNull();
  });

  it("removes an item, audit-logs the delete, and 403s a different user trying to remove it", async () => {
    const sellerToken = await signUp();
    await promoteRole(prisma, (await getUserId(sellerToken)) ?? "", ["customer", "seller"]);
    const relogin = await reloginAfterPromote(sellerToken);
    const productId = await createProduct(relogin);

    const ownerToken = await signUp();
    const otherToken = await signUp();

    const added = await request(app.getHttpServer())
      .post("/v1/wishlist/items")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ productId })
      .expect(201);
    const itemId = added.body.data.id as string;

    // A different, unrelated user cannot delete someone else's wishlist item.
    const forbidden = await request(app.getHttpServer())
      .delete(`/v1/wishlist/items/${itemId}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .expect(403);
    expect(forbidden.body.error.code).toBe("WISHLIST_ACCESS_DENIED");

    await request(app.getHttpServer())
      .delete(`/v1/wishlist/items/${itemId}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .expect(204);

    const list = await request(app.getHttpServer())
      .get("/v1/wishlist")
      .set("Authorization", `Bearer ${ownerToken}`)
      .expect(200);
    expect(list.body.data.items).toEqual([]);

    const auditRow = await prisma.auditLog.findFirst({
      where: { action: "wishlist.item.delete", targetId: itemId },
    });
    expect(auditRow).not.toBeNull();
  });

  it("404s removing a nonexistent item", async () => {
    const token = await signUp();
    const response = await request(app.getHttpServer())
      .delete(`/v1/wishlist/items/${randomUUID()}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(404);
    expect(response.body.error.code).toBe("WISHLIST_ITEM_NOT_FOUND");
  });

  async function getUserId(accessToken: string): Promise<string | null> {
    const me = await request(app.getHttpServer())
      .get("/v1/me")
      .set("Authorization", `Bearer ${accessToken}`);
    return me.body.data?.id ?? null;
  }

  async function reloginAfterPromote(originalToken: string): Promise<string> {
    const me = await request(app.getHttpServer())
      .get("/v1/me")
      .set("Authorization", `Bearer ${originalToken}`);
    const email = me.body.data.email as string;
    const login = await request(app.getHttpServer())
      .post("/v1/auth/login")
      .send({ email, password: "correct-horse-battery-staple" });
    return login.body.data.accessToken as string;
  }
});
