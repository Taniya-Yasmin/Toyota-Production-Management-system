import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: number | string;
  variant?: "default" | "success" | "warning" | "destructive";
  icon?: ReactNode;
  className?: string;
}

const variantStyles = {
  default: "border-border",
  success: "border-success/30 bg-success/5",
  warning: "border-accent/30 bg-accent/5",
  destructive: "border-destructive/30 bg-destructive/5",
};

const valueStyles = {
  default: "text-foreground",
  success: "text-success",
  warning: "text-accent",
  destructive: "text-destructive",
};

export function MetricCard({ label, value, variant = "default", icon, className }: MetricCardProps) {
  return (
    <div className={cn(
      "rounded-xl border bg-card p-4 shadow-card",
      variantStyles[variant],
      className
    )}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <p className={cn("text-2xl font-bold", valueStyles[variant])}>{value}</p>
    </div>
  );
}
