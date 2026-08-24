"use client";

import React from "react";
import Link from "next/link";

export interface TeamPerformanceItem {
  teamId?: string;
  teamName: string;
  leaderName: string;
  memberCount: number;
  completedTasks: number;
  totalTasks: number;
  completionPercentage?: number;
  status?: "Completed" | "On Track" | "At Risk";
}

export interface TeamPerformanceTableProps {
  teams?: TeamPerformanceItem[];
}

export const TeamPerformanceTable: React.FC<TeamPerformanceTableProps> = ({
  teams = [],
}) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getStatusBadge = (status?: string, percentage = 0) => {
    const finalStatus =
      status ||
      (percentage >= 100 ? "Completed" : percentage >= 70 ? "On Track" : "At Risk");

    if (finalStatus === "Completed") {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
          Completed
        </span>
      );
    }

    if (finalStatus === "On Track") {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-500/20">
          On Track
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-500/20">
        At Risk
      </span>
    );
  };

  const getAvatarStyles = (index: number) => {
    if (index % 3 === 0) {
      return "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300/50";
    }
    if (index % 3 === 1) {
      return "bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border-sky-300/50";
    }
    return "bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-300/50";
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 100) return "bg-[#15803D] dark:bg-[#22C55E]";
    if (percentage >= 70) return "bg-[#0284C7] dark:bg-[#38BDF8]";
    return "bg-[#B91C1C] dark:bg-[#EF4444]";
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Team Performance
        </h2>
        <Link
          href="/teams"
          className="text-xs font-bold text-[#15803D] dark:text-emerald-400 hover:underline flex items-center gap-1 transition-colors"
        >
          <span>View All Teams</span>
        </Link>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <th className="pb-3 font-bold">TEAM NAME</th>
              <th className="pb-3 font-bold">LEADER</th>
              <th className="pb-3 font-bold">MEMBERS</th>
              <th className="pb-3 font-bold">TASKS</th>
              <th className="pb-3 font-bold w-44">PROGRESS</th>
              <th className="pb-3 font-bold text-right">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200">
            {teams.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-slate-400 font-medium">
                  No teams created for this event yet.{" "}
                  <Link href="/teams/create" className="text-emerald-600 font-bold hover:underline">
                    Create a team
                  </Link>{" "}
                  to track performance.
                </td>
              </tr>
            ) : (
              teams.map((item, idx) => {
                const percentage =
                  item.completionPercentage ??
                  (item.totalTasks > 0
                    ? Math.round((item.completedTasks / item.totalTasks) * 100)
                    : 0);

                return (
                  <tr
                    key={item.teamId || item.teamName}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Team Name with Initials Box */}
                    <td className="py-3.5 flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-[11px] shrink-0 ${getAvatarStyles(
                          idx
                        )}`}
                      >
                        {getInitials(item.teamName)}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {item.teamName}
                      </span>
                    </td>

                    {/* Leader */}
                    <td className="py-3.5 text-slate-600 dark:text-slate-300">
                      {item.leaderName || "Unassigned"}
                    </td>

                    {/* Members */}
                    <td className="py-3.5 text-slate-600 dark:text-slate-300">
                      {item.memberCount}
                    </td>

                    {/* Tasks */}
                    <td className="py-3.5 text-slate-600 dark:text-slate-300">
                      {item.completedTasks} / {item.totalTasks}
                    </td>

                    {/* Progress Bar */}
                    <td className="py-3.5">
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(
                            percentage
                          )}`}
                        />
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 text-right">
                      {getStatusBadge(item.status, percentage)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
