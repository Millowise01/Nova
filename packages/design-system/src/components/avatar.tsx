import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes, ImgHTMLAttributes } from "react";

import { cn } from "@nova/utils";

const avatarVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[color:var(--color-secondary)] font-semibold text-[color:var(--color-secondary-foreground)] select-none",
  {
    variants: {
      size: {
        xs: "h-6 w-6 text-xs",
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-lg",
        "2xl": "h-20 w-20 text-xl",
      },
    },
    defaultVariants: { size: "md" },
  },
);

const statusVariants = cva(
  "absolute bottom-0 right-0 rounded-full ring-2 ring-[color:var(--color-background)]",
  {
    variants: {
      status: {
        online: "bg-[color:var(--color-success)]",
        offline: "bg-[color:var(--color-foreground-subtle)]",
        busy: "bg-[color:var(--color-error)]",
        away: "bg-[color:var(--color-warning)]",
      },
      size: {
        xs: "h-1.5 w-1.5",
        sm: "h-2 w-2",
        md: "h-2.5 w-2.5",
        lg: "h-3 w-3",
        xl: "h-3.5 w-3.5",
        "2xl": "h-4 w-4",
      },
    },
  },
);

export interface AvatarProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof avatarVariants> {
  name: string;
  src?: string;
  status?: "online" | "offline" | "busy" | "away";
  imgProps?: ImgHTMLAttributes<HTMLImageElement>;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({
  name,
  src,
  size = "md",
  status,
  imgProps,
  className,
  ...props
}: AvatarProps) {
  return (
    <div
      className={cn(avatarVariants({ size }), className)}
      aria-label={name}
      title={name}
      {...props}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" {...imgProps} />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
      {status && (
        <span className={cn(statusVariants({ status, size: size ?? "md" }))} aria-label={status} />
      )}
    </div>
  );
}

/** Stacked avatar group */
export function AvatarGroup({
  avatars,
  max = 4,
  size = "md",
  className,
}: {
  avatars: Pick<AvatarProps, "name" | "src">[];
  max?: number;
  size?: AvatarProps["size"];
  className?: string;
}) {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;

  return (
    <div className={cn("flex -space-x-2", className)} aria-label={`${avatars.length} users`}>
      {visible.map((a) => (
        <Avatar
          key={a.name}
          name={a.name}
          src={a.src}
          size={size}
          className="ring-2 ring-[color:var(--color-background)]"
        />
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            avatarVariants({ size }),
            "bg-[color:var(--color-muted)] text-[color:var(--color-foreground-muted)] ring-2 ring-[color:var(--color-background)]",
          )}
          aria-label={`${overflow} more`}
        >
          <span aria-hidden="true">+{overflow}</span>
        </div>
      )}
    </div>
  );
}
