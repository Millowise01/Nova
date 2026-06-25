import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

export function EcoScorePill({ score, certified = false, className }: { score: number; certified?: boolean; className?: string }) {
  const color = score >= 85 ? "text-primary bg-primary/10" : score >= 65 ? "text-yellow-700 bg-yellow-50" : "text-slate-600 bg-slate-100";
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", color, className)}>
      <Leaf size={11} />
      {certified ? "Eco Certified" : `Eco ${score}`}
    </span>
  );
}
