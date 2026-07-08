import { z } from "zod";
export declare const environmentSchema: z.ZodObject<{
    NEXT_PUBLIC_APP_NAME: z.ZodString;
    NEXT_PUBLIC_APP_URL: z.ZodString;
    NEXT_PUBLIC_API_BASE_URL: z.ZodString;
    NEXT_PUBLIC_DEFAULT_LOCALE: z.ZodString;
}, "strip", z.ZodTypeAny, {
    NEXT_PUBLIC_APP_NAME: string;
    NEXT_PUBLIC_APP_URL: string;
    NEXT_PUBLIC_API_BASE_URL: string;
    NEXT_PUBLIC_DEFAULT_LOCALE: string;
}, {
    NEXT_PUBLIC_APP_NAME: string;
    NEXT_PUBLIC_APP_URL: string;
    NEXT_PUBLIC_API_BASE_URL: string;
    NEXT_PUBLIC_DEFAULT_LOCALE: string;
}>;
export type Environment = z.infer<typeof environmentSchema>;
export declare function getEnvironment(env?: NodeJS.ProcessEnv): Environment;
