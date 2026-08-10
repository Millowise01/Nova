import { Global, Module } from "@nestjs/common";

import { OutboxRelayService } from "./outbox-relay.service";

@Global()
@Module({
  providers: [OutboxRelayService],
  exports: [OutboxRelayService],
})
export class OutboxModule {}
