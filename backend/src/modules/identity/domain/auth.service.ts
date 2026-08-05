import { Injectable } from "@nestjs/common";

import type { LoginInput, RegisterInput } from "@nova/validation";

import { AuditLogger, type RequestContext } from "../../../common/audit/audit-logger.service";
import { ConflictError, ForbiddenError, UnauthorizedError } from "../../../common/errors/api-error";
import { PrismaService } from "../../../prisma/prisma.service";

import { PasswordService } from "./crypto/password.service";
import { PiiCryptoService } from "./crypto/pii-crypto.service";
import { TokenService } from "./token.service";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthenticatedUser {
  id: string;
  roles: string[];
}

// Vol 3, B1: "required for seller and administrative accounts" — not customers.
const MFA_REQUIRED_ROLES = ["seller", "admin"];

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pii: PiiCryptoService,
    private readonly password: PasswordService,
    private readonly tokens: TokenService,
    private readonly audit: AuditLogger,
  ) {}

  async register(
    input: RegisterInput,
    ctx: RequestContext,
  ): Promise<{ user: AuthenticatedUser; tokens: AuthTokens }> {
    const emailHash = this.pii.hash(input.email);
    const existingEmail = await this.prisma.user.findUnique({ where: { emailHash } });
    if (existingEmail) {
      throw new ConflictError(
        "EMAIL_ALREADY_REGISTERED",
        "An account with this email already exists.",
      );
    }

    const phoneHash = this.pii.hash(input.phone);
    const existingPhone = await this.prisma.user.findUnique({ where: { phoneHash } });
    if (existingPhone) {
      throw new ConflictError(
        "PHONE_ALREADY_REGISTERED",
        "An account with this phone number already exists.",
      );
    }

    const passwordHash = await this.password.hash(input.password);

    const user = await this.prisma.user.create({
      data: {
        emailEncrypted: this.pii.encrypt(input.email),
        emailHash,
        phoneEncrypted: this.pii.encrypt(input.phone),
        phoneHash,
        roles: ["customer"],
        authFactors: {
          create: { type: "password", passwordHash },
        },
      },
    });

    await this.audit.record({
      actorId: user.id,
      action: "user.register",
      targetType: "User",
      targetId: user.id,
      ipAddress: ctx.ipAddress,
      correlationId: ctx.correlationId,
    });

    const tokens = await this.issueTokens(user.id, user.roles);
    return { user: { id: user.id, roles: user.roles }, tokens };
  }

  async login(
    input: LoginInput,
    ctx: RequestContext,
  ): Promise<{ user: AuthenticatedUser; tokens: AuthTokens }> {
    const emailHash = this.pii.hash(input.email);
    const user = await this.prisma.user.findUnique({
      where: { emailHash },
      include: { authFactors: { where: { type: "password", deletedAt: null } } },
    });

    const passwordFactor = user?.authFactors[0];
    // Deliberately identical failure path whether the user doesn't exist or the password
    // is wrong — a different error would let an attacker enumerate registered emails.
    if (!user || !passwordFactor?.passwordHash) {
      await this.audit.record({
        actorId: null,
        action: "user.login.failed",
        targetType: "User",
        reason: "invalid credentials",
        ipAddress: ctx.ipAddress,
        correlationId: ctx.correlationId,
      });
      throw new UnauthorizedError("INVALID_CREDENTIALS", "Email or password is incorrect.");
    }

    const valid = await this.password.verify(input.password, passwordFactor.passwordHash);
    if (!valid) {
      await this.audit.record({
        actorId: user.id,
        action: "user.login.failed",
        targetType: "User",
        targetId: user.id,
        reason: "invalid credentials",
        ipAddress: ctx.ipAddress,
        correlationId: ctx.correlationId,
      });
      throw new UnauthorizedError("INVALID_CREDENTIALS", "Email or password is incorrect.");
    }

    // MFA gate (Vol 3, B1) — mandatory for seller/admin, checked AFTER password
    // verification succeeds (never reveal whether MFA is the blocker to an attacker who
    // hasn't proven they know the password). The actual TOTP enrollment/challenge flow
    // is out of scope this pass; this is the enforcement point that starts working the
    // moment mfaEnabled can be set to true, without needing new code here.
    const requiresMfa = user.roles.some((role) => MFA_REQUIRED_ROLES.includes(role));
    if (requiresMfa && !user.mfaEnabled) {
      await this.audit.record({
        actorId: user.id,
        action: "user.login.blocked_mfa_required",
        targetType: "User",
        targetId: user.id,
        reason: `role(s) ${user.roles.join(",")} require MFA, not yet enabled`,
        ipAddress: ctx.ipAddress,
        correlationId: ctx.correlationId,
      });
      throw new ForbiddenError(
        "MFA_SETUP_REQUIRED",
        "This account's role requires multi-factor authentication to be enabled before logging in.",
      );
    }

    await this.audit.record({
      actorId: user.id,
      action: "user.login",
      targetType: "User",
      targetId: user.id,
      ipAddress: ctx.ipAddress,
      correlationId: ctx.correlationId,
    });

    const tokens = await this.issueTokens(user.id, user.roles);
    return { user: { id: user.id, roles: user.roles }, tokens };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const hash = this.tokens.hashRefreshToken(refreshToken);
    const session = await this.prisma.session.findUnique({ where: { refreshTokenHash: hash } });

    if (!session || session.revokedAt || session.deletedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedError(
        "INVALID_REFRESH_TOKEN",
        "This refresh token is invalid or has expired.",
      );
    }

    // Single-use rotation (backend/docs/05): revoke the presented token immediately,
    // regardless of what happens next, so it can never be replayed even if issuing the
    // new pair somehow fails after this point.
    await this.prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: session.userId } });
    return this.issueTokens(user.id, user.roles);
  }

  private async issueTokens(userId: string, roles: string[]): Promise<AuthTokens> {
    const accessToken = this.tokens.issueAccessToken({ sub: userId, roles });
    const { token: refreshToken, hash } = this.tokens.issueRefreshToken();

    await this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash: hash,
        expiresAt: this.tokens.refreshExpiryDate(),
      },
    });

    return { accessToken, refreshToken };
  }
}
