import React from "react";
import { cn } from "@/lib/utils/cn";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  className,
  variant = "info",
  title,
  children,
  onClose,
  ...props
}) => {
  const variants = {
    info: "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400",
    success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400",
    error: "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400",
  };

  return (
    <div
      className={cn(
        "relative w-full rounded-2xl border p-4 text-sm flex items-start justify-between gap-3",
        variants[variant],
        className
      )}
      role="alert"
      {...props}
    >
      <div className="flex-1">
        {title && <h5 className="font-semibold mb-1 text-base leading-none">{title}</h5>}
        <div className="text-xs opacity-90">{children}</div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="text-current opacity-70 hover:opacity-100 p-1 transition-opacity"
        >
          ✕
        </button>
      )}
    </div>
  );
};
