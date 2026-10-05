"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useEvent } from "@/providers/event-provider";
import {
  dashboardService,
  OrganizerDashboard,
  MemberDashboard,
} from "@/services/dashboard-service";
import {
  OrganizerHeroBanner,
  TeamPerformanceTable,
  HeroBanner,
  ActionItemsTable,
  MyTeamCard,
  ActiveEventCard,
} from "@/features/dashboard";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/common/page-loader";
import { invitationService } from "@/services/invitation-service";
import { Invitation } from "@/types/common/entities";

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    events,
    selectedEventId,
    selectedEvent,
    userTeamName,
    isOrganizer: isActualOrganizer,
    isLoading: isEventsLoading,
    setSelectedEventId,
    refreshEvents,
  } = useEvent();

  // Active view: defaults to organizer if user organizes this event, else member
  const [viewMode, setViewMode] = useState<"organizer" | "member">("organizer");

  // Data states
  const [organizerData, setOrganizerData] = useState<OrganizerDashboard | null>(null);
  const [memberData, setMemberData] = useState<MemberDashboard | null>(null);
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>([]);
  const [isAcceptingInviteId, setIsAcceptingInviteId] = useState<string | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check for pending received invitations
  const checkPendingInvitations = useCallback(async () => {
    try {
      const invs = await invitationService.getMyInvitations();
      const pending = (invs || []).filter((i) => i.status === "Pending");
      setPendingInvitations(pending);
    } catch {
      // Ignore background check failure
    }
  }, []);

  useEffect(() => {
    checkPendingInvitations();
  }, [checkPendingInvitations]);

  useEffect(() => {
    if (isActualOrganizer) {
      setViewMode("organizer");
    } else {
      setViewMode("member");
    }
  }, [isActualOrganizer, selectedEventId]);

  const loadDashboardData = useCallback(async () => {
    if (!selectedEventId) {
      setOrganizerData(null);
      setMemberData(null);
      setIsLoadingDashboard(false);
      return;
    }

    try {
      setIsLoadingDashboard(true);
      setError(null);

      const [orgRes, memRes] = await Promise.allSettled([
        dashboardService.getOrganizerDashboard(selectedEventId),
        dashboardService.getMemberDashboard(),
      ]);

      if (orgRes.status === "fulfilled") {
        setOrganizerData(orgRes.value);
      } else {
        setOrganizerData(null);
      }

      if (memRes.status === "fulfilled") {
        setMemberData(memRes.value);
      } else {
        setMemberData(null);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load dashboard data.");
    } finally {
      setIsLoadingDashboard(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleQuickAccept = async (invitation: Invitation) => {
    try {
      setIsAcceptingInviteId(invitation.invitationId);
      await invitationService.acceptInvitation(invitation.invitationId);
      await refreshEvents();
      setSelectedEventId(invitation.eventId);
      await checkPendingInvitations();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to accept invitation.");
    } finally {
      setIsAcceptingInviteId(null);
    }
  };

  if (isEventsLoading) {
    return (
      <PageLoader
        message="Loading RunSheet Workspace..."
        subMessage="Synchronizing your events and active team runsheets"
      />
    );
  }

  // 0 Events State
  if (events.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6 space-y-6">
        {/* If user has pending invitations received */}
        {pendingInvitations.length > 0 && (
          <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-500/30 shadow-xs space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                ✉️
              </div>
              <div>
                <h3 className="text-base font-extrabold text-amber-950 dark:text-amber-200">
                  You Have {pendingInvitations.length} Pending Event Invitation{pendingInvitations.length > 1 ? "s" : ""}!
                </h3>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                  An organizer has invited you to collaborate as a team member. Accept below to access the event runsheet.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {pendingInvitations.map((inv) => (
                <div
                  key={inv.invitationId}
                  className="p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {inv.eventName || "Event Operations"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Invited by: <span className="font-semibold text-slate-700 dark:text-slate-300">{inv.organizerName || "Organizer"}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="primary"
                      isLoading={isAcceptingInviteId === inv.invitationId}
                      onClick={() => handleQuickAccept(inv)}
                      className="bg-[#44D944] text-slate-950 font-bold text-xs hover:brightness-105 shadow-xs"
                    >
                      Accept & Join
                    </Button>
                    <Link href="/invitations">
                      <Button size="sm" variant="secondary" className="text-xs">
                        Review Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-8 text-center bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#44D944]/10 border border-[#44D944]/20 text-[#44D944] flex items-center justify-center mx-auto">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Create Your First Event
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Organize events, create teams, assign tasks, and track team members in real time.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/events/create">
              <Button
                variant="primary"
                size="lg"
                className="bg-[#44D944] text-slate-950 font-bold text-xs px-6 hover:brightness-105 shadow-xs"
              >
                + Create New Event
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Resolved user display name
  const userName = user ? `${user.firstName} ${user.lastName}` : "User";

  // Resolved Organizer stats
  const eventSummary = organizerData?.eventSummary;
  const taskSummary = organizerData?.taskSummary;
  const teamList = organizerData?.teamSummary || [];

  const eventName = selectedEvent?.eventName || eventSummary?.eventName || "Event Operations";
  const venue = selectedEvent?.venue || eventSummary?.venue || "Venue not specified";

  let daysRemaining = 0;
  if (selectedEvent?.startDate) {
    const diffTime = new Date(selectedEvent.startDate).getTime() - new Date().getTime();
    daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  } else if (eventSummary?.daysRemaining !== undefined) {
    daysRemaining = eventSummary.daysRemaining;
  }

  const organizerMetrics = {
    teamsCount: eventSummary?.totalTeams ?? 0,
    membersCount: eventSummary?.totalMembers ?? 0,
    totalTasks: eventSummary?.totalTasks ?? 0,
    completedTasks: taskSummary?.completedTasks ?? 0,
    completionPercentage: taskSummary?.completedPercentage ?? 0,
    pendingInvites: 0,
    overdueTasks: taskSummary?.overdueTasks ?? 0,
  };

  const statusDistribution = {
    pending: taskSummary?.pendingTasks ?? 0,
    inProgress: taskSummary?.inProgressTasks ?? 0,
    completed: taskSummary?.completedTasks ?? 0,
    overdue: taskSummary?.overdueTasks ?? 0,
  };

  const priorityLevels = {
    low: organizerData?.prioritySummary?.low ?? 0,
    medium: organizerData?.prioritySummary?.medium ?? 0,
    high: organizerData?.prioritySummary?.high ?? 0,
    critical: organizerData?.prioritySummary?.critical ?? 0,
  };

  const teamsPerformanceData = teamList.map((t) => ({
    teamId: t.teamId,
    teamName: t.teamName,
    leaderName: t.leaderName || "Unassigned",
    memberCount: t.memberCount,
    completedTasks: t.completedTasks,
    totalTasks: t.totalTasks,
    completionPercentage: t.completionPercentage,
    status:
      t.status ||
      (t.completionPercentage >= 100
        ? ("Completed" as const)
        : t.completionPercentage >= 70
        ? ("On Track" as const)
        : ("At Risk" as const)),
  }));

  // Member View statistics
  const memberUserName = user?.firstName || "Member";
  const memberTeamName = userTeamName || memberData?.profile?.team || "Event Team";
  const memberEventName = selectedEvent?.eventName || "Event Operations";

  const memberStats = {
    assigned: memberData?.taskSummary?.assigned ?? 0,
    completed: memberData?.taskSummary?.completed ?? 0,
    pending: memberData?.taskSummary?.pending ?? 0,
    overdue: memberData?.taskSummary?.overdue ?? 0,
    assignedTrend: memberData?.taskSummary?.assignedTrend || "Assigned to you",
    completedTrend: memberData?.taskSummary?.completedTrend || "Completed tasks",
    pendingTrend: memberData?.taskSummary?.pendingTrend || "Awaiting action",
    overdueTrend: memberData?.taskSummary?.overdueTrend || "Overdue items",
  };

  return (
    <div className="space-y-6 select-none pb-12">
      {/* Top Role / Perspective Switcher Pill */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode("organizer")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === "organizer"
                ? "bg-[#44D944] text-slate-950 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Organizer Dashboard</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("member")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === "member"
                ? "bg-[#44D944] text-slate-950 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Member Dashboard</span>
          </button>
        </div>
      </div>

      {/* Pending Invitations Alert Banner */}
      {pendingInvitations.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-base">✉️</span>
            <span className="font-bold text-amber-900 dark:text-amber-200">
              You have {pendingInvitations.length} pending event invitation{pendingInvitations.length > 1 ? "s" : ""} waiting for your response.
            </span>
          </div>
          <Link href="/invitations">
            <Button size="sm" variant="primary" className="bg-[#44D944] text-slate-950 font-bold text-xs hover:brightness-105 shadow-xs">
              Review & Accept →
            </Button>
          </Link>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
          <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {isLoadingDashboard ? (
        <PageLoader
          message="Updating Dashboard Analytics..."
          subMessage="Fetching latest metrics, team performance, and task statuses"
        />
      ) : viewMode === "organizer" ? (
        /* ========================================================= */
        /* 1. ORGANIZER DASHBOARD                                   */
        /* ========================================================= */
        <div className="space-y-6">
          <OrganizerHeroBanner
            userName={userName}
            eventName={eventName}
            venue={venue}
            daysRemaining={daysRemaining}
            status={selectedEvent?.status ? `${selectedEvent.status} Event` : "Active Event"}
          />

          {/* Inline Summary Bar */}
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3 px-4 bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 dark:text-slate-400">Tasks:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {organizerMetrics.completedTasks} / {organizerMetrics.totalTasks} completed
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  ({organizerMetrics.completionPercentage}%)
                </span>
              </div>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 dark:text-slate-400">In Progress:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {statusDistribution.inProgress}
                </span>
              </div>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 dark:text-slate-400">Pending:</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {statusDistribution.pending}
                </span>
              </div>
              {organizerMetrics.overdueTasks > 0 && (
                <>
                  <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 dark:text-slate-400">Overdue:</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      {organizerMetrics.overdueTasks}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <span>{organizerMetrics.teamsCount} teams</span>
              <span>·</span>
              <span>{organizerMetrics.membersCount} members</span>
            </div>
          </div>

          {/* Main Table: Team Performance & Work Breakdown */}
          <TeamPerformanceTable teams={teamsPerformanceData} />
        </div>
      ) : (
        /* ========================================================= */
        /* 2. MEMBER DASHBOARD VIEW                                 */
        /* ========================================================= */
        <div className="space-y-6">
          <HeroBanner
            userName={memberUserName}
            teamName={memberTeamName}
            eventName={memberEventName}
          />

          {/* Inline Member Summary Bar */}
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3 px-4 bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 dark:text-slate-400">Assigned Tasks:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {memberStats.assigned}
                </span>
              </div>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 dark:text-slate-400">Completed:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {memberStats.completed}
                </span>
              </div>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 dark:text-slate-400">Pending Action:</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {memberStats.pending}
                </span>
              </div>
              {memberStats.overdue > 0 && (
                <>
                  <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 dark:text-slate-400">Overdue:</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      {memberStats.overdue}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Items List */}
          <ActionItemsTable items={memberData?.actionItems || []} />

          {/* Team and Active Event Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MyTeamCard team={memberData?.myTeam} />
            <ActiveEventCard event={memberData?.activeEvent} />
          </div>
        </div>
      )}
    </div>
  );
}
