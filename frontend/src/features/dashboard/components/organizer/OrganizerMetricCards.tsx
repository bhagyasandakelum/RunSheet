"use client";

import React from "react";

export interface OrganizerMetricsData {
  teamsCount: number;
  membersCount: number;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  pendingInvites?: number;
  overdueTasks: number;
}

export interface OrganizerMetricCardsProps {
  metrics?: OrganizerMetricsData;
}

export const OrganizerMetricCards: React.FC<OrganizerMetricCardsProps> = ({
  metrics = {
    teamsCount: 6,
    membersCount: 42,
    totalTasks: 58,
    completedTasks: 41,
    completionPercentage: 70,
    pendingInvites: 7,
    overdueTasks: 3,
  },
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5 select-none">
      {/* 1. Teams */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition-all hover:shadow-md">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-semibold">Teams</span>
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
          {metrics.teamsCount}
        </p>
      </div>

      {/* 2. Members */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition-all hover:shadow-md">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-semibold">Members</span>
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
          {metrics.membersCount}
        </p>
      </div>

      {/* 3. Total Tasks */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition-all hover:shadow-md">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-semibold">Total Tasks</span>
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
          {metrics.totalTasks}
        </p>
      </div>

      {/* 4. Completed (Vibrant Green Filled Card) */}
      <div className="p-4 rounded-2xl bg-[#28C740] text-slate-950 shadow-sm shadow-[#28C740]/25 flex flex-col justify-between transition-all hover:brightness-105">
        <div className="flex items-center justify-between font-bold text-xs opacity-95">
          <span>Completed</span>
          <div className="w-4 h-4 rounded-full border border-slate-950 flex items-center justify-center">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {metrics.completedTasks}
          </span>
          <span className="text-[11px] font-bold opacity-85">
            {Math.round(metrics.completionPercentage)}%
          </span>
        </div>
      </div>

      {/* 5. Pending Invites */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition-all hover:shadow-md">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-semibold">Pending Invites</span>
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
          {metrics.pendingInvites ?? 7}
        </p>
      </div>

      {/* 6. Overdue Tasks (Soft Red Background) */}
      <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 shadow-xs flex flex-col justify-between transition-all hover:shadow-md">
        <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 font-semibold text-xs">
          <span>Overdue Tasks</span>
          <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-3">
          {metrics.overdueTasks}
        </p>
      </div>
    </div>
  );
};
