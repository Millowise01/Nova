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

  @Get("cart/:cartId")
  async getCart(@Param("cartId") cartId: string) {
    const cart = await this.cart.getCart(cartId);
    return { data: cart };
  }

  @Post("cart/:cartId/lines")
  async addLine(
    @Param("cartId") cartId: string,
    @Body(new ZodValidationPipe(addCartLineSchema)) body: AddCartLineInput,
  ) {
    const line = await this.cart.addLine(cartId, body);
    return { data: line };
  }

  @Post("carts/:cartId/checkout/session")
  async createCheckoutSession(
    @Param("cartId") cartId: string,
    @Body(new ZodValidationPipe(checkoutSchema)) body: CheckoutFormValues,
  ) {
    const session = await this.checkout.createSession(cartId, body);
    return { data: session };
  }
}
