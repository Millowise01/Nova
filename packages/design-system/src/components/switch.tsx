import type { InputHTMLAttributes } from "react";

export function Switch(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="checkbox" role="switch" className="h-5 w-10 rounded-full border border-[color:var(--ds-border)]" {...props} />;
}
