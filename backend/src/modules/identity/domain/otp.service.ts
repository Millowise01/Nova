import { createHash, randomInt } from "node:crypto";

import { Injectable, Logger } from "@nestjs/common";

import { BadRequestError } from "../../../common/errors/api-error";
import { PrismaService } from "../../../prisma/prisma.service";

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(private readonly prisma: PrismaService) {}

  async requestOtp(destination: string): Promise<void> {
    const code = randomInt(0, 10 ** OTP_LENGTH)
      .toString()
      .padStart(OTP_LENGTH, "0");
    const destinationHash = this.hash(destination);
    const codeHash = this.hash(code);

    await this.prisma.otpCode.create({
      data: {
        destinationHash,
        codeHash,
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60_000),
      },
    });

    // TODO: wire real SMS provider (Volume 5) at this integration point. In development
    // (and in this pass — there is no Volume 5 integration yet), the code is only ever
    // logged, never actually sent, per the confirmed decision for this implementation pass.
    this.logger.debug(
      `[OTP STUB] code for ${destination}: ${code} (expires in ${OTP_EXPIRY_MINUTES}m)`,
    );
  }

  async verifyOtp(destination: string, code: string): Promise<void> {
    const destinationHash = this.hash(destination);
    const codeHash = this.hash(code);

    const record = await this.prisma.otpCode.findFirst({
      where: { destinationHash, codeHash, consumedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      throw new BadRequestError(
        "OTP_INVALID_OR_EXPIRED",
        "The OTP code is invalid or has expired.",
      );
    }

    await this.prisma.otpCode.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    });
  }

  private hash(value: string): string {
    return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
  }
}
