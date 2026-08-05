import { Injectable, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";

import { AppConfigService } from "../../config/config.service";

@Injectable()
export class RedisService implements OnModuleDestroy {
  readonly client: Redis;

  constructor(config: AppConfigService) {
    this.client = new Redis(config.get("REDIS_URL"), { lazyConnect: false });
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
