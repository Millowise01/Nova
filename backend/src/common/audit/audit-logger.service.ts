import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service";

/** Request context threaded down from a controller purely for audit logging (Vol 3,
 *  E1's "source context" and "correlation ID" fields) — never used for authorization
 *  decisions. Lives here, not in any one module, since every module's controllers need
 *  it identically; putting it in e.g. Identity would make every other module import
 *  from Identity's internals just for this shape. */
export interface RequestContext {
  ipAddress?: string;
  correlationId: string;
}

/** Vol 3, E1's seven required fields. Timestamp is deliberately NOT a parameter here —
 *  it's always server-generated (Prisma's `@default(now())`), never client-supplied,
 *  per the standard's explicit requirement. */
export interface AuditEntry {
  actorId: string | null;
  action: string;
  targetType: string;
  targetId?: string;
  reason?: string;
  ipAddress?: string;
  correlationId: string;
}

/**
 * The one place every module writes audit records — Vol 3, E1, stood up now per
 * backend/docs/05-security-baseline.md's proposed resolution (a thin, always-available
 * writer ahead of the rest of Trust & Safety, which owns the full AuditLog schema
 * long-term but doesn't exist yet). No update/delete method exists on this class —
 * that's what makes the "append-only, never edited or deleted" guarantee true in this
 * codebase specifically, not just a documented intention.
 */
@Injectable()
export class AuditLogger {
  constructor(private readonly prisma: PrismaService) {}

  async record(entry: AuditEntry): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        actorId: entry.actorId,
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId,
        reason: entry.reason,
        ipAddress: entry.ipAddress,
        correlationId: entry.correlationId,
      },
    });
  }
}
