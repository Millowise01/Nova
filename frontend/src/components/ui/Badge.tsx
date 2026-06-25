import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "error" | "eco" | "outline";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  warning: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  eco: "bg-primary/10 text-primary dark:bg-primary/20",
  outline: "border border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-300",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "default", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
