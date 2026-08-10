import { randomUUID } from "node:crypto";

import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../../app.module";
import { PrismaService } from "../../prisma/prisma.service";
import { createTestApp } from "../../test-utils/create-test-app";
import { promoteRole } from "../../test-utils/promote-role";

describe("Catalog full-text search (integration)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let sellerToken: string;
  let categoryId: string;
  let brandId: string;
  const suffix = randomUUID().slice(0, 8);

  async function signUpAndPromote(rolePrefix: string, roles: string[]): Promise<string> {
    const s = randomUUID().slice(0, 8);
    const signup = await request(app.getHttpServer())
      .post("/v1/auth/signup")
      .send({
        firstName: rolePrefix,
        lastName: "Test",
        email: `${rolePrefix}-${s}@example.test`,
        phone: `+2327800${s.slice(0, 4)}`,
        password: "correct-horse-battery-staple",
        confirmPassword: "correct-horse-battery-staple",
      });
    if (roles.length > 0) {
      await promoteRole(prisma, signup.body.data.user.id, ["customer", ...roles]);
      const relogin = await request(app.getHttpServer())
        .post("/v1/auth/login")
        .send({
          email: `${rolePrefix}-${s}@example.test`,
          password: "correct-horse-battery-staple",
        });
      return relogin.body.data.accessToken;
    }
    return signup.body.data.accessToken;
  }

  async function createProduct(opts: { title: string; description?: string; price: string }) {
    const s = randomUUID().slice(0, 8);
    const product = await request(app.getHttpServer())
      .post("/v1/products")
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({
        categoryId,
        brandId,
        title: opts.title,
        slug: `search-${s}`,
        description: opts.description,
        variants: [
          {
            sku: `SEARCH-${s}`,
            name: "Default",
            priceAmount: opts.price,
            priceCurrency: "SLE",
            stockQuantity: 10,
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

    sellerToken = await signUpAndPromote("search-seller", ["seller", "admin"]);

    const category = await request(app.getHttpServer())
      .post("/v1/categories")
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({ name: "Search Category", slug: `search-category-${suffix}` });
    categoryId = category.body.data.id;

    const brand = await request(app.getHttpServer())
      .post("/v1/brands")
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({ name: "Search Brand", slug: `search-brand-${suffix}` });
    brandId = brand.body.data.id;

    await createProduct({
      title: `Wireless Mouse ${suffix}`,
      description: "An ergonomic wireless mouse with a rechargeable battery.",
      price: "25.00",
    });
    await createProduct({
      title: `Wireless Keyboard ${suffix}`,
      description: "A mechanical wireless keyboard with backlighting.",
      price: "75.00",
    });
    await createProduct({
      title: `Solar Lamp ${suffix}`,
      description: "A rechargeable solar-powered lamp for outdoor use.",
      price: "15.00",
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it("matches a multi-word query across title and description, ranked by relevance", async () => {
    const response = await request(app.getHttpServer())
      .get("/v1/products")
      .query({ q: `wireless mouse ${suffix}` })
      .expect(200);

    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    expect(response.body.data[0].title).toBe(`Wireless Mouse ${suffix}`);
  });

  it("matches on a partial word prefix", async () => {
    const response = await request(app.getHttpServer())
      .get("/v1/products")
      .query({ q: `keyb ${suffix}` })
      .expect(200);

    const titles = response.body.data.map((p: { title: string }) => p.title);
    expect(titles).toContain(`Wireless Keyboard ${suffix}`);
  });

  it("finds a product by a word that only appears in the description, not the title", async () => {
    const response = await request(app.getHttpServer())
      .get("/v1/products")
      .query({ q: `rechargeable ${suffix}` })
      .expect(200);

    const titles = response.body.data.map((p: { title: string }) => p.title);
    expect(titles).toContain(`Wireless Mouse ${suffix}`);
    expect(titles).toContain(`Solar Lamp ${suffix}`);
    expect(titles).not.toContain(`Wireless Keyboard ${suffix}`);
  });

  it("combines a text query with category/brand and price-range filters", async () => {
    const response = await request(app.getHttpServer())
      .get("/v1/products")
      .query({
        q: `wireless ${suffix}`,
        categoryId,
        brandId,
        minPrice: "50.00",
        maxPrice: "100.00",
      })
      .expect(200);

    const titles = response.body.data.map((p: { title: string }) => p.title);
    expect(titles).toContain(`Wireless Keyboard ${suffix}`);
    expect(titles).not.toContain(`Wireless Mouse ${suffix}`); // below minPrice
  });

  it("price-range filtering works on the non-search listing path too", async () => {
    const response = await request(app.getHttpServer())
      .get("/v1/products")
      .query({ categoryId, minPrice: "20.00", maxPrice: "30.00" })
      .expect(200);

    const titles = response.body.data.map((p: { title: string }) => p.title);
    expect(titles).toContain(`Wireless Mouse ${suffix}`);
    expect(titles).not.toContain(`Wireless Keyboard ${suffix}`);
    expect(titles).not.toContain(`Solar Lamp ${suffix}`);
  });

  it("returns an empty result set for a query that matches nothing, without erroring", async () => {
    const response = await request(app.getHttpServer())
      .get("/v1/products")
      .query({ q: `zzznonexistentterm${suffix}` })
      .expect(200);

    expect(response.body.data).toEqual([]);
    expect(response.body.pageInfo.hasMore).toBe(false);
    expect(response.body.pageInfo.nextCursor).toBeNull();
  });

  it("returns an empty result set for an all-punctuation query rather than erroring on an invalid tsquery", async () => {
    const response = await request(app.getHttpServer())
      .get("/v1/products")
      .query({ q: "!!!" })
      .expect(200);

    expect(response.body.data).toEqual([]);
  });
});
