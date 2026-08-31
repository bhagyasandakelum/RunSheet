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
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl select-none">
        {/* Banner Graphic Background with Architectural Lines & Grid */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-950 z-0">
          <svg className="w-full h-full opacity-15 object-cover" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 300" preserveAspectRatio="none">
            <line x1="0" y1="50" x2="1000" y2="50" stroke="#38bdf8" strokeWidth="1" />
            <line x1="0" y1="150" x2="1000" y2="150" stroke="#38bdf8" strokeWidth="1" />
            <line x1="0" y1="250" x2="1000" y2="250" stroke="#38bdf8" strokeWidth="1" />
            <line x1="200" y1="0" x2="200" y2="300" stroke="#38bdf8" strokeWidth="1" />
            <line x1="500" y1="0" x2="500" y2="300" stroke="#38bdf8" strokeWidth="1" />
            <line x1="800" y1="0" x2="800" y2="300" stroke="#38bdf8" strokeWidth="1" />
            {/* Perspective Building Wireframe */}
            <polygon points="700,20 950,50 950,280 700,260" fill="none" stroke="#60a5fa" strokeWidth="2" />
            <polygon points="720,40 930,70 930,260 720,240" fill="none" stroke="#60a5fa" strokeWidth="1" />
            <text x="750" y="140" fill="#94a3b8" fontSize="18" fontFamily="sans-serif" fontWeight="bold" letterSpacing="4">
              {eventData.venue.toUpperCase()}
            </text>
            <text x="750" y="170" fill="#38bdf8" fontSize="24" fontFamily="sans-serif" fontWeight="900" letterSpacing="2">
              {eventData.eventName.toUpperCase()}
            </text>
          </svg>
        </div>

        {/* Banner Content */}
        <div className="relative z-10 p-6 sm:p-8 space-y-6">
          {/* Top Bar: Meta pills & Action Buttons */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              {getStatusBadge(eventData.status)}

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-md border border-white/15">
                <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formattedDates}</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-md border border-white/15">
                <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
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
                  className="bg-white/15 hover:bg-white/25 text-white border-white/20 backdrop-blur-md"
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
                  className={`border-white/20 backdrop-blur-md ${
                    activeTeamsCount === 0
                      ? "bg-white/10 text-white/40 cursor-not-allowed"
                      : "bg-white/15 hover:bg-white/25 text-white"
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
                className="bg-[#28c740] hover:bg-[#23b33a] text-white font-bold"
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
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {eventData.eventName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              {eventData.description ||
                "Global convention for artificial intelligence researchers, engineers, and enterprise leaders. High-priority operations must be monitored in real-time."}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Four Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: TEAMS ACTIVE */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between transition-all hover:shadow-md">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Teams Active
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {activeTeamsCount}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200/60 dark:border-sky-800/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>

        {/* Card 2: TOTAL MEMBERS */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between transition-all hover:shadow-md">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Total Members
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {totalMembersCount}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>

        {/* Card 3: TOTAL TASKS */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between transition-all hover:shadow-md">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Total Tasks
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {totalTasksCount}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200/60 dark:border-teal-800/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
        </div>

        {/* Card 4: COMPLETION (Vibrant Green Banner Card) */}
        <div className="p-5 rounded-2xl bg-gradient-to-tr from-[#23b33a] to-[#34d399] text-white shadow-md flex items-center justify-between transition-all hover:shadow-lg">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-100">
              Completion
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {completionPercentage}%
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Donut Completion Card & Critical Action Required */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Donut Progress Card (1 col) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Overall Progress
            </h3>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {completionPercentage}% Done
            </span>
          </div>

          {/* SVG Circular Progress Ring */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-slate-100 dark:text-slate-800"
                />
                {/* Completed Ring (Green) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#28c740"
                  strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionPercentage / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {completionPercentage}%
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Overall
                </span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="space-y-3 w-full">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Completed</span>
                </div>
                <span className="font-extrabold text-slate-900 dark:text-white">{completedTasks}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">In Progress</span>
                </div>
                <span className="font-extrabold text-slate-900 dark:text-white">{inProgressTasks}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Critical / Overdue</span>
                </div>
                <span className="font-extrabold text-slate-900 dark:text-white">{criticalOrOverdue}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Critical Action Required Panel (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 flex items-center justify-center text-xs font-black">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Critical Action Required
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {criticalTasks.length} Urgent Items
            </span>
          </div>

          {/* List of Critical Items */}
          <div className="space-y-3 flex-1 overflow-y-auto max-h-56">
            {criticalTasks.length > 0 ? (
              criticalTasks.map((task, idx) => (
                <div
                  key={task.taskId || idx}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between gap-4 transition-all hover:bg-slate-100 dark:hover:bg-slate-800/40"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {task.taskTitle}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-4 truncate">
                      {task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : "Urgent"} • <span className="font-semibold text-slate-700 dark:text-slate-300">{task.team}</span>
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-800 text-[10px] font-bold text-red-700 dark:text-red-300 uppercase tracking-wider shrink-0">
                    {task.priority || "Critical"}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 font-medium">
                No critical actions required at this time.
              </div>
            )}
          </div>
        </div>
      </div>

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
