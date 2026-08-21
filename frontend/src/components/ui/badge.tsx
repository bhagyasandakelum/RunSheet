import React from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "success" | "warning" | "error" | "info" | "neutral" | "outline";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "neutral",
  size = "md",
  children,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center font-semibold rounded-full border transition-colors select-none";

  const variants = {
    primary: "bg-primary/15 text-emerald-500 border-primary/30 dark:text-primary",
    success: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:text-emerald-400",
    warning: "bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400",
    error: "bg-red-500/15 text-red-600 border-red-500/30 dark:text-red-400",
    info: "bg-blue-500/15 text-blue-600 border-blue-500/30 dark:text-blue-400",
    neutral: "bg-muted text-muted-foreground border-border",
    outline: "bg-transparent text-foreground border-border",
  };

  const sizes = {
    sm: "text-[10px] px-2 py-0.5 tracking-wider uppercase",
    md: "text-xs px-2.5 py-1 tracking-wide",
  };

  return (
    <div
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </div>
  );
};
