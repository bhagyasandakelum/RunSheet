"use client";

import React from "react";

export interface StatusDistributionData {
  pending?: number;
  inProgress?: number;
  completed?: number;
  overdue?: number;
}

export interface PriorityLevelsData {
  low?: number;
  medium?: number;
  high?: number;
  critical?: number;
}

export interface TaskAnalyticsCardProps {
  statusDistribution?: StatusDistributionData;
  priorityLevels?: PriorityLevelsData;
}

export const TaskAnalyticsCard: React.FC<TaskAnalyticsCardProps> = ({
  statusDistribution = {
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
  },
  priorityLevels = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  },
}) => {
  const pending = statusDistribution.pending ?? 0;
  const inProgress = statusDistribution.inProgress ?? 0;
  const completed = statusDistribution.completed ?? 0;
  const overdue = statusDistribution.overdue ?? 0;

  const maxStatus = Math.max(pending, inProgress, completed, overdue, 1);

  // Height percentages for vertical bars
  const pHeight = pending > 0 ? Math.max((pending / maxStatus) * 100, 8) : 4;
  const ipHeight = inProgress > 0 ? Math.max((inProgress / maxStatus) * 100, 8) : 4;
  const cHeight = completed > 0 ? Math.max((completed / maxStatus) * 100, 8) : 4;
  const oHeight = overdue > 0 ? Math.max((overdue / maxStatus) * 100, 8) : 4;

  // Priority counts & max
  const low = priorityLevels.low ?? 0;
  const medium = priorityLevels.medium ?? 0;
  const high = priorityLevels.high ?? 0;
  const critical = priorityLevels.critical ?? 0;
  const maxPriority = Math.max(low, medium, high, critical, 1);

  const lowWidth = low > 0 ? (low / maxPriority) * 100 : 0;
  const medWidth = medium > 0 ? (medium / maxPriority) * 100 : 0;
  const highWidth = high > 0 ? (high / maxPriority) * 100 : 0;
  const critWidth = critical > 0 ? (critical / maxPriority) * 100 : 0;

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between select-none">
      {/* Header */}
      <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
        Task Analytics
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
        {/* Left Section: Status Distribution Vertical Bar Chart */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase block">
            STATUS DISTRIBUTION
          </span>

          <div className="h-44 flex items-end justify-between gap-3 px-2 pt-4">
            {/* Bar 1: Pending */}
            <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
              <div
                style={{ height: `${pHeight}%` }}
                className="w-full rounded-t-lg bg-sky-200 dark:bg-sky-400 transition-all duration-700 hover:brightness-110"
                title={`Pending: ${pending}`}
              />
              <span className="text-[10px] font-bold text-slate-500">P</span>
            </div>

            {/* Bar 2: In Progress */}
            <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
              <div
                style={{ height: `${ipHeight}%` }}
                className="w-full rounded-t-lg bg-[#0284C7] dark:bg-[#38BDF8] transition-all duration-700 hover:brightness-110"
                title={`In Progress: ${inProgress}`}
              />
              <span className="text-[10px] font-bold text-slate-500">IP</span>
            </div>

            {/* Bar 3: Completed */}
            <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
              <div
                style={{ height: `${cHeight}%` }}
                className="w-full rounded-t-lg bg-[#15803D] dark:bg-[#22C55E] transition-all duration-700 hover:brightness-110"
                title={`Completed: ${completed}`}
              />
              <span className="text-[10px] font-bold text-slate-500">C</span>
            </div>

            {/* Bar 4: Overdue */}
            <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
              <div
                style={{ height: `${oHeight}%` }}
                className="w-full rounded-t-lg bg-[#B91C1C] dark:bg-[#EF4444] transition-all duration-700 hover:brightness-110"
                title={`Overdue: ${overdue}`}
              />
              <span className="text-[10px] font-bold text-slate-500">O</span>
            </div>
          </div>
        </div>

        {/* Right Section: Priority Levels Horizontal Bar Chart */}
        <div className="space-y-3.5 pb-2">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase block">
            PRIORITY LEVELS
          </span>

          <div className="space-y-2.5">
            {/* Low Priority */}
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="w-14 text-right text-slate-500 dark:text-slate-400 text-[11px]">
                Low
              </span>
              <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${lowWidth}%` }}
                  className="h-full rounded-full bg-[#4D7C0F] dark:bg-[#65A30D] transition-all duration-500"
                />
              </div>
              <span className="w-5 text-right font-bold text-slate-900 dark:text-white text-[11px]">
                {low}
              </span>
            </div>

            {/* Medium Priority */}
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="w-14 text-right text-slate-500 dark:text-slate-400 text-[11px]">
                Medium
              </span>
              <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${medWidth}%` }}
                  className="h-full rounded-full bg-[#0284C7] dark:bg-[#0EA5E9] transition-all duration-500"
                />
              </div>
              <span className="w-5 text-right font-bold text-slate-900 dark:text-white text-[11px]">
                {medium}
              </span>
            </div>

            {/* High Priority */}
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="w-14 text-right text-slate-500 dark:text-slate-400 text-[11px]">
                High
              </span>
              <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${highWidth}%` }}
                  className="h-full rounded-full bg-[#334155] dark:bg-[#64748B] transition-all duration-500"
                />
              </div>
              <span className="w-5 text-right font-bold text-slate-900 dark:text-white text-[11px]">
                {high}
              </span>
            </div>

            {/* Critical Priority */}
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="w-14 text-right text-slate-500 dark:text-slate-400 text-[11px]">
                Critical
              </span>
              <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${critWidth}%` }}
                  className="h-full rounded-full bg-[#DC2626] dark:bg-[#EF4444] transition-all duration-500"
                />
              </div>
              <span className="w-5 text-right font-bold text-slate-900 dark:text-white text-[11px]">
                {critical}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
