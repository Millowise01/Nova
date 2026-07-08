import type { InputHTMLAttributes } from "react";
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
    errorId?: string;
}
export declare function Input({ className, error, errorId, ...props }: InputProps): import("react").JSX.Element;
