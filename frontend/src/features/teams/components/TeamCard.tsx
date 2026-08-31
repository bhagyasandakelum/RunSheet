"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Team } from "@/types/common/entities";

export interface TeamCardProps {
  team: Team;
  isOrganizer: boolean;
  isTeamLeader: boolean; // whether current logged in user leads this team
  onEdit?: (team: Team) => void;
  onManageMembers?: (team: Team) => void;
  onDelete?: (team: Team) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  isOrganizer,
  isTeamLeader,
  onEdit,
  onManageMembers,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const canEdit = isOrganizer || isTeamLeader;
  const canDelete = isOrganizer;
  const canManage = isOrganizer || isTeamLeader;

  // Extract leader details
  const leaderObj = team.leader as any;
  const leaderUser = leaderObj?.eventMember?.user || leaderObj?.user;
  const leaderName =
    team.leaderName ||
    (leaderUser?.firstName ? `${leaderUser.firstName} ${leaderUser.lastName || ""}`.trim() : null) ||
    (leaderObj?.firstName ? `${leaderObj.firstName} ${leaderObj.lastName || ""}`.trim() : null);
  const leaderAvatar = leaderUser?.profilePhotoUrl || leaderObj?.profilePhotoUrl || null;

  const memberCount = team.memberCount ?? team.members?.length ?? 0;
  const taskCount = team.taskCount ?? team.tasks?.length ?? 0;

  return (
    <div className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative group hover:border-emerald-500/30">
      <div>
        {/* Top Header: Title, Status Badge, Context Menu */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <Link
                href={`/teams/${team.teamId}`}
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate"
              >
                {team.teamName}
              </Link>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-500/20">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
              {team.description || "No description provided for this team."}
            </p>
          </div>

          {/* 3-dots Context Menu */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 flex items-center justify-center transition-colors"
              title="Team actions"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-9 z-30 w-44 bg-white dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-xl py-1 text-xs font-semibold animate-in fade-in-50 zoom-in-95">
                  <Link
                    href={`/teams/${team.teamId}`}
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  >
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Details
                  </Link>

                  {canManage && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onManageMembers?.(team);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left"
                    >
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Manage Members
                    </button>
                  )}

                  {canEdit && (
                    <Link
                      href={`/teams/${team.teamId}/edit`}
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    >
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Team
                    </Link>
                  )}

                  {canDelete && (
                    <>
                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onDelete?.(team);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Team
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Team Leader Row */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-300 overflow-hidden shrink-0">
            {leaderAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={leaderAvatar}
                alt={leaderName || "Leader"}
                className="w-full h-full object-cover"
              />
            ) : leaderName ? (
              leaderName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
            ) : (
              "?"
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
              {leaderName || "No Leader Assigned"}
            </p>
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              Team Leader
            </p>
          </div>
        </div>
      </div>

      {/* Card Footer: Member Count, Task Count, View Team Action */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>{memberCount} {memberCount === 1 ? "Member" : "Members"}</span>
          </div>

          <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span>{taskCount} Tasks</span>
          </div>
        </div>

        <Link
          href={`/teams/${team.teamId}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors group-hover:translate-x-0.5 transform duration-150"
        >
          <span>View Team</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
};
