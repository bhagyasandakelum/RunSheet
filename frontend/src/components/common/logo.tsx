import React from "react";

export interface LogoProps {
  size?: "sm" | "md" | "lg";
}

export const RunSheetLogo: React.FC<LogoProps> = ({ size = "md" }) => {
  const iconSizes = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className="inline-flex items-center justify-center gap-2 select-none">
      <div
        className={`${iconSizes[size]} rounded-lg bg-[#44D944] text-slate-950 font-black flex items-center justify-center shadow-sm shadow-[#44D944]/30`}
      >
        <svg
          className="w-5 h-5"
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
      <span
        className={`${textSizes[size]} font-bold tracking-tight text-slate-900 dark:text-slate-100`}
      >
        RunSheet
      </span>
    </div>
  );
};
