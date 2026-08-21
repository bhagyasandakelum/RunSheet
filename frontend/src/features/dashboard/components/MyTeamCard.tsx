"use client";

import React from "react";
import { MyTeamWidget } from "@/services/dashboard-service";

export interface MyTeamCardProps {
  team?: MyTeamWidget | null;
}

const DEFAULT_TEAM: MyTeamWidget = {
  teamId: "team-demo-1",
  teamName: "Ops Alpha Squad",
  memberCount: 6,
  members: [
    {
      userId: "u-1",
      name: "Sarah Chen",
      firstName: "Sarah",
      lastName: "Chen",
      email: "sarah@runsheet.app",
      profilePhotoUrl: null,
      isLeader: true,
    },
    {
      userId: "u-2",
      name: "Marcus Vance",
      firstName: "Marcus",
      lastName: "Vance",
      email: "marcus@runsheet.app",
      profilePhotoUrl: null,
      isLeader: false,
    },
    {
      userId: "u-3",
      name: "Elena Rostova",
      firstName: "Elena",
      lastName: "Rostova",
      email: "elena@runsheet.app",
      profilePhotoUrl: null,
      isLeader: false,
    },
  ],
};

export const MyTeamCard: React.FC<MyTeamCardProps> = ({ team }) => {
  const activeTeam = team && team.teamName ? team : DEFAULT_TEAM;
  const members = activeTeam.members && activeTeam.members.length > 0 ? activeTeam.members : DEFAULT_TEAM.members;
  const overflowCount = Math.max(0, (activeTeam.memberCount || members.length + 3) - 3);

  // Curated stock avatar URLs or initials
  const mockAvatarImages = [
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  ];

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
          const avatarUrl = member.profilePhotoUrl || mockAvatarImages[idx % mockAvatarImages.length];
          return (
            <div
              key={member.userId || idx}
              className="relative inline-block w-9 h-9 rounded-full ring-2 ring-white dark:ring-slate-900 overflow-hidden bg-slate-200 dark:bg-slate-700"
              title={member.name || `${member.firstName} ${member.lastName}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            </div>
          );
        })}

        {/* Overflow Badge */}
        {overflowCount > 0 && (
          <div className="relative inline-flex items-center justify-center w-9 h-9 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-200/90 dark:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200">
            +{overflowCount}
          </div>
        )}
      </div>
    </div>
  );
};
