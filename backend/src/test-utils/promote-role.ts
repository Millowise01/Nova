import type { PrismaService } from "../prisma/prisma.service";

/**
 * Test-only helper: directly promotes a user's roles via Prisma, bypassing the API.
 * There is no self-service "become a seller/admin" endpoint — role assignment is one
 * of Vol 3, B4's dual-authorization-gated sensitive operations, deferred to Phase 2+
 * (backend/docs/08-security-implementation-checklist.md). Tests that need a seller or
 * admin actor promote a freshly-signed-up (customer-role) user directly, which is the
 * correct way to set up a precondition the API doesn't yet expose — not a workaround
 * for a bug.
 */
export async function promoteRole(
  prisma: PrismaService,
  userId: string,
  roles: string[],
  options: { mfaEnabled?: boolean } = {},
) {
  // Defaults to true for seller/admin so tests exercising OTHER behavior (permissions,
  // ownership, etc.) aren't incidentally blocked by the MFA gate — that gate has its
  // own dedicated test (see identity.integration.spec.ts's MFA describe block), which
  // explicitly sets mfaEnabled: false to prove the block happens.
  const requiresMfa = roles.some((role) => ["seller", "admin"].includes(role));
  const mfaEnabled = options.mfaEnabled ?? requiresMfa;
  await prisma.user.update({ where: { id: userId }, data: { roles, mfaEnabled } });
}
