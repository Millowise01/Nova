import { Controller, Get, Res, UseGuards } from "@nestjs/common";
import { PrometheusController } from "@willsoto/nestjs-prometheus";
import type { Response } from "express";

import { MetricsAuthGuard } from "./metrics-auth.guard";

/** The stock PrometheusController serves /metrics to anyone. Extending it is the
 *  library's documented way to add auth — the guard is the only difference. */
@Controller()
@UseGuards(MetricsAuthGuard)
export class ProtectedMetricsController extends PrometheusController {
  @Get()
  index(@Res({ passthrough: true }) response: Response): Promise<string> {
    return super.index(response);
  }
}
