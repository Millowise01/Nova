import type { HTMLAttributes } from "react";
import { type VariantProps } from "class-variance-authority";
declare const badgeVariants: (props?: ({
    tone?: "primary" | "danger" | "success" | "neutral" | "warning" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
}
export declare function Badge({ className, tone, ...props }: BadgeProps): import("react").JSX.Element;
export {};
