"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useEvent } from "@/providers/event-provider";
import { teamService } from "@/services/team-service";
import { useAuth } from "@/hooks/use-auth";
import { Team } from "@/types/common/entities";
import { Button } from "@/components/ui/button";
import { TeamsStatsCards } from "./TeamsStatsCards";
import { TeamCard } from "./TeamCard";
import { ManageTeamMembersModal } from "./ManageTeamMembersModal";
import { DeleteTeamModal } from "./DeleteTeamModal";

export interface TeamsListViewProps {
  initialEventId?: string;
}

export const TeamsListView: React.FC<TeamsListViewProps> = ({ initialEventId }) => {
  const { user: currentUser } = useAuth();
  const {
    events,
    selectedEventId: globalEventId,
    selectedEvent,
    setSelectedEventId,
  } = useEvent();

  const [localEventId, setLocalEventId] = useState<string>(
    initialEventId || globalEventId || ""
  );
  const [teams, setTeams] = useState<Team[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state
  const [activeManageTeam, setActiveManageTeam] = useState<Team | null>(null);
  const [activeDeleteTeam, setActiveDeleteTeam] = useState<Team | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (globalEventId && !initialEventId) {
      setLocalEventId(globalEventId);
    }
  }, [globalEventId, initialEventId]);

  const loadData = useCallback(async () => {
    const activeId = localEventId || globalEventId;
    if (!activeId) {
      setTeams([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const teamsData = await teamService.getTeamsByEvent(activeId);
      setTeams(teamsData || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load teams.");
    } finally {
      setIsLoading(false);
    }
  }, [localEventId, globalEventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeEvent =
    events.find((e) => e.eventId === (localEventId || globalEventId)) || selectedEvent;
  const isOrganizer = currentUser?.userId === activeEvent?.organizerId;

  // Filtered teams list
  const filteredTeams = teams.filter((t) => {
    const matchesSearch =
      t.teamName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      (t.description || "").toLowerCase().includes(searchQuery.toLowerCase().trim());
    return matchesSearch;
  });

  // Calculate stats
  const totalTeams = teams.length;
  const totalMembers = teams.reduce((acc, t) => acc + (t.memberCount || t.members?.length || 0), 0);
  const activeTeams = teams.length; // all active in event
  const needsAttention = teams.filter((t) => !t.leaderMembershipId && !t.leaderName).length;

  const handleDeleteTeam = async (teamId: string) => {
    await teamService.deleteTeam(teamId);
    await loadData();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Teams
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium max-w-2xl">
            Manage the right teams for the event, oversee responsibilities, assign leadership, and track progress across specialized groups.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {events.length > 0 && (
            <select
              value={localEventId || globalEventId || ""}
              onChange={(e) => {
                setLocalEventId(e.target.value);
                setSelectedEventId(e.target.value);
              }}
              className="h-10 px-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-[#131B2E] text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 shadow-xs"
            >
              {events.map((evt) => (
                <option key={evt.eventId} value={evt.eventId}>
                  {evt.eventName}
                </option>
              ))}
            </select>
          )}

          {isOrganizer && (localEventId || globalEventId) && (
            <Link href={`/teams/create?eventId=${localEventId || globalEventId}`}>
              <Button
                variant="primary"
                size="md"
                className="bg-[#28c740] hover:bg-[#23b33a] text-white font-bold text-xs"
                leftIcon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                Create Team
              </Button>
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
          <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* 4 Summary Stat Cards */}
      <TeamsStatsCards
        totalTeams={totalTeams}
        totalMembers={totalMembers}
        activeTeams={activeTeams}
        needsAttention={needsAttention}
      />

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3 shadow-xs">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by team name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-transparent bg-slate-50 dark:bg-[#1A2234] text-xs font-medium text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-[#131B2E] focus:border-slate-200 dark:focus:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-[#1A2234] text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
          </select>
        </div>
      </div>

      {/* Teams Grid (2 Columns on desktop) */}
      {isLoading ? (
        <div className="py-24 text-center text-xs font-semibold text-slate-400">
          Loading teams...
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-8 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No teams found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? "No teams match your search criteria."
                : "Organize your event by creating specialized groups for logistics, technical, marketing, or hospitality."}
            </p>
          </div>
          {isOrganizer && (localEventId || globalEventId) && (
            <Link href={`/teams/create?eventId=${localEventId || globalEventId}`}>
              <Button
                variant="primary"
                size="md"
                className="bg-[#28c740] hover:bg-[#23b33a] text-white font-bold text-xs"
              >
                + Create First Team
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTeams.map((team) => {
            const isTeamLeader =
              currentUser?.userId === (team.leader as any)?.eventMember?.userId ||
              team.leaderMembershipId === (team.leader as any)?.teamMembershipId;

            return (
              <TeamCard
                key={team.teamId}
                team={team}
                isOrganizer={isOrganizer}
                isTeamLeader={isTeamLeader}
                onManageMembers={(t) => setActiveManageTeam(t)}
                onDelete={(t) => setActiveDeleteTeam(t)}
              />
            );
          })}
        </div>
      )}

      {/* Modals */}
      <ManageTeamMembersModal
        isOpen={Boolean(activeManageTeam)}
        team={activeManageTeam}
        isOrganizer={isOrganizer}
        isTeamLeader={
          currentUser?.userId === (activeManageTeam?.leader as any)?.eventMember?.userId
        }
        onClose={() => setActiveManageTeam(null)}
        onUpdated={loadData}
      />

      <DeleteTeamModal
        isOpen={Boolean(activeDeleteTeam)}
        team={activeDeleteTeam}
        onClose={() => setActiveDeleteTeam(null)}
        onConfirm={handleDeleteTeam}
      />
    </div>
  );
};
