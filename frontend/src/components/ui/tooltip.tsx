"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils/cn";

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = "top",
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 px-2.5 py-1 text-xs font-medium text-slate-100 bg-slate-900 border border-slate-800 rounded-lg shadow-md whitespace-nowrap pointer-events-none transition-opacity duration-150 animate-in fade-in-0",
            positions[position]
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
};
