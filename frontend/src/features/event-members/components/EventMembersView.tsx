"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { eventMemberService } from "@/services/event-member-service";
import { eventService } from "@/services/event-service";
import { teamService } from "@/services/team-service";
import { Event } from "@/types/common/entities";
import { Button } from "@/components/ui/button";
import { EventMembersStatsCards } from "./EventMembersStatsCards";
import { EventMembersTable, FormattedMember } from "./EventMembersTable";
import { RecentlyJoinedPanel } from "./RecentlyJoinedPanel";
import { TeamDistributionDonut, TeamDistributionItem } from "./TeamDistributionDonut";

export interface EventMembersViewProps {
  initialEventId?: string;
}

export const EventMembersView: React.FC<EventMembersViewProps> = ({ initialEventId }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>(initialEventId || "");
  const [members, setMembers] = useState<FormattedMember[]>([]);
  const [teamsList, setTeamsList] = useState<string[]>([]);
  const [teamDistribution, setTeamDistribution] = useState<TeamDistributionItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const eventsList = await eventService.getMyEvents();
      setEvents(eventsList);

      const activeId = selectedEventId || (eventsList.length > 0 ? eventsList[0].eventId : "");
      if (activeId) {
        setSelectedEventId(activeId);

        const [membersData, teamsData] = await Promise.allSettled([
          eventMemberService.getEventMembers(activeId),
          teamService.getTeamsByEvent(activeId),
        ]);

        if (membersData.status === "fulfilled") {
          const rawMembers: FormattedMember[] = (membersData.value as any) || [];
          setMembers(rawMembers);

          // Compute team distribution
          const counts: Record<string, number> = {};
          let unassigned = 0;

          rawMembers.forEach((m) => {
            if (m.teamName) {
              counts[m.teamName] = (counts[m.teamName] || 0) + 1;
            } else {
              unassigned += 1;
            }
          });

          const palette = ["#38bdf8", "#22c55e", "#f59e0b", "#a855f7", "#ec4899", "#6366f1"];
          const dist: TeamDistributionItem[] = Object.keys(counts).map((tName, i) => ({
            teamName: tName,
            memberCount: counts[tName],
            color: palette[i % palette.length],
          }));

          if (unassigned > 0) {
            dist.push({
              teamName: "Unassigned",
              memberCount: unassigned,
              color: "#94a3b8",
            });
          }

          setTeamDistribution(dist);
        }

        if (teamsData.status === "fulfilled") {
          setTeamsList((teamsData.value as any[]).map((t) => t.teamName));
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load event members.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEventChange = (eventId: string) => {
    setSelectedEventId(eventId);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedEventId) return;
    await eventMemberService.removeMember(selectedEventId, memberId);
    loadData();
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(members, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `event_members_${selectedEventId || "export"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Metrics
  const totalMembersCount = members.length;
  const teamsAssignedCount = members.filter((m) => Boolean(m.teamName)).length;
  const unassignedCount = members.filter((m) => !m.teamName).length;
  const totalTasksCount = Math.round(totalMembersCount * 1.8);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Event Members
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Manage volunteers and staffing allocations participating in this event.
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
                  📅 {evt.eventName}
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

          <Link href="/invitations/create">
            <Button
              variant="primary"
              size="md"
              className="bg-[#28c740] hover:bg-[#23b33a] text-white font-bold"
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
            >
              Invite Member
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* 4 Stats Cards */}
      <EventMembersStatsCards
        totalMembers={totalMembersCount}
        teamsAssigned={teamsAssignedCount}
        totalTasks={totalTasksCount}
        unassignedCount={unassignedCount}
      />

      {/* Main Grid: Table left (2/3), Recently Joined & Team Donut right (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <EventMembersTable
            members={members}
            onRemoveMember={handleRemoveMember}
            isLoading={isLoading}
            teamsList={teamsList}
          />
        </div>

        <div className="space-y-6 lg:sticky lg:top-20">
          <RecentlyJoinedPanel members={members} />
          <TeamDistributionDonut
            distribution={teamDistribution}
            totalMembers={totalMembersCount}
          />
        </div>
      </div>
    </div>
  );
};
