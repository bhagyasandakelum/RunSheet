"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { invitationService } from "@/services/invitation-service";
import { eventService } from "@/services/event-service";
import { Event, Invitation } from "@/types/common/entities";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { InvitationStatsCards } from "./InvitationStatsCards";
import { InvitationsTable } from "./InvitationsTable";
import { ExpiringSoonPanel } from "./ExpiringSoonPanel";

export interface InvitationManagementViewProps {
  initialEventId?: string;
}

export const InvitationManagementView: React.FC<InvitationManagementViewProps> = ({
  initialEventId,
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>(initialEventId || "");
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load events
  const loadEventsAndInvitations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const eventsList = await eventService.getMyEvents();
      setEvents(eventsList);

      const activeId = selectedEventId || (eventsList.length > 0 ? eventsList[0].eventId : "");
      if (activeId) {
        setSelectedEventId(activeId);
        const invs = await invitationService.getEventInvitations(activeId);
        setInvitations(invs);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load invitations.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    loadEventsAndInvitations();
  }, [loadEventsAndInvitations]);

  const handleEventChange = async (eventId: string) => {
    setSelectedEventId(eventId);
    try {
      setIsLoading(true);
      const invs = await invitationService.getEventInvitations(eventId);
      setInvitations(invs);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load invitations for this event.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async (email: string) => {
    if (!selectedEventId) return;
    try {
      await invitationService.inviteUser(selectedEventId, { email });
      const updated = await invitationService.getEventInvitations(selectedEventId);
      setInvitations(updated);
    } catch {
      // Error handled
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(invitations, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `invitations_${selectedEventId || "export"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Compute metric counts
  const pendingCount = invitations.filter((i) => i.status === "Pending").length;
  const acceptedCount = invitations.filter((i) => i.status === "Accepted").length;
  const rejectedCount = invitations.filter((i) => i.status === "Rejected").length;
  const expiredCount = invitations.filter((i) => i.status === "Expired").length;

  const selectedEvent = events.find((e) => e.eventId === selectedEventId);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Invitation Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Invite volunteers and track invitation responses for your event.
          </p>
        </div>

        {/* Top Controls: Event Selector, Export, Invite Button */}
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
            Export
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
      <InvitationStatsCards
        pendingCount={pendingCount}
        acceptedCount={acceptedCount}
        rejectedCount={rejectedCount}
        expiredCount={expiredCount}
      />

      {/* Main Grid: Invitations Table left (2/3), Expiring Soon Panel right (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <InvitationsTable
            invitations={invitations}
            onResend={handleResend}
            isLoading={isLoading}
          />
        </div>

        <div className="space-y-6 lg:sticky lg:top-20">
          <ExpiringSoonPanel
            invitations={invitations}
            onResend={handleResend}
          />
        </div>
      </div>
    </div>
  );
};
