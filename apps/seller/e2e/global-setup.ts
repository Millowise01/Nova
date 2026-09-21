import { execFileSync } from "node:child_process";
import path from "node:path";

/**
 * Creates the test accounts before the suite runs: a seller, and a customer with no seller role
 * (for the wrong-role checks). Both are signed up through the real backend; the seller is then
 * promoted (roles + mfaEnabled) directly with Prisma, since there's no self-service seller signup
 * or MFA-enrollment flow at all (POST /v1/auth/signup hardcodes roles: ["customer"]; backend/docs/05's
 * own disclosed "MFA enrollment bootstrap problem": seller/admin login requires MFA but nothing lets
 * an account turn it on through the API).
 *
 * The work is done by backend/scripts/e2e-accounts.mjs, run with `backend/` as its cwd so
 * `@prisma/client` resolves from the backend workspace member's own node_modules: apps/seller has
 * no Prisma dependency of its own, on purpose (it only ever talks to the backend over HTTP, same as
 * every other frontend app in this repo). It needs DATABASE_URL to point at the API's database.
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
  const seller = createAccount("seller", ["customer", "seller"]);
  process.env.SELLER_E2E_EMAIL = seller.email;
  process.env.SELLER_E2E_PASSWORD = seller.password;

  const customer = createAccount("customer", ["customer"]);
  process.env.E2E_CUSTOMER_EMAIL = customer.email;
  process.env.E2E_CUSTOMER_PASSWORD = customer.password;
}

export default globalSetup;
