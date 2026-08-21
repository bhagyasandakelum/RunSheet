"use client";

import React from "react";

export interface MetricData {
  assigned: number;
  completed: number;
  pending: number;
  overdue: number;
  assignedTrend?: string;
  completedTrend?: string;
  pendingTrend?: string;
  overdueTrend?: string;
}

export interface MetricCardsProps {
  data?: MetricData;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  data = {
    assigned: 12,
    completed: 8,
    pending: 3,
    overdue: 1,
    assignedTrend: "+2 since yesterday",
    completedTrend: "Great progress",
    pendingTrend: "Steady",
    overdueTrend: "Action required",
  },
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. ASSIGNED TASKS */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131b2e] p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            Assigned Tasks
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>

        <div className="mt-4 mb-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {data.assigned}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17l9.2-9.2M17 17V8H8" />
          </svg>
          <span>{data.assignedTrend || "+2 since yesterday"}</span>
        </div>
      </div>

      {/* 2. COMPLETED */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131b2e] p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            Completed
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <div className="mt-4 mb-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {data.completed}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17l9.2-9.2M17 17V8H8" />
          </svg>
          <span>{data.completedTrend || "Great progress"}</span>
        </div>
      </div>

      {/* 3. PENDING */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131b2e] p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            Pending
          </span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="mt-4 mb-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {data.pending}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <span className="font-bold">—</span>
          <span>{data.pendingTrend || "Steady"}</span>
        </div>
      </div>

      {/* 4. OVERDUE (Red Alert Card) */}
      <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-[#fee2e2]/70 dark:bg-red-950/30 p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-red-700 dark:text-red-400 uppercase">
            Overdue
          </span>
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/60 flex items-center justify-center text-red-600 dark:text-red-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        <div className="mt-4 mb-2">
          <span className="text-3xl font-extrabold text-red-900 dark:text-red-100 tracking-tight">
            {data.overdue}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-medium text-red-700 dark:text-red-400">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 7l-9.2 9.2M8 7v9h9" />
          </svg>
          <span>{data.overdueTrend || "Action required"}</span>
        </div>
      </div>
    </div>
  );
};
