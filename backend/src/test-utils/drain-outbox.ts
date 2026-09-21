import type { OutboxRelayService } from "../common/outbox/outbox-relay.service";
import type { PrismaService } from "../prisma/prisma.service";

export interface DrainOutboxOptions {
  /** How long to wait for in-flight events before failing. */
  timeoutMs?: number;
  /** How long to pause between checks while events are still in flight. */
  pollMs?: number;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Waits until every outbox event has been handled, so a test can read the result of an
 * event consumer (a notification, a ledger entry) without racing it.
 *
 * The completion condition is "no unpublished rows remain", NOT "processPendingEvents()
 * returned 0". The relay claims rows with FOR UPDATE SKIP LOCKED inside a transaction and
 * sets published_at only when that transaction commits, after the handlers have run. While
 * the app's own background poll has rows in flight, a second call skips them and returns 0
 * although their handlers have not finished; stopping there is the race this helper
 * replaces (see backend/docs/06-testing-strategy.md and drain-outbox.integration.spec.ts).
 *
 * If the outbox cannot be drained before the timeout it throws, naming the stuck rows,
 * instead of returning early and letting the test fail somewhere confusing later.
 */
export async function drainOutbox(
  deps: { relay: OutboxRelayService; prisma: PrismaService },
  { timeoutMs = 10_000, pollMs = 25 }: DrainOutboxOptions = {},
): Promise<void> {
  const { relay, prisma } = deps;
  const deadline = Date.now() + timeoutMs;

  for (;;) {
    let processed: number;
    do {
      processed = await relay.processPendingEvents(200);
    } while (processed > 0);

    const unpublished = await prisma.outboxEvent.findMany({
      where: { publishedAt: null },
      select: { eventType: true, aggregateId: true },
      take: 10,
    });
    if (unpublished.length === 0) return;

    if (Date.now() >= deadline) {
      throw new Error(
        `Outbox not drained after ${timeoutMs} ms; still unpublished: ${JSON.stringify(unpublished)}`,
      );
    }
    await sleep(pollMs);
  }
}
