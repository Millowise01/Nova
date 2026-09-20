import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import {
  addCartLineSchema,
  checkoutSchema,
  type AddCartLineInput,
  type CheckoutFormValues,
} from "@nova/validation";

import type { AuthenticatedRequest } from "../../../common/guards/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../../../common/guards/optional-jwt-auth.guard";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { CartService } from "../domain/cart.service";
import { CheckoutService } from "../domain/checkout.service";

@ApiTags("cart-checkout")
@Controller()
export class CartController {
  constructor(
    private readonly cart: CartService,
    private readonly checkout: CheckoutService,
  ) {}

  @Post("cart")
  @UseGuards(OptionalJwtAuthGuard)
  async createCart(@Req() req: Partial<AuthenticatedRequest>) {
    const result = await this.cart.createCart(req.user?.sub ?? null);
    return { data: result };
  }

  // The three routes below take OptionalJwtAuthGuard so a caller is identified when a
  // token is present; CartService.getActiveCartOrThrow then enforces ownership for carts
  // that have an owner, while guest carts stay usable by whoever holds the cart ID.
  @Get("cart/:cartId")
  @UseGuards(OptionalJwtAuthGuard)
  async getCart(@Param("cartId") cartId: string, @Req() req: Partial<AuthenticatedRequest>) {
    const cart = await this.cart.getCart(cartId, req.user?.sub ?? null);
    return { data: cart };
  }

  @Post("cart/:cartId/lines")
  @UseGuards(OptionalJwtAuthGuard)
  async addLine(
    @Param("cartId") cartId: string,
    @Body(new ZodValidationPipe(addCartLineSchema)) body: AddCartLineInput,
    @Req() req: Partial<AuthenticatedRequest>,
  ) {
    const line = await this.cart.addLine(cartId, body, req.user?.sub ?? null);
    return { data: line };
  }

  @Post("carts/:cartId/checkout/session")
  @UseGuards(OptionalJwtAuthGuard)
  async createCheckoutSession(
    @Param("cartId") cartId: string,
    @Body(new ZodValidationPipe(checkoutSchema)) body: CheckoutFormValues,
    @Req() req: Partial<AuthenticatedRequest>,
  ) {
    const session = await this.checkout.createSession(cartId, body, req.user?.sub ?? null);
    return { data: session };
  }
}
