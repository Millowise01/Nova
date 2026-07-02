import { z } from "zod";

export const environmentSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.string().min(2)
});

export type Environment = z.infer<typeof environmentSchema>;

export function getEnvironment(env: NodeJS.ProcessEnv = process.env): Environment {
  return environmentSchema.parse(env);
}
