import { randomUUID } from "node:crypto";

import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../../app.module";
import { PrismaService } from "../../prisma/prisma.service";
import { createTestApp } from "../../test-utils/create-test-app";
import { promoteRole } from "../../test-utils/promote-role";

describe("Cart & Checkout (integration)", () => {
  let app: INestApplication;
  let sellerToken: string;
  let variantId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = await createTestApp(moduleRef);
    const prisma = app.get(PrismaService);

    const suffix = randomUUID().slice(0, 8);
    const sellerEmail = `cart-seller-${suffix}@example.test`;
    const signup = await request(app.getHttpServer())
      .post("/v1/auth/signup")
      .send({
        firstName: "Seller",
        lastName: "Test",
        email: sellerEmail,
        phone: `+2327800${suffix.slice(0, 4)}`,
        password: "correct-horse-battery-staple",
        confirmPassword: "correct-horse-battery-staple",
      });
    await promoteRole(prisma, signup.body.data.user.id, ["customer", "seller", "admin"]);
    const relogin = await request(app.getHttpServer())
      .post("/v1/auth/login")
      .send({ email: sellerEmail, password: "correct-horse-battery-staple" });
    sellerToken = relogin.body.data.accessToken;

    const category = await request(app.getHttpServer())
      .post("/v1/categories")
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({ name: "Cart Test Category", slug: `cart-cat-${suffix}` });

    const product = await request(app.getHttpServer())
      .post("/v1/products")
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({
        categoryId: category.body.data.id,
        title: "Cart Test Product",
        slug: `cart-product-${suffix}`,
        variants: [
          {
            sku: `CT-${suffix}`,
            name: "Default",
            priceAmount: "50.00",
            priceCurrency: "SLE",
            stockQuantity: 100,
          },
        ],
      });
    variantId = product.body.data.variants[0].id;
  });

  afterAll(async () => {
    await app.close();
  });

  it("creates a guest cart, adds a line (synchronously confirmed against Catalog), and totals correctly", async () => {
    const cart = await request(app.getHttpServer()).post("/v1/cart").expect(201);
    const cartId = cart.body.data.cartId;
    expect(cart.body.data.guestToken).toEqual(expect.any(String)); // guest, no auth header sent

    await request(app.getHttpServer())
      .post(`/v1/cart/${cartId}/lines`)
      .send({ variantId, quantity: 3 })
      .expect(201);

    const view = await request(app.getHttpServer()).get(`/v1/cart/${cartId}`).expect(200);
    expect(view.body.data.lines).toHaveLength(1);
    expect(view.body.data.subtotal.amount).toBe("150.00"); // 50.00 * 3, string not float
    expect(view.body.data.subtotal.currency).toBe("SLE");
  });

  it("rejects adding a line for a variant that doesn't exist", async () => {
    const cart = await request(app.getHttpServer()).post("/v1/cart").expect(201);
    const response = await request(app.getHttpServer())
      .post(`/v1/cart/${cart.body.data.cartId}/lines`)
      .send({ variantId: randomUUID(), quantity: 1 })
      .expect(404);
    expect(response.body.error.code).toBe("VARIANT_NOT_FOUND");
  });

  it("creates a checkout session from a cart with the shared @nova/validation checkoutSchema shape", async () => {
    const cart = await request(app.getHttpServer()).post("/v1/cart").expect(201);
    const cartId = cart.body.data.cartId;
    await request(app.getHttpServer())
      .post(`/v1/cart/${cartId}/lines`)
      .send({ variantId, quantity: 2 })
      .expect(201);

    const session = await request(app.getHttpServer())
      .post(`/v1/carts/${cartId}/checkout/session`)
      .send({
        addressLine: "1 Siaka Stevens St",
        city: "Freetown",
        district: "Western Area",
        phone: "+23276000000",
        deliveryMethod: "standard",
        paymentMethod: "wallet",
      })
      .expect(201);

    expect(session.body.data.status).toBe("pending");
    expect(session.body.data.totalAmount).toBe("100.00");
  });

  it("rejects a checkout session for an empty cart", async () => {
    const cart = await request(app.getHttpServer()).post("/v1/cart").expect(201);
    const response = await request(app.getHttpServer())
      .post(`/v1/carts/${cart.body.data.cartId}/checkout/session`)
      .send({
        addressLine: "1 Siaka Stevens St",
        city: "Freetown",
        district: "Western Area",
        phone: "+23276000000",
        deliveryMethod: "standard",
        paymentMethod: "wallet",
      })
      .expect(400);
    expect(response.body.error.code).toBe("CART_EMPTY");
  });

  it("rejects a checkout session request that doesn't match the shared schema", async () => {
    const cart = await request(app.getHttpServer()).post("/v1/cart").expect(201);
    const response = await request(app.getHttpServer())
      .post(`/v1/carts/${cart.body.data.cartId}/checkout/session`)
      .send({ addressLine: "x" }) // missing required fields, addressLine too short
      .expect(400);
    expect(response.body.error.code).toBe("VALIDATION_FAILED");
  });
});
