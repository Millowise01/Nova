import type { TextareaHTMLAttributes } from "react";
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: boolean;
}
export declare function Textarea({ className, error, ...props }: TextareaProps): import("react").JSX.Element;
