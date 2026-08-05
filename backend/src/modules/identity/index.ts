// The ENTIRE public surface of the Identity module. Anything not exported here does
// not exist as far as the rest of the codebase is concerned (backend/docs/01).
export { IdentityModule } from "./identity.module";
export { IdentityPublicService } from "./public/identity.public-service";
export type { AccessTokenPayload } from "./domain/token.service";
