import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "@nova/utils";

const gridVariants = cva("grid", {
  variants: {
    cols: {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
      12: "grid-cols-12",
    },
    gap: {
      0: "gap-0",
      2: "gap-2",
      3: "gap-3",
      4: "gap-4",
      5: "gap-5",
      6: "gap-6",
      8: "gap-8",
    },
    responsive: {
      true: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      false: "",
    },
  },
  defaultVariants: { gap: 4 },
});

export interface GridProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof gridVariants> {}

export function Grid({ cols, gap, responsive, className, children, ...props }: GridProps) {
  return (
    <div className={cn(gridVariants({ cols, gap, responsive }), className)} {...props}>
      {children}
    </div>
  );
}
