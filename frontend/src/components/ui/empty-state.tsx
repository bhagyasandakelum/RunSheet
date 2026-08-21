import React from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "./button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-border bg-card/50 my-4",
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-4 text-xl">
        {icon || "📭"}
      </div>
      <h4 className="font-semibold text-base text-foreground">{title}</h4>
      {description && (
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction} className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
