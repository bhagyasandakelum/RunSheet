"use client";

import React from "react";
import { EventMember } from "@/types/common/entities";

export interface RecentlyJoinedPanelProps {
  members?: EventMember[] | any[];
}

export const RecentlyJoinedPanel: React.FC<RecentlyJoinedPanelProps> = ({ members = [] }) => {
  const displayList = members.slice(0, 4);

  const formatTimeAgo = (isoDate: string) => {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <span>Recently Joined</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </h3>
        <span className="text-[10px] font-semibold text-slate-400">Activity</span>
      </div>

      <div className="space-y-3">
        {displayList.length === 0 ? (
          <p className="text-xs text-slate-400 font-medium py-3 text-center">
            No recent member activity.
          </p>
        ) : (
          displayList.map((m) => {
            const name = m.user ? `${m.user.firstName} ${m.user.lastName}` : `${m.firstName || ""} ${m.lastName || ""}`.trim() || "Event Volunteer";
            const email = m.user?.email || m.email || "volunteer@runsheet.io";
            const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "EV";
            const team = m.teamName || m.teamMembership?.team?.teamName || "Unassigned";

            return (
              <div
                key={m.eventMemberId}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold text-emerald-800 dark:text-emerald-300 shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {name}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {team}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 shrink-0">
                  {formatTimeAgo(m.joinedAt)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
