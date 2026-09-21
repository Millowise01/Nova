import { randomInt, randomUUID } from "node:crypto";
import type { Server } from "node:http";

import type { INestApplication } from "@nestjs/common";
import request from "supertest";

import type { PrismaService } from "../prisma/prisma.service";

import { promoteRole } from "./promote-role";

export const TEST_PASSWORD = "correct-horse-battery-staple";

/** Ten random digits (10^10 values). The integration tests run against a database that is
 *  never cleaned, so users accumulate across runs; the older generators drew from 65,536
 *  values (a prefix plus four hex characters) or 900,000, and a signup that collided with an
 *  existing user got a 409 PHONE_ALREADY_REGISTERED that broke the helper. */
export function uniqueTestPhone(): string {
  return `+232${String(randomInt(0, 10_000_000_000)).padStart(10, "0")}`;
}

/** The prefix names the test that made the user, so it can be found in a failing run. */
export function uniqueTestEmail(prefix: string): string {
  return `${prefix}-${randomUUID().slice(0, 8)}@example.test`;
}

export interface TestCredentials {
  email: string;
  phone: string;
  password: string;
}

/** The parts of the signup response the helpers read: the success payload or the error code. */
interface SignupBody {
  data?: { accessToken: string; user: { id: string } };
  error?: { code?: string };
}

interface SignupAttemptResult {
  status: number;
  body: SignupBody;
}

/** Nest types the underlying server as `any`; give it its real type once, here. */
function httpServer(app: INestApplication): Server {
  return app.getHttpServer() as Server;
}

const COLLISION_CODES = ["PHONE_ALREADY_REGISTERED", "EMAIL_ALREADY_REGISTERED"];

/**
 * Signs a user up, retrying ONLY when the random test data collides with an existing user
 * (409 with a phone/email conflict code) and giving up after `maxAttempts`. Any other
 * failure throws immediately, with the status and the response body in the message, instead
 * of surfacing later as "Cannot read properties of undefined" somewhere else in the test.
 */
export async function signUpWithRetry(
  attempt: (credentials: TestCredentials) => Promise<SignupAttemptResult>,
  maxAttempts = 5,
  prefix = "user",
): Promise<{ credentials: TestCredentials; response: SignupAttemptResult }> {
  let last: SignupAttemptResult | undefined;
  for (let n = 1; n <= maxAttempts; n++) {
    const credentials: TestCredentials = {
      email: uniqueTestEmail(prefix),
      phone: uniqueTestPhone(),
      password: TEST_PASSWORD,
    };
    const response = await attempt(credentials);
    if (response.status === 201) return { credentials, response };

    last = response;
    const code = response.body?.error?.code;
    const isCollision =
      response.status === 409 && code !== undefined && COLLISION_CODES.includes(code);
    if (!isCollision) {
      throw new Error(
        `Test signup failed for "${prefix}" (status ${response.status}): ${JSON.stringify(response.body)}`,
      );
    }
  }
  throw new Error(
    `Test signup for "${prefix}" collided with existing users on all ${maxAttempts} attempts (status ${last?.status}): ${JSON.stringify(last?.body)}`,
  );
}

export interface TestUser extends TestCredentials {
  token: string;
  userId: string;
}

/** Signs up a customer and returns their access token. */
export async function signUpTestUser(app: INestApplication, prefix: string): Promise<TestUser> {
  const { credentials, response } = await signUpWithRetry(
    (c) =>
      request(httpServer(app)).post("/v1/auth/signup").send({
        firstName: prefix,
        lastName: "Test",
        email: c.email,
        phone: c.phone,
        password: c.password,
        confirmPassword: c.password,
      }),
    5,
    prefix,
  );
  const data = response.body.data;
  if (!data) {
    throw new Error(
      `Test signup for "${prefix}" returned 201 without data: ${JSON.stringify(response.body)}`,
    );
  }
  return { ...credentials, token: data.accessToken, userId: data.user.id };
}

/** Signs up a user and, when roles are given, promotes them (there is no API for that) and
 *  logs in again so the token carries the new roles. */
export async function signUpAndPromote(
  app: INestApplication,
  prisma: PrismaService,
  prefix: string,
  roles: string[],
): Promise<TestUser> {
  const user = await signUpTestUser(app, prefix);
  if (roles.length === 0) return user;

  await promoteRole(prisma, user.userId, ["customer", ...roles]);
  const login = await request(httpServer(app))
    .post("/v1/auth/login")
    .send({ email: user.email, password: user.password });
  if (login.status !== 200) {
    throw new Error(
      `Test login after promotion failed for "${prefix}" (status ${login.status}): ${JSON.stringify(login.body)}`,
    );
  }
  const body = login.body as { data?: { accessToken: string } };
  if (!body.data) {
    throw new Error(
      `Test login for "${prefix}" returned 200 without data: ${JSON.stringify(login.body)}`,
    );
  }
  return { ...user, token: body.data.accessToken };
}
