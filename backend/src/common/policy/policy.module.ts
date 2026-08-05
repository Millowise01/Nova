import { Global, Module } from "@nestjs/common";

import { AbilityFactory } from "./ability.factory";
import { PolicyGuard } from "./policy.guard";

@Global()
@Module({
  providers: [AbilityFactory, PolicyGuard],
  exports: [AbilityFactory, PolicyGuard],
})
export class PolicyModule {}
