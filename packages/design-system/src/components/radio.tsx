import type { InputHTMLAttributes } from "react";

export function Radio(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="radio" className="h-4 w-4 border border-[color:var(--ds-border)]" {...props} />;
}
