import React from "react";
import { cn } from "@/lib/utils/cn";

export interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg";
  iconOnly?: boolean;
  className?: string;
  textClassName?: string;
}

export const RunSheetLogo: React.FC<LogoProps> = ({
  size = "md",
  iconOnly = false,
  className,
  textClassName,
}) => {
  const iconSizes = {
    xs: "w-6 h-6 rounded-md",
    sm: "w-7 h-7 rounded-lg",
    md: "w-8 h-8 rounded-lg",
    lg: "w-10 h-10 rounded-xl",
  };

  const svgSizes = {
    xs: "w-3.5 h-3.5",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const textSizes = {
    xs: "text-sm",
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  };

  return (
    <div className={cn("inline-flex items-center justify-center gap-2 select-none", className)}>
      <div
        className={cn(
          iconSizes[size],
          "bg-gradient-to-tr from-[#38C238] to-[#44D944] text-slate-950 flex items-center justify-center shadow-md shadow-[#44D944]/25 shrink-0"
        )}
      >
        <svg
          className={svgSizes[size]}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </div>
      {!iconOnly && (
        <span
          className={cn(
            textSizes[size],
            "font-extrabold tracking-tight text-slate-900 dark:text-slate-100",
            textClassName
          )}
        >
          RunSheet
        </span>
      )}
    </div>
  );
};
