import { z } from "zod";

export const sessionSchema = z.object({
  userId: z.string().min(1),
  roles: z.array(z.string()).default([]),
  expiresAt: z.string().datetime()
});

export type Session = z.infer<typeof sessionSchema>;