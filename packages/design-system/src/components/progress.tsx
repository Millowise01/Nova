import type { HTMLAttributes } from "react";

export function Progress(props: HTMLAttributes<HTMLDivElement> & { value: number }) {
  return <div role="progressbar" aria-valuenow={props.value} aria-valuemin={0} aria-valuemax={100} />;
}
