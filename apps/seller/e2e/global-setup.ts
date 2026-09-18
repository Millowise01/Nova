import { execFileSync } from "node:child_process";
import path from "node:path";

/**
 * Creates a fresh seller test account before the suite runs, the same way
 * this was done by hand while building S-2/S-3/S-4: sign up through the real
 * backend, then promote roles + mfaEnabled directly via Prisma (mirroring
 * backend/test-utils/promote-role.ts's existing test-only pattern) since
 * there's no self-service seller signup or MFA-enrollment flow at all
 * (POST /v1/auth/signup hardcodes roles: ["customer"]; backend/docs/05's own
 * disclosed "MFA enrollment bootstrap problem" — seller/admin login requires
 * MFA but nothing lets an account turn it on through the API).
 *
 * The promotion script runs with `backend/` as its cwd so `@prisma/client`
 * resolves from the backend workspace member's own node_modules — apps/seller
 * has no Prisma dependency of its own, on purpose (it only ever talks to the
 * backend over HTTP, same as every other frontend app in this repo).
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/v1";
const BACKEND_DIR = path.resolve(__dirname, "../../../backend");

export interface SellerTestAccount {
  email: string;
  password: string;
}

async function globalSetup() {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const email = `seller-e2e-${unique}@example.com`;
  const password = "password123";

  const signupResponse = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: "Seller",
      lastName: "E2E",
      email,
      // The LAST 8 digits of Date.now() (not the first — those barely change
      // between fast successive runs, which collided on a real 409 duplicate-
      // phone conflict while building this) plus the random suffix for
      // entropy between two runs started in the same millisecond.
      phone: `+2327${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`,
      password,
      confirmPassword: password,
    }),
  });

  if (!signupResponse.ok) {
    throw new Error(`Seller E2E setup: signup failed with ${signupResponse.status}`);
  }

  const { data } = (await signupResponse.json()) as { data: { user: { id: string } } };

  execFileSync(
    process.execPath,
    [
      "-e",
      `
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      prisma.user.update({
        where: { id: '${data.user.id}' },
        data: { roles: ['customer', 'seller'], mfaEnabled: true },
      }).then(() => prisma.$disconnect());
      `,
    ],
    { cwd: BACKEND_DIR, stdio: "inherit" },
  );

  process.env.SELLER_E2E_EMAIL = email;
  process.env.SELLER_E2E_PASSWORD = password;
}

export default globalSetup;
