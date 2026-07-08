import type { HTMLAttributes } from "react";
export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
    name: string;
    src?: string;
}
export declare function Avatar({ name, src, ...props }: AvatarProps): import("react").JSX.Element;
