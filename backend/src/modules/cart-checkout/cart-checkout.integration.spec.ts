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

  it("creates a checkout session from a cart with the shared @nova/validation checkoutSchema shape, total = subtotal + shipping (no promo code)", async () => {
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
    expect(session.body.data.subtotalAmount).toBe("100.00"); // 50.00 * 2
    expect(session.body.data.shippingFeeAmount).toBe("15.00"); // stub flat "standard" rate
    expect(session.body.data.discountAmount).toBe("0.00");
    expect(session.body.data.totalAmount).toBe("115.00"); // 100.00 - 0.00 + 15.00
  });

  it("charges no shipping fee for pickup, and a higher flat fee for express", async () => {
    const cart = await request(app.getHttpServer()).post("/v1/cart").expect(201);
    const cartId = cart.body.data.cartId;
    await request(app.getHttpServer())
      .post(`/v1/cart/${cartId}/lines`)
      .send({ variantId, quantity: 1 })
      .expect(201);

    const pickup = await request(app.getHttpServer())
      .post(`/v1/carts/${cartId}/checkout/session`)
      .send({
        addressLine: "1 Siaka Stevens St",
        city: "Freetown",
        district: "Western Area",
        phone: "+23276000000",
        deliveryMethod: "pickup",
        paymentMethod: "wallet",
      })
      .expect(201);
    expect(pickup.body.data.shippingFeeAmount).toBe("0.00");
    expect(pickup.body.data.totalAmount).toBe("50.00");

    const cart2 = await request(app.getHttpServer()).post("/v1/cart").expect(201);
    const cartId2 = cart2.body.data.cartId;
    await request(app.getHttpServer())
      .post(`/v1/cart/${cartId2}/lines`)
      .send({ variantId, quantity: 1 })
      .expect(201);

    const express = await request(app.getHttpServer())
      .post(`/v1/carts/${cartId2}/checkout/session`)
      .send({
        addressLine: "1 Siaka Stevens St",
        city: "Freetown",
        district: "Western Area",
        phone: "+23276000000",
        deliveryMethod: "express",
        paymentMethod: "wallet",
      })
      .expect(201);
    expect(express.body.data.shippingFeeAmount).toBe("35.00");
    expect(express.body.data.totalAmount).toBe("85.00");
  });

  it("applies a valid promo code as a discount and rejects an invalid one", async () => {
    const validCart = await request(app.getHttpServer()).post("/v1/cart").expect(201);
    const validCartId = validCart.body.data.cartId;
    await request(app.getHttpServer())
      .post(`/v1/cart/${validCartId}/lines`)
      .send({ variantId, quantity: 2 })
      .expect(201);

    // Stub validator (backend/src/modules/cart-checkout/domain/pricing/) recognizes
    // exactly one dev code, 10% off, pending a real Marketing campaign context.
    const applied = await request(app.getHttpServer())
      .post(`/v1/carts/${validCartId}/checkout/session`)
      .send({
        addressLine: "1 Siaka Stevens St",
        city: "Freetown",
        district: "Western Area",
        phone: "+23276000000",
        deliveryMethod: "pickup",
        paymentMethod: "wallet",
        promoCode: "welcome10",
      })
      .expect(201);
    expect(applied.body.data.promoCode).toBe("welcome10");
    expect(applied.body.data.discountAmount).toBe("10.00"); // 10% of 100.00
    expect(applied.body.data.totalAmount).toBe("90.00"); // 100.00 - 10.00 + 0.00 shipping

    const invalidCart = await request(app.getHttpServer()).post("/v1/cart").expect(201);
    const invalidCartId = invalidCart.body.data.cartId;
    await request(app.getHttpServer())
      .post(`/v1/cart/${invalidCartId}/lines`)
      .send({ variantId, quantity: 1 })
      .expect(201);

    const rejected = await request(app.getHttpServer())
      .post(`/v1/carts/${invalidCartId}/checkout/session`)
      .send({
        addressLine: "1 Siaka Stevens St",
        city: "Freetown",
        district: "Western Area",
        phone: "+23276000000",
        deliveryMethod: "pickup",
        paymentMethod: "wallet",
        promoCode: "NOT-A-REAL-CODE",
      })
      .expect(400);
    expect(rejected.body.error.code).toBe("PROMO_CODE_INVALID");
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
