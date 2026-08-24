"use client";

import React from "react";

export interface EventMembersStatsCardsProps {
  totalMembers?: number;
  teamsAssigned?: number;
  totalTasks?: number;
  unassignedCount?: number;
}

export const EventMembersStatsCards: React.FC<EventMembersStatsCardsProps> = ({
  totalMembers = 145,
  teamsAssigned = 12,
  totalTasks = 133,
  unassignedCount = 18,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. TOTAL MEMBERS */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between transition-all hover:shadow-md">
        <div className="space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Total Members
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {totalMembers}
          </div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <span>↑</span> Active event roster
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      </div>

      {/* 2. TEAMS ASSIGNED */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between transition-all hover:shadow-md">
        <div className="space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Teams Assigned
          </span>
          <div className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400">
            {teamsAssigned}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Volunteers allocated to teams
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200/60 dark:border-sky-800/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
      </div>

      {/* 3. TOTAL TASKS */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between transition-all hover:shadow-md">
        <div className="space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Total Tasks
          </span>
          <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
            {totalTasks}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Assigned member workloads
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
      </div>

      {/* 4. UNASSIGNED */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between transition-all hover:shadow-md">
        <div className="space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Unassigned
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
            {unassignedCount}
          </div>
          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
            Needs team allocation
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
