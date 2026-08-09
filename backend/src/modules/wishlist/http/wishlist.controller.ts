import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { addWishlistItemSchema, type AddWishlistItemInput } from "@nova/validation";

import { JwtAuthGuard, type AuthenticatedRequest } from "../../../common/guards/jwt-auth.guard";
import type { RequestWithCorrelationId } from "../../../common/middleware/correlation-id.middleware";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { WishlistService } from "../domain/wishlist.service";

type WishlistRequest = AuthenticatedRequest & RequestWithCorrelationId;

@ApiTags("wishlist")
@Controller("wishlist")
export class WishlistController {
  constructor(private readonly wishlist: WishlistService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getWishlist(@Req() req: AuthenticatedRequest) {
    const wishlist = await this.wishlist.getWishlist(req.user.sub);
    return { data: wishlist };
  }

  @Post("items")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async addItem(
    @Req() req: WishlistRequest,
    @Body(new ZodValidationPipe(addWishlistItemSchema)) body: AddWishlistItemInput,
  ) {
    const item = await this.wishlist.addItem(req.user.sub, body, {
      ipAddress: req.ip,
      correlationId: req.correlationId,
    });
    return { data: item };
  }

  @Delete("items/:itemId")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItem(@Req() req: WishlistRequest, @Param("itemId") itemId: string) {
    await this.wishlist.removeItem(
      itemId,
      { id: req.user.sub, roles: req.user.roles },
      {
        ipAddress: req.ip,
        correlationId: req.correlationId,
      },
    );
  }
}
