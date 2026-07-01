import { environmentSchema } from "@nova/validation";

export function getEnvironment(env: NodeJS.ProcessEnv = process.env) {
  return environmentSchema.parse(env);
}