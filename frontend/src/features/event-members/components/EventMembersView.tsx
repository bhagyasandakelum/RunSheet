"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { eventMemberService } from "@/services/event-member-service";
import { teamService } from "@/services/team-service";
import { useEvent } from "@/providers/event-provider";
import { Button } from "@/components/ui/button";
import { EventMembersTable, FormattedMember } from "./EventMembersTable";

export interface EventMembersViewProps {
  initialEventId?: string;
}

export const EventMembersView: React.FC<EventMembersViewProps> = ({ initialEventId }) => {
  const { events, selectedEventId: globalEventId, setSelectedEventId } = useEvent();

  const [selectedEventId, setLocalSelectedEventId] = useState<string>(
    initialEventId || globalEventId || ""
  );
  const [members, setMembers] = useState<FormattedMember[]>([]);
  const [teamsList, setTeamsList] = useState<string[]>([]);
  const [totalTasksCount, setTotalTasksCount] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (globalEventId && !initialEventId) {
      setLocalSelectedEventId(globalEventId);
    }
  }, [globalEventId, initialEventId]);

  const loadData = useCallback(async () => {
    const activeId = selectedEventId || globalEventId;
    if (!activeId) {
      setMembers([]);
      setTeamsList([]);
      setTotalTasksCount(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [membersData, teamsData] = await Promise.allSettled([
        eventMemberService.getEventMembers(activeId),
        teamService.getTeamsByEvent(activeId),
      ]);

      if (membersData.status === "fulfilled") {
        const rawMembers: FormattedMember[] = (membersData.value as any) || [];
        setMembers(rawMembers);
      }

      if (teamsData.status === "fulfilled") {
        const teamItems = (teamsData.value as any[]) || [];
        setTeamsList(teamItems.map((t) => t.teamName));
        const tasksSum = teamItems.reduce((acc, t) => acc + (t.taskCount || t.tasks?.length || 0), 0);
        setTotalTasksCount(tasksSum);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load event members.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedEventId, globalEventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEventChange = (eventId: string) => {
    setLocalSelectedEventId(eventId);
    setSelectedEventId(eventId);
  };

  const handleRemoveMember = async (memberId: string) => {
    const activeId = selectedEventId || globalEventId;
    if (!activeId) return;
    await eventMemberService.removeMember(activeId, memberId);
    loadData();
  };

  const handleExport = () => {
    const activeId = selectedEventId || globalEventId;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(members, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `team_members_${activeId || "export"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Metrics
  const totalMembersCount = members.length;
  const teamsAssignedCount = members.filter((m) => Boolean(m.teamName)).length;
  const unassignedCount = members.filter((m) => !m.teamName).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Team Members
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Manage volunteers and staffing allocations participating across specialized teams in this event.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {events.length > 0 && (
            <select
              value={selectedEventId}
              onChange={(e) => handleEventChange(e.target.value)}
              className="h-10 px-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-[#131B2E] text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 shadow-xs"
            >
              {events.map((evt) => (
                <option key={evt.eventId} value={evt.eventId}>
                  {evt.eventName}
                </option>
              ))}
            </select>
          )}

          <Button
            variant="outline"
            size="md"
            onClick={handleExport}
            className="text-xs font-semibold"
            leftIcon={
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            }
          >
            Export Members
          </Button>

          <div className="relative group/invite">
            {teamsList.length > 0 ? (
              <Link href="/invitations/create">
                <Button
                  variant="primary"
                  size="md"
                  className="bg-[#44D944] hover:bg-[#3bc43b] text-slate-950 font-bold shadow-xs"
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  }
                >
                  Invite Member
                </Button>
              </Link>
            ) : (
              <Button
                variant="primary"
                size="md"
                disabled
                className="bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed font-bold"
                leftIcon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                Invite Member
              </Button>
            )}
            {teamsList.length === 0 && (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/invite:block px-2.5 py-1 text-[11px] font-semibold text-white bg-slate-900 border border-slate-700 rounded-lg whitespace-nowrap shadow-lg z-30">
                Create a team first before inviting members
              </span>
            )}
          </div>
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

      {/* Inline Summary */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
        <div>
          <span>Total Members: </span>
          <span className="font-bold text-slate-900 dark:text-white">{totalMembersCount}</span>
        </div>
        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
        <div>
          <span>Assigned to Teams: </span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{teamsAssignedCount}</span>
        </div>
        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
        <div>
          <span>Unassigned: </span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">{unassignedCount}</span>
        </div>
      </div>

      {/* Main Table: Full-Width Clean Table */}
      <div className="space-y-6">
        <EventMembersTable
          members={members}
          onRemoveMember={handleRemoveMember}
          isLoading={isLoading}
          teamsList={teamsList}
        />
      </div>
    </div>
  );
};
