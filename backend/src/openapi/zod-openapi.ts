import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  type RouteConfig,
} from "@asteasolutions/zod-to-openapi";
import type { OpenAPIObject } from "@nestjs/swagger";
import { z } from "zod";

import {
  addCartLineSchema,
  cancelOrderSchema,
  checkoutSchema,
  createBrandSchema,
  createCategorySchema,
  createOrderSchema,
  createProductSchema,
  loginSchema,
  otpRequestSchema,
  otpVerifySchema,
  proposeRefundSchema,
  refreshTokenSchema,
  registerSchema,
  rejectRefundSchema,
} from "@nova/validation";

extendZodWithOpenApi(z);

/**
 * Generates request-body schemas for the OpenAPI doc directly from the SAME Zod
 * schema objects `ZodValidationPipe` uses for real request validation — a schema
 * change in @nova/validation shows up here automatically, with no separate,
 * hand-maintained annotation to fall out of sync. Response bodies are
 * intentionally NOT covered: there is no validated response-schema source of
 * truth to generate from (only request-side Zod schemas exist), and inventing
 * response shapes here would document something nothing actually enforces.
 */
function body(schema: z.ZodTypeAny) {
  return {
    content: { "application/json": { schema } },
  };
}

function okResponse(status: number, description: string) {
  return { [String(status)]: { description } };
}

const routes: RouteConfig[] = [
  {
    method: "post",
    path: "/v1/auth/signup",
    tags: ["auth"],
    request: { body: body(registerSchema) },
    responses: okResponse(201, "Account created"),
  },
  {
    method: "post",
    path: "/v1/auth/login",
    tags: ["auth"],
    request: { body: body(loginSchema) },
    responses: okResponse(200, "Authenticated"),
  },
  {
    method: "post",
    path: "/v1/auth/refresh",
    tags: ["auth"],
    request: { body: body(refreshTokenSchema) },
    responses: okResponse(200, "Access token refreshed"),
  },
  {
    method: "post",
    path: "/v1/auth/otp",
    tags: ["auth"],
    request: { body: body(otpRequestSchema) },
    responses: okResponse(202, "OTP code dispatched"),
  },
  {
    method: "post",
    path: "/v1/auth/otp/verify",
    tags: ["auth"],
    request: { body: body(otpVerifySchema) },
    responses: okResponse(200, "OTP verified"),
  },
  {
    method: "post",
    path: "/v1/categories",
    tags: ["catalog"],
    request: { body: body(createCategorySchema) },
    responses: okResponse(201, "Category created"),
  },
  {
    method: "post",
    path: "/v1/brands",
    tags: ["catalog"],
    request: { body: body(createBrandSchema) },
    responses: okResponse(201, "Brand created"),
  },
  {
    method: "post",
    path: "/v1/products",
    tags: ["catalog"],
    request: { body: body(createProductSchema) },
    responses: okResponse(201, "Product created"),
  },
  {
    method: "post",
    path: "/v1/cart/{cartId}/lines",
    tags: ["cart-checkout"],
    request: { body: body(addCartLineSchema) },
    responses: okResponse(201, "Line added to cart"),
  },
  {
    method: "post",
    path: "/v1/carts/{cartId}/checkout/session",
    tags: ["cart-checkout"],
    request: { body: body(checkoutSchema) },
    responses: okResponse(201, "Checkout session created"),
  },
  {
    method: "post",
    path: "/v1/orders",
    tags: ["orders"],
    request: { body: body(createOrderSchema) },
    responses: okResponse(201, "Order created"),
  },
  {
    method: "patch",
    path: "/v1/orders/{id}/cancel",
    tags: ["orders"],
    request: { body: body(cancelOrderSchema) },
    responses: okResponse(200, "Order cancelled"),
  },
  {
    method: "post",
    path: "/v1/wallet/refunds",
    tags: ["payments-wallet"],
    request: { body: body(proposeRefundSchema) },
    responses: okResponse(
      201,
      "Refund proposed (or executed, if at/below the auto-execute threshold)",
    ),
  },
  {
    method: "patch",
    path: "/v1/wallet/refunds/{id}/reject",
    tags: ["payments-wallet"],
    request: { body: body(rejectRefundSchema) },
    responses: okResponse(200, "Refund rejected"),
  },
];

/** Partial OpenAPI doc (paths + component schemas only) to merge into the
 *  Nest-reflection-generated document, which already has correct
 *  tags/operationIds/path-parameters but no request-body schemas. */
export function buildZodOpenApiPaths() {
  const registry = new OpenAPIRegistry();
  for (const route of routes) registry.registerPath(route);

  const generator = new OpenApiGeneratorV3(registry.definitions);
  const doc = generator.generateDocument({
    openapi: "3.0.0",
    info: { title: "Nova API (Zod request schemas)", version: "1.0" },
  });

  return { paths: doc.paths, schemas: doc.components?.schemas ?? {} };
}

/**
 * Splices Zod-derived requestBody schemas into the Nest-reflection-generated
 * document in place. Only `requestBody` is copied onto each matching
 * path+method — every other Nest-derived field (parameters, tags,
 * operationId, responses) is left exactly as Nest produced it.
 */
export function mergeZodRequestBodies(nestDoc: OpenAPIObject): void {
  const { paths: zodPaths, schemas } = buildZodOpenApiPaths();

  for (const [path, methods] of Object.entries(zodPaths ?? {})) {
    const nestPathItem = nestDoc.paths[path] as
      Record<string, { requestBody?: unknown }> | undefined;
    if (!nestPathItem) continue;

    for (const [method, operation] of Object.entries(
      methods as Record<string, { requestBody?: unknown }>,
    )) {
      const nestOperation = nestPathItem[method];
      if (nestOperation && operation.requestBody) {
        nestOperation.requestBody = operation.requestBody;
      }
    }
  }

  // `schemas` comes from zod-to-openapi's own openapi3-ts, a structurally similar
  // but separately-versioned copy of the SchemaObject type @nestjs/swagger uses —
  // a real JSON shape at runtime, just not the identical TS type at this boundary.
  nestDoc.components ??= {};
  const merged: Record<string, unknown> = { ...nestDoc.components.schemas, ...schemas };
  nestDoc.components.schemas = merged as NonNullable<OpenAPIObject["components"]>["schemas"];
}
