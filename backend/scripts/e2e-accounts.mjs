// Creates throwaway accounts for the browser (Playwright) journeys, through the real API.
//
//   node scripts/e2e-accounts.mjs <label> <role,role,...>
//
// prints one JSON line, {"email": ..., "password": ...}, for an account that can log in through an
// app's login form. The label only makes the address recognisable.
//
// The one step that is not API-driven is role promotion: there is no public endpoint for it
// (backend/docs/05: role assignment is a dual-authorization operation, deferred), so the account is
// signed up as a customer and promoted directly with Prisma, with MFA marked as enabled because
// seller and admin logins are refused without it and nothing yet lets an account turn it on. That
// is the same test-only precondition as src/test-utils/promote-role.ts. Run it with backend/ as the
// working directory so @prisma/client resolves, and with DATABASE_URL pointing at the database the
// API is using.
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

export const API =
  process.env.E2E_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:4000/v1";

export async function call(method, path, { token, body } = {}) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`${method} ${path} failed with ${response.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

const digits = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join("");

/** Signs up a customer, then promotes it to `roles` (when they are more than customer). */
export async function createAccount(prisma, label, roles) {
  const email = `e2e-${label}-${Date.now()}-${digits(4)}@example.com`;
  // Generated per run and never stored: the account only exists for the duration of the suite.
  const password = `Aa1-${digits(12)}`;

  const signup = await call("POST", "/auth/signup", {
    body: {
      firstName: "E2E",
      lastName: label,
      email,
      phone: `+232${digits(10)}`,
      password,
      confirmPassword: password,
    },
  });

  if (roles.some((role) => role !== "customer")) {
    await prisma.user.update({
      where: { id: signup.data.user.id },
      data: { roles, mfaEnabled: true },
    });
  }
  return { email, password };
}

export async function loginToken(account) {
  const login = await call("POST", "/auth/login", { body: account });
  return login.data.accessToken;
}

async function cli() {
  const [label, roleList] = process.argv.slice(2);
  if (!label || !roleList) {
    throw new Error("usage: node scripts/e2e-accounts.mjs <label> <role,role,...>");
  }
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();
  try {
    const account = await createAccount(prisma, label, roleList.split(","));
    process.stdout.write(`${JSON.stringify(account)}\n`);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  cli().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
