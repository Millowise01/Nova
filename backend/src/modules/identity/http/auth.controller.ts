import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import {
  loginSchema,
  registerSchema,
  otpRequestSchema,
  otpVerifySchema,
  refreshTokenSchema,
  type LoginInput,
  type RegisterInput,
  type OtpRequestInput,
  type OtpVerifyInput,
  type RefreshTokenInput,
} from "@nova/validation";

import type { RequestWithCorrelationId } from "../../../common/middleware/correlation-id.middleware";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { RateLimit } from "../../../common/rate-limit/rate-limit.decorator";
import { RateLimitGuard } from "../../../common/rate-limit/rate-limit.guard";
import { AuthService } from "../domain/auth.service";
import { OtpService } from "../domain/otp.service";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly otp: OtpService,
  ) {}

  @Post("signup")
  @UseGuards(RateLimitGuard)
  @RateLimit(20, 60) // Vol 3, C1 — coarse abuse protection on account creation
  async signup(
    @Req() req: RequestWithCorrelationId,
    @Body(new ZodValidationPipe(registerSchema)) body: RegisterInput,
  ) {
    const { user, tokens } = await this.auth.register(body, {
      ipAddress: req.ip,
      correlationId: req.correlationId,
    });
    return { data: { user, ...tokens } };
  }

  @Post("login")
  @UseGuards(RateLimitGuard)
  // 30/60s: still a real anti-brute-force bound (combined with bcrypt's inherent cost
  // per attempt), per Vol 3, C4's explicit call-out of login as needing this control.
  @RateLimit(30, 60)
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req: RequestWithCorrelationId,
    @Body(new ZodValidationPipe(loginSchema)) body: LoginInput,
  ) {
    const { user, tokens } = await this.auth.login(body, {
      ipAddress: req.ip,
      correlationId: req.correlationId,
    });
    return { data: { user, ...tokens } };
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(@Body(new ZodValidationPipe(refreshTokenSchema)) body: RefreshTokenInput) {
    const tokens = await this.auth.refresh(body.refreshToken);
    return { data: tokens };
  }

  @Post("otp")
  @UseGuards(RateLimitGuard)
  @RateLimit(5, 60) // Vol 3, C4 names OTP requests explicitly as needing rate limiting
  @HttpCode(HttpStatus.ACCEPTED)
  async requestOtp(@Body(new ZodValidationPipe(otpRequestSchema)) body: OtpRequestInput) {
    await this.otp.requestOtp(body.destination);
    // Never echo the code back — even in this stubbed pass, the response shape should
    // match what a real SMS-backed implementation would return.
    return { data: { status: "sent" } };
  }

  @Post("otp/verify")
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body(new ZodValidationPipe(otpVerifySchema)) body: OtpVerifyInput) {
    await this.otp.verifyOtp(body.destination, body.code);
    return { data: { status: "verified" } };
  }
}
