/** A single consumer of one outbox event type. Per backend/docs/04-events-and-jobs.md's
 *  "four independent subscribers" example — Notification, Analytics, Finance, and
 *  Sustainability would each register their own handlers for the same event type
 *  without knowing the others exist. Only Notification handlers exist in this pass;
 *  the shape is general so a future consumer registers the same way, not a new
 *  dispatch mechanism. */
export interface OutboxEventHandler {
  readonly eventType: string;
  handle(event: OutboxEventPayload): Promise<void>;
}

export interface OutboxEventPayload {
  aggregateType: string;
  aggregateId: string;
  payload: unknown;
}
