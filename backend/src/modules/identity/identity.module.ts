import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { AuthService } from "./domain/auth.service";
import { PasswordService } from "./domain/crypto/password.service";
import { PiiCryptoService } from "./domain/crypto/pii-crypto.service";
import { OtpService } from "./domain/otp.service";
import { ProfileService } from "./domain/profile.service";
import { TokenService } from "./domain/token.service";
import { AuthController } from "./http/auth.controller";
import { MeController } from "./http/me.controller";
import { IdentityPublicService } from "./public/identity.public-service";

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController, MeController],
  providers: [
    AuthService,
    OtpService,
    TokenService,
    PasswordService,
    PiiCryptoService,
    ProfileService,
    IdentityPublicService,
  ],
  exports: [IdentityPublicService],
})
export class IdentityModule {}
