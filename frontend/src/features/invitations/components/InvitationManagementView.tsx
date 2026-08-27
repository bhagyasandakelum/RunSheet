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
import { ReceivedInvitationsView } from "./ReceivedInvitationsView";

export interface InvitationManagementViewProps {
  initialEventId?: string;
}

export const InvitationManagementView: React.FC<InvitationManagementViewProps> = ({
  initialEventId,
}) => {
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>(initialEventId || "");
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [pendingReceivedCount, setPendingReceivedCount] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load received invitations count
  useEffect(() => {
    const fetchReceivedCount = async () => {
      try {
        const myInvs = await invitationService.getMyInvitations();
        const pending = (myInvs || []).filter((i) => i.status === "Pending").length;
        setPendingReceivedCount(pending);
        // If user has pending invitations or no organized events, default to received tab
        if (pending > 0) {
          setActiveTab("received");
        }
      } catch {
        // Ignored
      }
    };
    fetchReceivedCount();
  }, []);

  // Load events & sent invitations
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

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Invitations Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Manage received event invitations and track team volunteer responses.
          </p>
        </div>

        {/* Tab switcher: Received vs Sent */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab("received")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "received"
                ? "bg-[#28C740] text-slate-950 shadow-sm shadow-[#28C740]/25"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Received Invitations</span>
            {pendingReceivedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                {pendingReceivedCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sent")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "sent"
                ? "bg-[#28C740] text-slate-950 shadow-sm shadow-[#28C740]/25"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span>Sent Invitations (Organizer)</span>
          </button>
        </div>
      </div>

      {activeTab === "received" ? (
        /* ========================================================================= */
        /* TAB 1: RECEIVED INVITATIONS VIEW                                          */
        /* ========================================================================= */
        <ReceivedInvitationsView />
      ) : (
        /* ========================================================================= */
        /* TAB 2: SENT INVITATIONS (ORGANIZER HUB)                                    */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Top Controls: Event Selector, Export, Invite Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Target Event:</span>
              {events.length > 0 ? (
                <select
                  value={selectedEventId}
                  onChange={(e) => handleEventChange(e.target.value)}
                  className="h-9 px-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                >
                  {events.map((evt) => (
                    <option key={evt.eventId} value={evt.eventId}>
                      {evt.eventName}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-xs text-slate-400">No events found</span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="text-xs font-semibold"
                leftIcon={
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                }
              >
                Export JSON
              </Button>

              <Link href="/invitations/create">
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-[#28c740] hover:bg-[#23b33a] text-white font-bold text-xs"
                  leftIcon={
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
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
      )}
    </div>
  );
};

