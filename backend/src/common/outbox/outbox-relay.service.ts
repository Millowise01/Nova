import { Injectable, Logger, OnApplicationShutdown, OnModuleInit } from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service";

import type { OutboxEventHandler } from "./outbox-event-handler.interface";

const POLL_INTERVAL_MS = 500; // backend/docs/04-events-and-jobs.md's proposed interval
const BATCH_SIZE = 20;

interface OutboxRow {
  id: string;
  aggregate_type: string;
  aggregate_id: string;
  event_type: string;
  payload: unknown;
}

/**
 * The outbox relay — backend/docs/04-events-and-jobs.md describes this ("a lightweight
 * relay process that polls the outbox table and hands rows to subscribers") but no
 * relay/consumer existed anywhere in the codebase before this pass (confirmed: the
 * existing orders.integration.spec.ts explicitly asserted `publishedAt` stays null
 * with a comment saying so). This is that relay, built to the doc's own proposed
 * design — polling + `FOR UPDATE SKIP LOCKED` so a future multi-instance deployment
 * can run more than one relay safely without double-processing a row.
 *
 * Handlers register themselves via `registerHandler()` (called from each consuming
 * module's `onModuleInit`, e.g. NotificationsModule) rather than a DI multi-provider
 * token, because NestJS doesn't merge same-token providers into an array the way
 * Angular does — the last one registered would silently win instead. This keeps the
 * relay itself ignorant of which modules consume events, matching the "independent
 * subscribers" design the docs describe, without inventing a new dispatch mechanism.
 */
@Injectable()
export class OutboxRelayService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(OutboxRelayService.name);
  private readonly handlers: OutboxEventHandler[] = [];
  private timer?: ReturnType<typeof setInterval>;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.timer = setInterval(() => {
      this.processPendingEvents().catch((err: unknown) => {
        this.logger.error("Outbox relay poll failed", err instanceof Error ? err.stack : err);
      });
    }, POLL_INTERVAL_MS);
  }

  onApplicationShutdown() {
    if (this.timer) clearInterval(this.timer);
  }

  registerHandler(handler: OutboxEventHandler): void {
    this.handlers.push(handler);
  }

  /** Claims a batch of unpublished rows, dispatches each to every matching handler,
   *  and marks them published — all in one transaction, so a crash mid-batch never
   *  loses or double-publishes a row. Public (not just invoked by the interval above)
   *  so tests can call it directly instead of waiting on a real-time timer. Returns
   *  the number of rows processed. */
  async processPendingEvents(batchSize = BATCH_SIZE): Promise<number> {
    return this.prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<OutboxRow[]>`
        SELECT id, aggregate_type, aggregate_id, event_type, payload
        FROM outbox_events
        WHERE published_at IS NULL
        ORDER BY occurred_at ASC
        LIMIT ${batchSize}
        FOR UPDATE SKIP LOCKED
      `;

      for (const row of rows) {
        const matching = this.handlers.filter((h) => h.eventType === row.event_type);
        for (const handler of matching) {
          try {
            await handler.handle({
              aggregateType: row.aggregate_type,
              aggregateId: row.aggregate_id,
              payload: row.payload,
            });
          } catch (err) {
            // One failing handler must not block other handlers for the same row, other
            // rows in the batch, or the row still being marked published — a subscriber
            // that can't keep up is that subscriber's problem (retry/dead-letter is a
            // background-job concern per the docs, not built this pass), never a reason
            // to redeliver the event to every OTHER subscriber that already succeeded.
            this.logger.error(
              `Handler for "${row.event_type}" failed on outbox row ${row.id}`,
              err instanceof Error ? err.stack : err,
            );
          }
        }

        await tx.outboxEvent.update({
          where: { id: row.id },
          data: { publishedAt: new Date(), attempts: { increment: 1 } },
        });
      }

      return rows.length;
    });
  }
}
