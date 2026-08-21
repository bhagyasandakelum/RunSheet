import React from "react";
import { cn } from "@/lib/utils/cn";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || (typeof label === "string" ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="inline-flex items-center gap-2.5 cursor-pointer select-none">
          <input
            id={inputId}
            type="checkbox"
            ref={ref}
            className={cn(
              "w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/40 focus:ring-offset-0 bg-card cursor-pointer accent-primary",
              className
            )}
            {...props}
          />
          {label && <span className="text-sm font-medium text-foreground">{label}</span>}
        </label>
        {error && <p className="text-xs text-red-500 font-medium pl-6">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
