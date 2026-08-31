"use client";

import React from "react";
import { MyTeamWidget } from "@/services/dashboard-service";

export interface MyTeamCardProps {
  team?: MyTeamWidget | null;
}

export const MyTeamCard: React.FC<MyTeamCardProps> = ({ team }) => {
  if (!team || !team.teamName) {
    return (
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131b2e] p-5 shadow-xs flex flex-col justify-center items-center text-center min-h-[160px]">
        <p className="text-xs text-slate-400 font-medium">You haven&apos;t been assigned to a team yet.</p>
      </div>
    );
  }

  const activeTeam = team;
  const members = activeTeam.members || [];
  const overflowCount = Math.max(0, (activeTeam.memberCount || members.length) - 3);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-sky-100/60 via-teal-50/40 to-slate-50/60 dark:from-slate-800/80 dark:via-slate-850 dark:to-slate-900/90 p-5 shadow-xs flex flex-col justify-between min-h-[160px]">
      <div>
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-sm">
          <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>My Team</span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {activeTeam.teamName}
        </p>
      </div>

      {/* Overlapping Avatar Stack */}
      <div className="flex items-center -space-x-2 mt-4">
        {members.slice(0, 3).map((member, idx) => {
          const memberName = member.name || `${member.firstName || ""} ${member.lastName || ""}`.trim() || "Member";
          return (
            <div
              key={member.userId || idx}
              className="relative inline-block w-9 h-9 rounded-full ring-2 ring-white dark:ring-slate-900 overflow-hidden bg-emerald-700 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs"
              title={memberName}
            >
              {member.profilePhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.profilePhotoUrl}
                  alt={memberName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{getInitials(memberName)}</span>
              )}
            </div>
          );
        })}

        {/* Overflow Badge */}
        {overflowCount > 0 && (
          <div className="relative inline-flex items-center justify-center w-9 h-9 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-200/90 dark:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 shadow-xs">
            +{overflowCount}
          </div>
        )}
      </div>
    </div>
  );
};
