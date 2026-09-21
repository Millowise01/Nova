import { execFileSync } from "node:child_process";
import path from "node:path";

/**
 * Creates the test accounts before the suite runs: an admin, and a customer with no admin role (for
 * the wrong-role checks). Both are signed up through the real backend; the admin is then promoted
 * (roles + mfaEnabled) directly with Prisma, since there is no self-service way to become an admin
 * (backend/docs/05: role assignment is a dual-authorization operation, deferred) and admin login
 * requires MFA that nothing yet lets an account turn on.
 *
 * The work is done by backend/scripts/e2e-accounts.mjs, run with `backend/` as its cwd so
 * `@prisma/client` resolves from the backend workspace member's own node_modules (apps/admin has no
 * Prisma dependency, on purpose). It needs DATABASE_URL to point at the API's database.
 */
const BACKEND_DIR = path.resolve(__dirname, "../../../backend");

interface Account {
  email: string;
  password: string;
}

function createAccount(label: string, roles: string[]): Account {
  const output = execFileSync(
    process.execPath,
    ["scripts/e2e-accounts.mjs", label, roles.join(",")],
    { cwd: BACKEND_DIR, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
  );
  const line = output.trim().split("\n").pop() ?? "";
  return JSON.parse(line) as Account;
}

function globalSetup() {
  const admin = createAccount("admin", ["customer", "admin"]);
  process.env.ADMIN_E2E_EMAIL = admin.email;
  process.env.ADMIN_E2E_PASSWORD = admin.password;

  const customer = createAccount("customer", ["customer"]);
  process.env.E2E_CUSTOMER_EMAIL = customer.email;
  process.env.E2E_CUSTOMER_PASSWORD = customer.password;
}

export default globalSetup;
