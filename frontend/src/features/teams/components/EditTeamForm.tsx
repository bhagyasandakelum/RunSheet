"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { teamService } from "@/services/team-service";
import { teamMembershipService } from "@/services/team-membership-service";
import { userService } from "@/services/user-service";
import { useAuth } from "@/hooks/use-auth";
import { Team, TeamMembership, User } from "@/types/common/entities";
import { Button } from "@/components/ui/button";
import { AddTeamMemberModal } from "./AddTeamMemberModal";
import { DeleteTeamModal } from "./DeleteTeamModal";

export interface EditTeamFormProps {
  teamId: string;
}

export const EditTeamForm: React.FC<EditTeamFormProps> = ({ teamId }) => {
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMembership[]>([]);
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");

  // Leader Management
  const [isChangingLeader, setIsChangingLeader] = useState(false);
  const [leaderSearchQuery, setLeaderSearchQuery] = useState("");
  const [candidateUsers, setCandidateUsers] = useState<User[]>([]);
  const [isSearchingLeader, setIsSearchingLeader] = useState(false);

  // Modals
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [teamData, membersData] = await Promise.all([
        teamService.getTeamDetails(teamId),
        teamMembershipService.getTeamMembers(teamId),
      ]);
      setTeam(teamData);
      setTeamName(teamData.teamName);
      setDescription(teamData.description || "");
      setMembers(membersData || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load team data.");
    } finally {
      setIsLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Search candidate leaders
  useEffect(() => {
    if (!leaderSearchQuery.trim()) {
      setCandidateUsers([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingLeader(true);
        const results = await userService.searchUsers(leaderSearchQuery);
        setCandidateUsers(results);
      } catch (err) {
        console.error("Failed to search leaders:", err);
      } finally {
        setIsSearchingLeader(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [leaderSearchQuery]);

  const isOrganizer = currentUser?.userId === (team?.event?.organizerId || (team as any)?.organizerId);
  const isTeamLeader =
    team?.leaderMembershipId === (team?.leader as any)?.teamMembershipId ||
    currentUser?.userId === (team?.leader as any)?.eventMember?.userId;

  const canEdit = isOrganizer || isTeamLeader;
  const canDelete = isOrganizer;
  const canChangeLeader = isOrganizer;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) {
      setError("Team name cannot be empty.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      await teamService.updateTeam(teamId, {
        teamName: teamName.trim(),
        description: description.trim() || undefined,
      });

      setSuccessMessage("Team details updated successfully.");
      setTimeout(() => {
        router.push(`/teams/${teamId}`);
      }, 800);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to update team.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignLeaderFromMember = async (teamMembershipId: string) => {
    try {
      setError(null);
      await teamService.assignTeamLeader(teamId, { teamMembershipId });
      setIsChangingLeader(false);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to assign team leader.");
    }
  };

  const handleRemoveMember = async (membershipId: string) => {
    try {
      setError(null);
      await teamMembershipService.removeMember(membershipId);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to remove member.");
    }
  };

  const handleDeleteTeam = async () => {
    await teamService.deleteTeam(teamId);
    router.push("/teams");
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-xs font-semibold text-slate-400">
        Loading team information...
      </div>
    );
  }

  if (!team) {
    return (
      <div className="p-8 text-center text-rose-500 text-xs font-semibold">
        Team not found.
      </div>
    );
  }

  const leaderObj = team.leader as any;
  const leaderUser = leaderObj?.eventMember?.user || leaderObj?.user;
  const leaderName =
    team.leaderName ||
    (leaderUser ? `${leaderUser.firstName} ${leaderUser.lastName}` : null);
  const leaderAvatar = leaderUser?.profilePhotoUrl || null;
  const leaderEmail = leaderUser?.email || null;

  const memberUserIds = members.map((m: any) => m.eventMember?.userId || m.userId).filter(Boolean);

  return (
    <div className="max-w-6xl mx-auto pb-16 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/teams" className="hover:text-emerald-600 transition-colors">
            Teams
          </Link>
          <span>/</span>
          <Link href={`/teams/${teamId}`} className="hover:text-emerald-600 transition-colors">
            {team.teamName}
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white">Edit</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Edit Team
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Update team information, manage leadership, and organize members for {team.teamName}.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <span>✓</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Form Area: 2 Columns for Basic Info + Leader & Danger Zone */}
      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Basic Information (2/3) */}
          <div className="lg:col-span-2 bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Basic Information
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Team Name *
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                maxLength={100}
                required
                disabled={!canEdit}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-[#1A2234] text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Description &amp; Responsibilities
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={1000}
                disabled={!canEdit}
                className="w-full p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-[#1A2234] text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-60 resize-none"
              />
            </div>
          </div>

          {/* Right Column: Leader Card & Danger Zone (1/3) */}
          <div className="space-y-6">
            {/* Leader Card */}
            <div className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Team Leader
                </h3>
                {canChangeLeader && (
                  <button
                    type="button"
                    onClick={() => setIsChangingLeader(!isChangingLeader)}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                  >
                    {isChangingLeader ? "Close" : "Change Leader"}
                  </button>
                )}
              </div>

              {leaderName ? (
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-300 overflow-hidden shrink-0">
                    {leaderAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={leaderAvatar} alt={leaderName} className="w-full h-full object-cover" />
                    ) : (
                      leaderName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {leaderName}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {leaderEmail || "Team Leader"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 font-semibold">
                  No leader currently assigned.
                </div>
              )}

              {/* Assign Leader Selection (Pick from existing members) */}
              {isChangingLeader && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <p className="text-[11px] font-bold text-slate-500">
                    Select a member to make Team Leader:
                  </p>
                  <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                    {members.map((m: any) => {
                      const u = m.eventMember?.user || m.user || {};
                      const name = `${u.firstName || ""} ${u.lastName || ""}`;
                      const isCurrent = team.leaderMembershipId === m.teamMembershipId;
                      return (
                        <button
                          key={m.teamMembershipId}
                          type="button"
                          disabled={isCurrent}
                          onClick={() => handleAssignLeaderFromMember(m.teamMembershipId)}
                          className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                            isCurrent
                              ? "bg-emerald-50 text-emerald-800 font-bold cursor-default"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <span className="truncate">{name}</span>
                          {isCurrent && <span className="text-[10px] text-emerald-600">Current</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Danger Zone */}
            {canDelete && (
              <div className="bg-white dark:bg-[#131B2E] border border-rose-200 dark:border-rose-950/60 rounded-3xl p-6 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Danger Zone
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Deleting this team removes member assignments and associated workflows.
                </p>
                <Button
                  type="button"
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
        </div>

        {/* Members Section Table / List */}
        <div className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Team Members ({members.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Volunteers and coordinators currently allocated to this team.
              </p>
            </div>

            {canEdit && (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => setIsAddMemberOpen(true)}
                className="bg-[#28c740] hover:bg-[#23b33a] text-white font-bold text-xs"
                leftIcon={
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                Add Member
              </Button>
            )}
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {members.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400 font-medium">
                No members in this team yet. Click &quot;Add Member&quot; to assign members.
              </div>
            ) : (
              members.map((m: any) => {
                const user = m.eventMember?.user || m.user || {};
                const isLeader =
                  team.leaderMembershipId === m.teamMembershipId || m.isLeader;
                const name =
                  user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.firstName || m.firstName || "Member";
                const email = user.email || m.email || "";
                const avatar = user.profilePhotoUrl || m.profilePhotoUrl || null;
                const joinedDate = m.joinedAt
                  ? new Date(m.joinedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Recently";

                return (
                  <div
                    key={m.teamMembershipId}
                    className="py-3.5 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-300 overflow-hidden shrink-0">
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
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {name}
                          </p>
                          {isLeader ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-500/30">
                              Leader
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800">
                              Member
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                          {email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
                        Joined {joinedDate}
                      </span>

                      {canEdit && !isLeader && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(m.teamMembershipId)}
                          className="text-xs text-rose-500 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1.5 rounded-lg transition-colors"
                          title="Remove member"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href={`/teams/${teamId}`}>
            <Button type="button" variant="outline" size="md" className="text-xs font-semibold">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSaving}
            disabled={!canEdit || !teamName.trim()}
            className="bg-[#28c740] hover:bg-[#23b33a] text-white font-bold px-7"
          >
            Save Changes
          </Button>
        </div>
      </form>

      {/* Add Member Modal */}
      <AddTeamMemberModal
        isOpen={isAddMemberOpen}
        team={team}
        currentMemberUserIds={memberUserIds}
        onClose={() => setIsAddMemberOpen(false)}
        onSuccess={loadData}
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
