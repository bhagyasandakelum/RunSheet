"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { teamService } from "@/services/team-service";
import { teamMembershipService } from "@/services/team-membership-service";
import { taskService } from "@/services/task-service";
import { useAuth } from "@/hooks/use-auth";
import { Team, TeamMembership, Task } from "@/types/common/entities";
import { Button } from "@/components/ui/button";
import { ManageTeamMembersModal } from "./ManageTeamMembersModal";
import { DeleteTeamModal } from "./DeleteTeamModal";

export interface TeamDetailsViewProps {
  teamId: string;
}

export const TeamDetailsView: React.FC<TeamDetailsViewProps> = ({ teamId }) => {
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMembership[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statistics, setStatistics] = useState<{
    memberCount: number;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    pendingTasks: number;
  } | null>(null);

  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [teamData, membersData, statsData, tasksData] = await Promise.allSettled([
        teamService.getTeamDetails(teamId),
        teamMembershipService.getTeamMembers(teamId),
        teamMembershipService.getTeamStatistics(teamId),
        taskService.getTeamTasks(teamId),
      ]);

      if (teamData.status === "fulfilled") {
        setTeam(teamData.value);
      } else {
        throw new Error(teamData.reason?.response?.data?.message || "Failed to load team.");
      }

      if (membersData.status === "fulfilled") {
        setMembers(membersData.value || []);
      }

      if (statsData.status === "fulfilled") {
        setStatistics(statsData.value as any);
      }

      if (tasksData.status === "fulfilled") {
        setTasks(tasksData.value || []);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load team details.");
    } finally {
      setIsLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isOrganizer =
    currentUser?.userId === (team?.event?.organizerId || (team as any)?.organizerId);
  const isTeamLeader =
    team?.leaderMembershipId === (team?.leader as any)?.teamMembershipId ||
    currentUser?.userId === (team?.leader as any)?.eventMember?.userId;

  const canEdit = isOrganizer || isTeamLeader;
  const canDelete = isOrganizer;
  const canManageMembers = isOrganizer || isTeamLeader;

  const handleDeleteTeam = async () => {
    await teamService.deleteTeam(teamId);
    router.push("/teams");
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-xs font-semibold text-slate-400">
        Loading team workspace...
      </div>
    );
  }

  if (!team || error) {
    return (
      <div className="p-8 text-center bg-red-50 dark:bg-red-950/40 rounded-3xl border border-red-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold space-y-3">
        <p>{error || "Team not found or you don't have permission to view."}</p>
        <Link href="/teams">
          <Button variant="outline" size="sm" className="text-xs">
            Back to Teams
          </Button>
        </Link>
      </div>
    );
  }

  // Leader profile data
  const leaderObj = team.leader as any;
  const leaderUser = leaderObj?.eventMember?.user || leaderObj?.user;
  const leaderName =
    team.leaderName ||
    (leaderUser ? `${leaderUser.firstName} ${leaderUser.lastName}` : null);
  const leaderAvatar = leaderUser?.profilePhotoUrl || null;
  const leaderEmail = leaderUser?.email || "leader@runsheet.app";
  const leaderPhone = leaderUser?.phoneNumber || "+1 (555) 019-2834";
  const leaderJoined = leaderObj?.joinedAt
    ? new Date(leaderObj.joinedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Event Kickoff";

  // Task Stats calculations
  const totalTasksCount = statistics?.totalTasks ?? tasks.length;
  const completedTasksCount =
    statistics?.completedTasks ?? tasks.filter((t) => t.status === "Completed").length;
  const inProgressTasksCount =
    statistics?.inProgressTasks ?? tasks.filter((t) => t.status === "InProgress").length;
  const pendingTasksCount =
    statistics?.pendingTasks ?? tasks.filter((t) => t.status === "Pending").length;
  const criticalTasksCount = tasks.filter(
    (t) => (t.priority === "Critical" || t.priority === "High") && t.status !== "Completed"
  ).length;

  const completionPercentage =
    totalTasksCount > 0
      ? Math.round((completedTasksCount / totalTasksCount) * 100)
      : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <Link href="/dashboard" className="hover:text-emerald-600 transition-colors">
          Dashboard
        </Link>
        <span>/</span>
        <Link href="/teams" className="hover:text-emerald-600 transition-colors">
          Teams
        </Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-white font-bold">{team.teamName}</span>
      </div>

      {/* Main Banner Header */}
      <div className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {team.teamName}
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-500/20">
              Active
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
            {team.description ||
              "Responsible for core operations, synchronization, and milestone executions for this group."}
          </p>

          <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>📅 {team.event?.eventName || "Event"}</span>
            <span>•</span>
            <span>📍 {team.event?.venue || "Main Venue"}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {canManageMembers && (
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsManageMembersOpen(true)}
              className="text-xs font-semibold"
              leftIcon={
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              }
            >
              Manage Members
            </Button>
          )}

          <Link href={`/tasks`}>
            <Button
              variant="outline"
              size="md"
              className="text-xs font-semibold"
              leftIcon={
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              }
            >
              Assign Tasks
            </Button>
          </Link>

          {canEdit && (
            <Link href={`/teams/${teamId}/edit`}>
              <Button
                variant="primary"
                size="md"
                className="bg-[#28c740] hover:bg-[#23b33a] text-white font-bold text-xs"
                leftIcon={
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                }
              >
                Edit Team
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Metrics Row (5 Stat Badges) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Members
          </p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {members.length}
          </p>
        </div>

        <div className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Tasks
          </p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalTasksCount}
          </p>
        </div>

        <div className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">
            Completed
          </p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {completedTasksCount}
          </p>
        </div>

        <div className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">
            In Progress
          </p>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {inProgressTasksCount}
          </p>
        </div>

        <div className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">
            Critical / Blocked
          </p>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {criticalTasksCount}
          </p>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (1/3): Team Leader, Members list, Danger Zone */}
        <div className="space-y-6">
          {/* Team Leader Card */}
          <div className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Leadership
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-500/30">
                TEAM LEADER
              </span>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-base font-black text-emerald-700 dark:text-emerald-300 overflow-hidden shrink-0 shadow-sm">
                {leaderAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={leaderAvatar} alt={leaderName || "Leader"} className="w-full h-full object-cover" />
                ) : leaderName ? (
                  leaderName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                ) : (
                  "TL"
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                  {leaderName || "No Leader Assigned"}
                </h3>
                <p className="text-xs text-slate-400 truncate mt-0.5">{leaderEmail}</p>
                <p className="text-xs text-slate-400 truncate mt-0.5">{leaderPhone}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Joined Team</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{leaderJoined}</span>
            </div>
          </div>

          {/* Team Members List Card */}
          <div className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Team Members ({members.length})
              </h3>
              {canManageMembers && (
                <button
                  onClick={() => setIsManageMembersOpen(true)}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                >
                  Manage
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto pr-1">
              {members.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No members added yet.
                </div>
              ) : (
                members.map((m: any) => {
                  const u = m.eventMember?.user || m.user || {};
                  const isLeader =
                    team.leaderMembershipId === m.teamMembershipId || m.isLeader;
                  const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Member";
                  const avatar = u.profilePhotoUrl || null;

                  return (
                    <div key={m.teamMembershipId} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold text-emerald-700 dark:text-emerald-300 overflow-hidden shrink-0">
                          {avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={avatar} alt={name} className="w-full h-full object-cover" />
                          ) : (
                            name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                        </div>
                      </div>

                      {isLeader && (
                        <span className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 shrink-0">
                          Lead
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Danger Zone (Organizer Only) */}
          {canDelete && (
            <div className="bg-white dark:bg-[#131B2E] border border-rose-200/80 dark:border-rose-950/60 rounded-3xl p-6 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Danger Zone
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Permanently delete this team and remove members from this group.
              </p>
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsDeleteOpen(true)}
                className="w-full border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold"
              >
                Delete Team
              </Button>
            </div>
          )}
        </div>

        {/* Right Column (2/3): Active Tasks Panel */}
        <div className="lg:col-span-2 bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Active Tasks
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time operational task assignments and milestones for {team.teamName}.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                {completionPercentage}% Complete
              </span>
              <div className="w-28 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="py-14 text-center text-xs text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                No tasks assigned to this team yet.
              </div>
            ) : (
              tasks.map((t) => {
                const statusColors: Record<string, string> = {
                  Completed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-500/20",
                  InProgress: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-500/20",
                  Pending: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-500/20",
                  Overdue: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-500/20",
                };

                const priorityColors: Record<string, string> = {
                  Critical: "text-rose-600 bg-rose-50 dark:bg-rose-950/50 border-rose-500/30",
                  High: "text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-500/30",
                  Medium: "text-blue-600 bg-blue-50 dark:bg-blue-950/50 border-blue-500/30",
                  Low: "text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700",
                };

                return (
                  <div
                    key={t.taskId}
                    className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#1A2234] hover:border-slate-200 dark:hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {t.taskTitle}
                        </h4>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                            statusColors[t.status] || statusColors.Pending
                          }`}
                        >
                          {t.status}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            priorityColors[t.priority] || priorityColors.Medium
                          }`}
                        >
                          {t.priority}
                        </span>
                      </div>
                      {t.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {t.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {t.dueDate && (
                        <span className="text-[11px] text-slate-400 font-medium">
                          Due {new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <span className="text-xs text-slate-400 font-medium">
              Showing {tasks.length} tasks
            </span>
            <Link href="/tasks">
              <Button variant="outline" size="sm" className="text-xs font-semibold">
                View all Tasks
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Manage Members Modal */}
      <ManageTeamMembersModal
        isOpen={isManageMembersOpen}
        team={team}
        isOrganizer={isOrganizer}
        isTeamLeader={isTeamLeader}
        onClose={() => setIsManageMembersOpen(false)}
        onUpdated={loadData}
      />

      {/* Delete Team Modal */}
      <DeleteTeamModal
        isOpen={isDeleteOpen}
        team={team}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteTeam}
      />
    </div>
  );
};
