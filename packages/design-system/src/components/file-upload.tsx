import type { InputHTMLAttributes } from "react";

export function FileUpload(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="file" {...props} />;
}
