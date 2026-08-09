import { Injectable } from "@nestjs/common";

import type { UpdateMeInput } from "@nova/validation";

import { NotFoundError } from "../../../common/errors/api-error";
import { PrismaService } from "../../../prisma/prisma.service";

import { PiiCryptoService } from "./crypto/pii-crypto.service";

export interface MeProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  locale: string;
  roles: string[];
  countryCode: string;
  createdAt: Date;
}

/**
 * Backs GET/PATCH /v1/me. Deliberately its own small service rather than folded into
 * AuthService — AuthService owns auth flows (register/login/refresh); this owns the
 * "view/edit my own profile" concern, which is a different lifecycle (no tokens, no
 * password, no audit-worthy security event on every call).
 *
 * PATCH /v1/me is scoped to name/locale only (confirmed decision) — email/phone
 * changes need their own verify-then-change flow (propose new value, confirm via
 * OTP, then swap), which doesn't exist yet and isn't guessed at here.
 */
@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pii: PiiCryptoService,
  ) {}

  async getMe(userId: string): Promise<MeProfile> {
    const user = await this.prisma.user.findFirst({ where: { id: userId, deletedAt: null } });
    if (!user) throw new NotFoundError("USER_NOT_FOUND", "No user found for this ID.");
    return this.toProfile(user);
  }

  async updateMe(userId: string, input: UpdateMeInput): Promise<MeProfile> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.locale !== undefined ? { locale: input.locale } : {}),
      },
    });
    return this.toProfile(user);
  }

  private toProfile(user: {
    id: string;
    name: string | null;
    emailEncrypted: string;
    phoneEncrypted: string | null;
    locale: string;
    roles: string[];
    countryCode: string;
    createdAt: Date;
  }): MeProfile {
    return {
      id: user.id,
      name: user.name,
      email: this.pii.decrypt(user.emailEncrypted),
      phone: user.phoneEncrypted ? this.pii.decrypt(user.phoneEncrypted) : null,
      locale: user.locale,
      roles: user.roles,
      countryCode: user.countryCode,
      createdAt: user.createdAt,
    };
  }
}
