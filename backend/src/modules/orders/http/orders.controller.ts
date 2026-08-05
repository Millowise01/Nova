import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import {
  cancelOrderSchema,
  createOrderSchema,
  type CancelOrderInput,
  type CreateOrderInput,
} from "@nova/validation";

import { BadRequestError } from "../../../common/errors/api-error";
import { JwtAuthGuard, type AuthenticatedRequest } from "../../../common/guards/jwt-auth.guard";
import type { RequestWithCorrelationId } from "../../../common/middleware/correlation-id.middleware";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { RateLimit } from "../../../common/rate-limit/rate-limit.decorator";
import { RateLimitGuard } from "../../../common/rate-limit/rate-limit.guard";
import { OrdersService } from "../domain/orders.service";

type OrdersRequest = AuthenticatedRequest & RequestWithCorrelationId;

@ApiTags("orders")
@Controller("orders")
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RateLimitGuard)
  @RateLimit(20, 60) // Vol 3, C4 names "checkout attempts" explicitly
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @Req() req: OrdersRequest,
    @Headers("idempotency-key") idempotencyKey: string | undefined,
    @Body(new ZodValidationPipe(createOrderSchema)) body: CreateOrderInput,
  ) {
    if (!idempotencyKey) {
      throw new BadRequestError(
        "IDEMPOTENCY_KEY_REQUIRED",
        "The Idempotency-Key header is required for this endpoint.",
      );
    }
    const result = await this.orders.createOrder(
      idempotencyKey,
      body,
      body.checkoutSessionId,
      req.user.sub,
      { ipAddress: req.ip, correlationId: req.correlationId },
    );
    return result.body;
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  async getOrder(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    const order = await this.orders.getOrder(id, { id: req.user.sub, roles: req.user.roles });
    return { data: order };
  }

  @Patch(":id/cancel")
  @UseGuards(JwtAuthGuard)
  async cancelOrder(
    @Req() req: OrdersRequest,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(cancelOrderSchema)) body: CancelOrderInput,
  ) {
    const order = await this.orders.cancelOrder(
      id,
      { id: req.user.sub, roles: req.user.roles },
      { ipAddress: req.ip, correlationId: req.correlationId },
      body.reason,
    );
    return { data: order };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async listOrders(@Req() req: AuthenticatedRequest) {
    const orders = await this.orders.listOrderHistory(req.user.sub);
    return { data: orders };
  }
}
