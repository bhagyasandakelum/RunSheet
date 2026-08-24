"use client";

import React from "react";

export interface InvitationStatsCardsProps {
  pendingCount?: number;
  acceptedCount?: number;
  rejectedCount?: number;
  expiredCount?: number;
}

export const InvitationStatsCards: React.FC<InvitationStatsCardsProps> = ({
  pendingCount = 24,
  acceptedCount = 145,
  rejectedCount = 8,
  expiredCount = 12,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* PENDING */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between transition-all hover:shadow-md">
        <div className="space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Pending
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
            {pendingCount}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Awaiting recipient response
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      {/* ACCEPTED */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between transition-all hover:shadow-md">
        <div className="space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Accepted
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {acceptedCount}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Joined as active event members
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      {/* REJECTED */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between transition-all hover:shadow-md">
        <div className="space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Rejected
          </span>
          <div className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400">
            {rejectedCount}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Declined participation
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200/60 dark:border-red-800/60 text-red-600 dark:text-red-400 flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </div>

      {/* EXPIRED */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between transition-all hover:shadow-md">
        <div className="space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Expired
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-700 dark:text-slate-300">
            {expiredCount}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Link past validity window
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
      </div>
    </div>
  );
};
