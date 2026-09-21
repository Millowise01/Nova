import { randomUUID } from "node:crypto";

import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";

import { AppModule } from "../app.module";
import { OutboxRelayService } from "../common/outbox/outbox-relay.service";
import { PrismaService } from "../prisma/prisma.service";

import { createTestApp } from "./create-test-app";
import { drainOutbox } from "./drain-outbox";

const PROBE = "DrainHelperProbe";
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * The synchronization contract between the outbox relay and a test that wants "all events
 * have been handled": the relay claims rows with FOR UPDATE SKIP LOCKED inside one
 * transaction, handlers write on their own connections, and published_at is set only when
 * that transaction commits — after the handlers have run. So a row stays unpublished, and
 * locked, for exactly as long as a poll is still handling it, and "no unpublished rows
 * remain" is the completion condition. `processPendingEvents()` returning 0 is NOT: it also
 * returns 0 while another poll (the app's own background tick) holds the rows.
 */
describe("drainOutbox test helper (integration)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let relay: OutboxRelayService;
  const handled: string[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = await createTestApp(moduleRef);
    prisma = app.get(PrismaService);
    relay = app.get(OutboxRelayService);
    // A deliberately slow consumer, so a poll stays "in flight" long enough to observe.
    relay.registerHandler({
      eventType: PROBE,
      handle: async (event) => {
        await sleep(300);
        handled.push(event.aggregateId);
      },
    });
    await drainOutbox({ relay, prisma }); // start from an empty outbox
  });

  afterAll(async () => {
    await drainOutbox({ relay, prisma });
    await app.close();
  });

  function insertProbeEvent() {
    return prisma.outboxEvent.create({
      data: {
        aggregateType: "probe",
        aggregateId: randomUUID(),
        eventType: PROBE,
        eventVersion: 1,
        payload: {},
      },
    });
  }

  it("documents the race: while a poll has the row in flight, processPendingEvents returns 0 and the row is still unpublished", async () => {
    const event = await insertProbeEvent();
    const inFlight = relay.processPendingEvents(); // claims the row; the handler sleeps 300 ms
    await sleep(75);

    const naive = await relay.processPendingEvents(200); // SKIP LOCKED: sees nothing to claim
    expect(naive).toBe(0);
    const row = await prisma.outboxEvent.findUnique({ where: { id: event.id } });
    expect(row?.publishedAt).toBeNull();
    expect(handled).not.toContain(event.aggregateId);

    await inFlight;
    await drainOutbox({ relay, prisma });
  });

  it("waits for an in-flight poll to finish instead of returning early", async () => {
    const event = await insertProbeEvent();
    const inFlight = relay.processPendingEvents();
    await sleep(75);

    await drainOutbox({ relay, prisma });

    expect(handled).toContain(event.aggregateId);
    const row = await prisma.outboxEvent.findUnique({ where: { id: event.id } });
    expect(row?.publishedAt).not.toBeNull();
    await inFlight;
  });

  it("returns promptly when there is nothing to drain", async () => {
    const started = Date.now();
    await drainOutbox({ relay, prisma });
    expect(Date.now() - started).toBeLessThan(1000);
  });

  it("fails loudly, naming the unpublished rows, when the outbox cannot be drained in time", async () => {
    const event = await insertProbeEvent();
    // Another transaction holds the row locked for longer than the helper will wait.
    const holder = prisma.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT id FROM outbox_events WHERE id = ${event.id} FOR UPDATE`;
        await sleep(600);
      },
      { timeout: 5000 },
    );
    await sleep(75);

    await expect(drainOutbox({ relay, prisma }, { timeoutMs: 200, pollMs: 20 })).rejects.toThrow(
      new RegExp(`not drained.*${PROBE}.*${event.aggregateId}`),
    );

    await holder;
    await drainOutbox({ relay, prisma }); // once the lock is released the row is processed
    const row = await prisma.outboxEvent.findUnique({ where: { id: event.id } });
    expect(row?.publishedAt).not.toBeNull();
  });
});
