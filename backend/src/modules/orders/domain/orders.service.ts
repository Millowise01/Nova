import { createHash } from "node:crypto";

import { subject } from "@casl/ability";
import { Injectable } from "@nestjs/common";

import { AuditLogger, type RequestContext } from "../../../common/audit/audit-logger.service";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../../common/errors/api-error";
import { AbilityFactory } from "../../../common/policy/ability.factory";
import type { PolicyUser } from "../../../common/policy/policy.types";
import { PrismaService } from "../../../prisma/prisma.service";
import { CartCheckoutPublicService } from "../../cart-checkout";
import { CatalogPublicService } from "../../catalog";
import { PaymentsWalletPublicService } from "../../payments-wallet";

import { canCancel, canTransition, type OrderStatus } from "./order-state-machine";

const ORDERS_ENDPOINT = "POST /v1/orders";

interface IdempotentResult {
  statusCode: number;
  body: unknown;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartCheckout: CartCheckoutPublicService,
    private readonly catalog: CatalogPublicService,
    private readonly paymentsWallet: PaymentsWalletPublicService,
    private readonly audit: AuditLogger,
    private readonly abilityFactory: AbilityFactory,
  ) {}

  static hashRequestBody(body: unknown): string {
    return createHash("sha256").update(JSON.stringify(body)).digest("hex");
  }

  /**
   * The idempotent checkout-completion endpoint (backend/docs/02's worked example).
   * Two independent layers make a retried request safe:
   *   1. The IdempotencyKey pre-check below — a genuine retry (same key, same body)
   *      short-circuits here and replays the original response verbatim, touching
   *      nothing else.
   *   2. Inside the transaction, CartCheckoutPublicService.tryConsumeSession's atomic
   *      conditional UPDATE — even if two requests somehow raced past step 1 (e.g. two
   *      different idempotency keys pointed at the same session, which would be a
   *      client bug, not a legitimate retry), only one can ever flip a given
   *      CheckoutSession from pending to consumed; the other gets a clean 409, not a
   *      duplicate Order.
   */
  async createOrder(
    idempotencyKey: string,
    requestBody: unknown,
    checkoutSessionId: string,
    userId: string | null,
    ctx: RequestContext,
  ): Promise<IdempotentResult> {
    const requestHash = OrdersService.hashRequestBody(requestBody);

    const existing = await this.prisma.idempotencyKey.findUnique({
      where: { key_endpoint: { key: idempotencyKey, endpoint: ORDERS_ENDPOINT } },
    });
    if (existing) {
      if (existing.requestHash !== requestHash) {
        throw new ConflictError(
          "IDEMPOTENCY_KEY_CONFLICT",
          "This idempotency key was already used for a different request.",
        );
      }
      return { statusCode: existing.statusCode, body: existing.responseBody };
    }

    const session = await this.cartCheckout.getSessionWithLines(checkoutSessionId);

    // A session that belongs to a user can only be turned into an order by that user —
    // otherwise anyone holding a session ID could place an order in the owner's name.
    // Guest sessions (no userId) are unowned; the order then belongs to the caller.
    if (session.userId && session.userId !== userId) {
      throw new ForbiddenError(
        "CHECKOUT_SESSION_ACCESS_DENIED",
        "You do not have access to this checkout session.",
      );
    }

    const lineSnapshots = await Promise.all(
      session.lines.map(async (line) => ({
        ...(await this.catalog.confirmPriceAndStock(line.variantId, line.quantity)),
        quantity: line.quantity,
      })),
    );

    const unavailable = lineSnapshots.filter((snap) => !snap.available);
    if (unavailable.length > 0) {
      throw new BadRequestError(
        "ORDER_STOCK_UNAVAILABLE",
        "One or more items in this order are no longer in stock.",
        unavailable.map((snap) => ({ variantId: snap.variantId })),
      );
    }

    const bySeller = new Map<string, typeof lineSnapshots>();
    for (const snap of lineSnapshots) {
      const list = bySeller.get(snap.sellerId) ?? [];
      list.push(snap);
      bySeller.set(snap.sellerId, list);
    }

    const responseBody = await this.prisma.$transaction(async (tx) => {
      const consumed = await this.cartCheckout.tryConsumeSession(tx, checkoutSessionId);
      if (!consumed) {
        throw new ConflictError(
          "CHECKOUT_SESSION_ALREADY_CONSUMED",
          "This checkout session has already been used to create an order.",
        );
      }

      const order = await tx.order.create({
        data: {
          checkoutSessionId,
          userId: session.userId ?? userId,
          status: "placed",
          totalAmount: session.totalAmount,
          totalCurrency: session.totalCurrency,
          subOrders: {
            create: Array.from(bySeller.entries()).map(([sellerId, lines]) => ({
              sellerId,
              status: "placed",
              subtotalAmount: lines
                .reduce((sum, l) => sum + Number(l.unitPriceAmount) * l.quantity, 0)
                .toFixed(2),
              subtotalCurrency: lines[0].unitPriceCurrency,
            })),
          },
        },
        include: { subOrders: true },
      });

      // The outbox write — SAME transaction as the Order/SubOrder insert above, per
      // Vol 2, D3/E3: this is what guarantees the OrderPlaced event is never lost to a
      // crash between "order committed" and "event published", and never fires for an
      // order that ends up rolled back.
      await tx.outboxEvent.create({
        data: {
          aggregateType: "Order",
          aggregateId: order.id,
          eventType: "OrderPlaced",
          eventVersion: 1,
          payload: {
            orderId: order.id,
            userId: order.userId,
            subOrders: order.subOrders.map((s) => ({ id: s.id, sellerId: s.sellerId })),
            total: { amount: order.totalAmount.toFixed(2), currency: order.totalCurrency },
            placedAt: order.createdAt.toISOString(),
          },
        },
      });

      // Payment processing (Vol 5, B1) — a one-directional call into Payments &
      // Wallet, WITHIN this same transaction (backend/docs/09's documented design,
      // and the documented limitation that comes with it once a real, non-instant
      // PSP adapter exists). Orders decides its own resulting status; Payments &
      // Wallet never touches the orders table.
      const paymentResult = await this.paymentsWallet.processPaymentForOrder(tx, {
        orderId: order.id,
        userId: session.userId ?? userId,
        method: session.paymentMethod,
        amount: order.totalAmount.toFixed(2),
        currency: order.totalCurrency,
      });

      const finalStatus = paymentResult.succeeded ? "confirmed" : "cancelled";
      const finalOrder = await tx.order.update({
        where: { id: order.id },
        data: { status: finalStatus },
      });

      if (!paymentResult.succeeded) {
        await tx.outboxEvent.create({
          data: {
            aggregateType: "Order",
            aggregateId: order.id,
            eventType: "OrderCancelled",
            eventVersion: 1,
            // userId added (Batch B) so Notification's handler has someone to notify —
            // additive-only per backend/docs/04's payload-versioning policy, no version
            // bump needed. Real gap found while wiring notifications: this payload never
            // carried a target user before.
            payload: {
              orderId: order.id,
              userId: order.userId,
              previousStatus: "placed",
              reason: "payment_failed",
            },
          },
        });
      }

      const body = {
        data: {
          id: order.id,
          status: finalOrder.status,
          total: { amount: order.totalAmount.toFixed(2), currency: order.totalCurrency },
          subOrders: order.subOrders.map((s) => ({
            id: s.id,
            sellerId: s.sellerId,
            status: s.status,
            subtotal: { amount: s.subtotalAmount.toFixed(2), currency: s.subtotalCurrency },
          })),
          paymentIntentId: paymentResult.paymentIntentId,
          createdAt: order.createdAt.toISOString(),
        },
      };

      // Stored in the SAME transaction as the order — if this insert fails (e.g. a
      // genuine race on the unique (key, endpoint) constraint), the whole transaction,
      // including the Order/SubOrder/OutboxEvent rows above, rolls back atomically.
      await tx.idempotencyKey.create({
        data: {
          key: idempotencyKey,
          endpoint: ORDERS_ENDPOINT,
          requestHash,
          statusCode: 201,
          responseBody: body,
        },
      });

      return body;
    });

    await this.audit.record({
      actorId: userId,
      action: "order.create",
      targetType: "Order",
      targetId: (responseBody as { data: { id: string } }).data.id,
      ipAddress: ctx.ipAddress,
      correlationId: ctx.correlationId,
    });

    return { statusCode: 201, body: responseBody };
  }

  /**
   * ABAC via the central policy engine (Vol 3, B3), not an inline `if` — replaces what
   * was previously `if (order.userId !== requesterId) throw Forbidden` directly in this
   * service, exactly the ad hoc pattern Vol 2, B2 (point 5) and Vol 3, B3 prohibit.
   * `subject()` tags the fetched row so CASL can match the `{ userId: ... }` condition
   * against this SPECIFIC order — the route-level PolicyGuard only knows "Order" the
   * subject type, not this row.
   *
   * Guest orders (no `userId`) are readable only by an actor whose ability grants
   * "manage all" (i.e. admin) — there's no owner identity to match against, so nobody
   * else can claim ownership. This is slightly stricter than the previous inline check,
   * which let any authenticated user read any guest order by ID; that gap is closed as
   * a byproduct of routing this through the same ABAC condition every other order uses.
   */
  async getOrder(orderId: string, requester: PolicyUser) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, deletedAt: null },
      include: { subOrders: true },
    });
    if (!order) throw new NotFoundError("ORDER_NOT_FOUND", "No order found for this ID.");

    const ability = this.abilityFactory.buildFor(requester);
    if (!ability.can("read", subject("Order", order))) {
      throw new ForbiddenError("ORDER_ACCESS_DENIED", "You do not have access to this order.");
    }
    return order;
  }

  async cancelOrder(orderId: string, requester: PolicyUser, ctx: RequestContext, reason?: string) {
    const order = await this.getOrder(orderId, requester);
    const ability = this.abilityFactory.buildFor(requester);
    if (!ability.can("cancel", subject("Order", order))) {
      throw new ForbiddenError("ORDER_ACCESS_DENIED", "You do not have access to this order.");
    }

    const currentStatus = order.status as OrderStatus;
    if (!canCancel(currentStatus)) {
      throw new BadRequestError(
        "ORDER_NOT_CANCELLABLE",
        `An order in status "${currentStatus}" can no longer be cancelled.`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.order.update({
        where: { id: orderId },
        data: { status: "cancelled" },
      });

      await tx.outboxEvent.create({
        data: {
          aggregateType: "Order",
          aggregateId: order.id,
          eventType: "OrderCancelled",
          eventVersion: 1,
          // userId added (Batch B) — see the other OrderCancelled write above for why.
          payload: {
            orderId: order.id,
            userId: order.userId,
            previousStatus: currentStatus,
            reason: reason ?? null,
          },
        },
      });

      return result;
    });

    await this.audit.record({
      actorId: requester.id,
      action: "order.cancel",
      targetType: "Order",
      targetId: order.id,
      reason,
      ipAddress: ctx.ipAddress,
      correlationId: ctx.correlationId,
    });

    return updated;
  }

  async listOrderHistory(userId: string) {
    return this.prisma.order.findMany({
      where: { userId, deletedAt: null },
      include: { subOrders: true },
      orderBy: { createdAt: "desc" },
    });
  }

  /** Exposed for completeness against Vol 2's state machine — not reachable via any
   *  HTTP endpoint in this pass (no downstream consumer to trigger it yet). */
  assertLegalTransition(from: OrderStatus, to: OrderStatus) {
    if (!canTransition(from, to)) {
      throw new BadRequestError(
        "ILLEGAL_ORDER_TRANSITION",
        `Cannot transition an order from "${from}" to "${to}".`,
      );
    }
  }
}
