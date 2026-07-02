import { sessionSchema, type Session } from "@nova/auth";

export async function getSession(): Promise<Session | null> {
  const mock = {
    userId: "guest-user",
    roles: ["customer"],
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
  };

  return sessionSchema.parse(mock);
}
