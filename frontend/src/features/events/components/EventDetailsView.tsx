"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { dashboardService, OrganizerDashboard } from "@/services/dashboard-service";
import { eventService } from "@/services/event-service";
import { Event } from "@/types/common/entities";
import { EventStatus } from "@/types/common/enums";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { InviteMembersModal } from "./InviteMembersModal";
import { CreateTeamModal } from "./CreateTeamModal";

export interface EventDetailsViewProps {
  eventId: string;
}

export const EventDetailsView: React.FC<EventDetailsViewProps> = ({ eventId }) => {
  const [eventData, setEventData] = useState<Event | null>(null);
  const [dashboardData, setDashboardData] = useState<OrganizerDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);

  const fetchDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [eventRes, dashRes] = await Promise.allSettled([
        eventService.getEventDetails(eventId),
        dashboardService.getOrganizerDashboard(eventId),
      ]);

      if (eventRes.status === "fulfilled") {
        setEventData(eventRes.value);
      } else {
        throw new Error(eventRes.reason?.response?.data?.message || "Failed to load event");
      }

      if (dashRes.status === "fulfilled") {
        setDashboardData(dashRes.value);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load event details");
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Spinner size="lg" className="text-emerald-500" />
        <p className="text-xs text-slate-500 font-medium">Loading event details...</p>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="p-8 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 max-w-xl mx-auto text-center space-y-4 my-12">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold text-red-950 dark:text-red-200">Unable to load event</h3>
          <p className="text-xs text-red-700 dark:text-red-400 mt-1">{error || "Event not found."}</p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link href="/events">
            <Button variant="secondary" size="sm">Back to Events</Button>
          </Link>
          <Button variant="primary" size="sm" onClick={fetchDetails}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Format Dates
  const startDate = new Date(eventData.startDate);
  const endDate = new Date(eventData.endDate);
  const formattedDates = `${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  // Summary Metrics with backend data or computed fallbacks
  const activeTeamsCount = dashboardData?.eventSummary?.totalTeams ?? (eventData as any).teamCount ?? 0;
  const totalMembersCount = dashboardData?.eventSummary?.totalMembers ?? (eventData as any).memberCount ?? 0;
  const totalTasksCount = dashboardData?.eventSummary?.totalTasks ?? (eventData as any).taskCount ?? 0;
  const completionPercentage = dashboardData?.overallProgress ?? dashboardData?.taskSummary?.completedPercentage ?? 0;

  const completedTasks = dashboardData?.taskSummary?.completedTasks ?? 0;
  const inProgressTasks = dashboardData?.taskSummary?.inProgressTasks ?? 0;
  const criticalOrOverdue = (dashboardData?.taskSummary?.overdueTasks ?? 0) + (dashboardData?.criticalTasks?.length ?? 0);

  const teams = dashboardData?.teamSummary || [];
  const criticalTasks = dashboardData?.criticalTasks || [];

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case EventStatus.Active:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold tracking-wider uppercase backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            ACTIVE EVENT
          </span>
        );
      case EventStatus.Planning:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-bold tracking-wider uppercase backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            PLANNING
          </span>
        );
      case EventStatus.Draft:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/20 text-slate-300 border border-slate-400/30 text-xs font-bold tracking-wider uppercase backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            DRAFT
          </span>
        );
      case EventStatus.Completed:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-bold tracking-wider uppercase backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            COMPLETED
          </span>
        );
      default:
        return (
          <Badge variant="neutral" size="sm" className="uppercase">
            {status}
          </Badge>
        );
    }
  };

  const getTeamColor = (index: number) => {
    const colors = [
      { bg: "bg-blue-500", light: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-600 dark:text-blue-400", bar: "from-blue-500 to-indigo-500" },
      { bg: "bg-cyan-500", light: "bg-cyan-50 dark:bg-cyan-950/40", text: "text-cyan-600 dark:text-cyan-400", bar: "from-cyan-500 to-teal-500" },
      { bg: "bg-amber-500", light: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-600 dark:text-amber-400", bar: "from-amber-500 to-orange-500" },
      { bg: "bg-emerald-500", light: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-600 dark:text-emerald-400", bar: "from-emerald-500 to-teal-500" },
      { bg: "bg-purple-500", light: "bg-purple-50 dark:bg-purple-950/40", text: "text-purple-600 dark:text-purple-400", bar: "from-purple-500 to-pink-500" },
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* 1. Top Hero Header Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 dark:bg-slate-950 border border-slate-800 shadow-md select-none">
        {/* Banner Content */}
        <div className="relative z-10 p-6 sm:p-8 space-y-6">
          {/* Top Bar: Meta pills & Action Buttons */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              {getStatusBadge(eventData.status)}

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 text-slate-200 text-xs font-semibold border border-slate-700/80">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formattedDates}</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 text-slate-200 text-xs font-semibold border border-slate-700/80">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{eventData.venue}</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
              <Link href={`/events/${eventId}/edit`}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                  leftIcon={
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  }
                >
                  Edit Event
                </Button>
              </Link>

              <div className="relative group/invite">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={activeTeamsCount === 0}
                  onClick={() => {
                    if (activeTeamsCount > 0) {
                      setIsInviteOpen(true);
                    }
                  }}
                  className={`border-slate-700 ${
                    activeTeamsCount === 0
                      ? "bg-slate-800/40 text-slate-500 cursor-not-allowed"
                      : "bg-slate-800 hover:bg-slate-700 text-white"
                  }`}
                  leftIcon={
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  }
                >
                  Invite Members
                </Button>
                {activeTeamsCount === 0 && (
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/invite:block px-2.5 py-1 text-[11px] font-semibold text-white bg-slate-900 border border-slate-700 rounded-lg whitespace-nowrap shadow-lg z-30">
                    Create a team first before inviting members
                  </span>
                )}
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateTeamOpen(true)}
                className="bg-[#44D944] text-slate-950 font-bold hover:brightness-105 shadow-xs"
                leftIcon={
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                Create Team
              </Button>
            </div>
          </div>

          {/* Event Title & Subtitle */}
          <div className="max-w-3xl space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {eventData.eventName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              {eventData.description ||
                "Live operational event dashboard. Monitor task progress, team execution, and critical items in real-time."}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Inline Summary & Progress Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Tasks: </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {completedTasks} / {totalTasksCount} completed
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 ml-1">
                ({completionPercentage}%)
              </span>
            </div>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
            <div>
              <span className="text-slate-500 dark:text-slate-400">In Progress: </span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">{inProgressTasks}</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Teams: </span>
              <span className="font-semibold text-slate-900 dark:text-white">{activeTeamsCount}</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Members: </span>
              <span className="font-semibold text-slate-900 dark:text-white">{totalMembersCount}</span>
            </div>
          </div>

          {criticalOrOverdue > 0 && (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>{criticalOrOverdue} urgent items</span>
            </div>
          )}
        </div>

        {/* Slim Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-[#44D944] rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* 3. Critical Actions Section (if any exist) */}
      {criticalTasks.length > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Urgent Tasks Requiring Attention</span>
            </h3>
            <span className="text-xs text-slate-400">{criticalTasks.length} items</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {criticalTasks.map((task, idx) => (
              <div
                key={task.taskId || idx}
                className="py-2.5 flex items-center justify-between gap-4 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">
                    {task.taskTitle}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {task.team} · {task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : "Urgent"}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-400 font-semibold text-[10px] shrink-0">
                  {task.priority || "Critical"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Bottom Section: Team Operational Status */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              Team Operational Status
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live task execution and staffing readiness per team.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCreateTeamOpen(true)}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
          >
            + Add Team
          </Button>
        </div>

        {/* Team Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {teams.length > 0 ? (
            teams.map((team, idx) => {
              const color = getTeamColor(idx);
              const letter = team.teamName ? team.teamName[0].toUpperCase() : "T";
              const progress = team.completionPercentage ?? 0;

              return (
                <div
                  key={team.teamId || idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/80 space-y-3 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${color.bg} text-white font-black text-sm flex items-center justify-center shadow-xs`}>
                        {letter}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {team.teamName}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {team.memberCount} members • {team.totalTasks} tasks
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {progress}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${color.bar} rounded-full transition-all duration-500`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-8 text-center text-xs text-slate-400 font-medium">
              No teams created for this event yet.
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <InviteMembersModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        eventId={eventId}
        eventName={eventData.eventName}
        onSuccess={fetchDetails}
      />

      <CreateTeamModal
        isOpen={isCreateTeamOpen}
        onClose={() => setIsCreateTeamOpen(false)}
        eventId={eventId}
        eventName={eventData.eventName}
        onSuccess={fetchDetails}
      />
    </div>
  );
};
