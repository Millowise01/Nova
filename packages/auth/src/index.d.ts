import { z } from "zod";
export declare const sessionSchema: z.ZodObject<{
    userId: z.ZodString;
    roles: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    expiresAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    userId: string;
    roles: string[];
    expiresAt: string;
}, {
    userId: string;
    expiresAt: string;
    roles?: string[] | undefined;
}>;
export type Session = z.infer<typeof sessionSchema>;
