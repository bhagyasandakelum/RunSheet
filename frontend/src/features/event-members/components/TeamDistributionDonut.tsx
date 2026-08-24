"use client";

import React from "react";

export interface TeamDistributionItem {
  teamName: string;
  memberCount: number;
  color: string;
}

export interface TeamDistributionDonutProps {
  distribution?: TeamDistributionItem[];
  totalMembers?: number;
}

export const TeamDistributionDonut: React.FC<TeamDistributionDonutProps> = ({
  distribution = [
    { teamName: "Tech Ops", memberCount: 42, color: "#38bdf8" },
    { teamName: "Stage Logistics", memberCount: 36, color: "#22c55e" },
    { teamName: "Marketing Gamma", memberCount: 28, color: "#f59e0b" },
    { teamName: "Unassigned", memberCount: 18, color: "#94a3b8" },
  ],
  totalMembers = 124,
}) => {
  const sumCount = distribution.reduce((acc, curr) => acc + curr.memberCount, 0) || 1;

  // Compute SVG stroke dashes
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
          Team Distribution
        </h3>
        <span className="text-[10px] font-bold text-slate-400">Headcount</span>
      </div>

      {/* Donut graphic */}
      <div className="flex items-center justify-center py-2">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {distribution.map((item, idx) => {
              const percent = item.memberCount / sumCount;
              const strokeDasharray = `${circumference * percent} ${circumference * (1 - percent)}`;
              const strokeDashoffset = `-${circumference * cumulativePercent}`;
              cumulativePercent += percent;

              return (
                <circle
                  key={idx}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth="12"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-700"
                />
              );
            })}
          </svg>

          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {distribution.length}
            </span>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
              Teams
            </span>
          </div>
        </div>
      </div>

      {/* Legend list */}
      <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
        {distribution.map((item) => (
          <div key={item.teamName} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                {item.teamName}
              </span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white shrink-0">
              {item.memberCount} members
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
