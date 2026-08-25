"use client";

import React, { useState, useEffect, useCallback } from "react";
import { teamMembershipService } from "@/services/team-membership-service";
import { teamService } from "@/services/team-service";
import { Team, TeamMembership } from "@/types/common/entities";
import { Button } from "@/components/ui/button";
import { AddTeamMemberModal } from "./AddTeamMemberModal";

export interface ManageTeamMembersModalProps {
  isOpen: boolean;
  team: Team | null;
  isOrganizer: boolean;
  isTeamLeader: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export const ManageTeamMembersModal: React.FC<ManageTeamMembersModalProps> = ({
  isOpen,
  team,
  isOrganizer,
  isTeamLeader,
  onClose,
  onUpdated,
}) => {
  const [members, setMembers] = useState<TeamMembership[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(team);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canManage = isOrganizer || isTeamLeader;

  useEffect(() => {
    setCurrentTeam(team);
  }, [team]);

  const loadMembers = useCallback(async () => {
    if (!currentTeam) return;
    try {
      setIsLoading(true);
      setError(null);
      const [membersData, teamData] = await Promise.allSettled([
        teamMembershipService.getTeamMembers(currentTeam.teamId),
        teamService.getTeamDetails(currentTeam.teamId),
      ]);
      if (membersData.status === "fulfilled") {
        setMembers(membersData.value || []);
      }
      if (teamData.status === "fulfilled") {
        setCurrentTeam(teamData.value);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load team members.");
    } finally {
      setIsLoading(false);
    }
  }, [currentTeam]);

  useEffect(() => {
    if (isOpen && currentTeam) {
      loadMembers();
    }
  }, [isOpen, currentTeam?.teamId]);

  if (!isOpen || !currentTeam) return null;

  const handleAssignLeader = async (membershipId: string) => {
    try {
      setError(null);
      await teamService.assignTeamLeader(currentTeam.teamId, {
        teamMembershipId: membershipId,
      });
      await loadMembers();
      onUpdated?.();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to set team leader.");
    }
  };

  const handleRemoveLeader = async () => {
    try {
      setError(null);
      await teamService.removeTeamLeader(currentTeam.teamId);
      await loadMembers();
      onUpdated?.();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to remove team leader.");
    }
  };

  const handleRemoveMember = async (membershipId: string) => {
    try {
      setError(null);
      await teamMembershipService.removeMember(membershipId);
      await loadMembers();
      onUpdated?.();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to remove member.");
    }
  };

  const filteredMembers = members.filter((m: any) => {
    const user = m.eventMember?.user || m.user || {};
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
    const email = (user.email || "").toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    return fullName.includes(query) || email.includes(query);
  });

  const memberUserIds = members.map((m: any) => m.eventMember?.userId || m.userId).filter(Boolean);

  const leaderObj = currentTeam.leader as any;
  const leaderUser = leaderObj?.eventMember?.user || leaderObj?.user;
  const leaderName =
    currentTeam.leaderName ||
    (leaderUser ? `${leaderUser.firstName} ${leaderUser.lastName}` : "No Leader Assigned");

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="relative w-full max-w-4xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] flex flex-col animate-in fade-in-50 zoom-in-95">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Team Operations
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-xs font-semibold text-slate-500">{currentTeam.teamName}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
                Manage Team Members
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage the members of this team. Ensure correct roles and access levels are assigned for event operations.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {canManage && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsAddOpen(true)}
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

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {error && (
            <div className="my-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Main 2-Column Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 overflow-hidden flex-1">
            {/* Left Summary Sidebar */}
            <div className="space-y-4 md:col-span-1">
              <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-500/20 space-y-4">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    Team Overview
                  </p>
                  <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
                    {currentTeam.teamName}
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-emerald-500/10">
                    <span className="text-slate-500 dark:text-slate-400">Team Leader</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                      {leaderName}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-emerald-500/10">
                    <span className="text-slate-500 dark:text-slate-400">Total Assigned</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      {members.length} Members
                    </span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 dark:text-slate-400">Status</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Active</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-emerald-500/10 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                  ℹ️ All team operations are strictly scoped to <span className="font-bold">{currentTeam.teamName}</span>. Team leader and organizer can add or remove members.
                </div>
              </div>
            </div>

            {/* Right Member Table / List */}
            <div className="md:col-span-2 flex flex-col overflow-hidden">
              {/* Search input */}
              <div className="mb-3 relative">
                <input
                  type="text"
                  placeholder="Search members by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/60 dark:bg-[#1A2234] text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
                <svg
                  className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Members List Scrollable */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-96">
                {isLoading ? (
                  <div className="py-12 text-center text-xs text-slate-400 font-medium">
                    Loading members...
                  </div>
                ) : filteredMembers.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400 font-medium bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    No members found in this team. Click &quot;Add Member&quot; to assign members.
                  </div>
                ) : (
                  filteredMembers.map((m: any) => {
                    const user = m.eventMember?.user || m.user || {};
                    const isLeader =
                      currentTeam.leaderMembershipId === m.teamMembershipId || m.isLeader;
                    const name =
                      user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.firstName || m.firstName || "Member";
                    const email = user.email || m.email || "";
                    const avatar = user.profilePhotoUrl || m.profilePhotoUrl || null;

                    return (
                      <div
                        key={m.teamMembershipId}
                        className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#1A2234] hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
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

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isOrganizer && !isLeader && (
                            <button
                              onClick={() => handleAssignLeader(m.teamMembershipId)}
                              className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 px-2 py-1 rounded-lg transition-colors border border-emerald-500/20"
                              title="Assign as Team Leader"
                            >
                              Make Leader
                            </button>
                          )}

                          {isOrganizer && isLeader && (
                            <button
                              onClick={handleRemoveLeader}
                              className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 px-2 py-1 rounded-lg transition-colors border border-amber-500/20"
                              title="Remove Team Leader status"
                            >
                              Demote
                            </button>
                          )}

                          {canManage && !isLeader && (
                            <button
                              onClick={() => handleRemoveMember(m.teamMembershipId)}
                              className="text-xs text-rose-500 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1.5 rounded-lg transition-colors"
                              title="Remove member from team"
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
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button
              variant="outline"
              size="md"
              onClick={onClose}
              className="text-xs font-semibold"
            >
              Done
            </Button>
          </div>
        </div>
      </div>

      {/* Add Member Sub-Modal */}
      <AddTeamMemberModal
        isOpen={isAddOpen}
        team={currentTeam}
        currentMemberUserIds={memberUserIds}
        onClose={() => setIsAddOpen(false)}
        onSuccess={() => {
          loadMembers();
          onUpdated?.();
        }}
      />
    </>
  );
};

