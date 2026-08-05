import { Injectable } from "@nestjs/common";

import { envSchema, type Env } from "./env.schema";

@Injectable()
export class AppConfigService {
  private readonly env: Env;

  constructor() {
    // The one and only place process.env is read directly (Vol 7, A2 / backend/docs/05).
    this.env = envSchema.parse(process.env);
  }

  get<K extends keyof Env>(key: K): Env[K] {
    return this.env[key];
  }
}
