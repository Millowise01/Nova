import type { HTMLAttributes } from "react";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  src?: string;
}

export function Avatar({ name, src, ...props }: AvatarProps) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div aria-label={name} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--ds-secondary)] text-sm font-semibold text-[color:var(--ds-secondary-foreground)]" {...props}>
      {src ? <img alt={name} width={40} height={40} className="h-full w-full rounded-full object-cover" src={src} /> : initials}
    </div>
  );
}
