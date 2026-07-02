import { z } from "zod";

export { z };

export const emailSchema = z.string().email();
export const phoneSchema = z.string().min(7);
export const urlSchema = z.string().url();
