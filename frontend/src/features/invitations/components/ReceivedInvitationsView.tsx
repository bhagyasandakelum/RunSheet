"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { invitationService } from "@/services/invitation-service";
import { useEvent } from "@/providers/event-provider";
import { Invitation } from "@/types/common/entities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

export const ReceivedInvitationsView: React.FC = () => {
  const router = useRouter();
  const { refreshEvents, setSelectedEventId } = useEvent();

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "Pending" | "Accepted" | "Rejected">("ALL");

  const loadInvitations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await invitationService.getMyInvitations();
      setInvitations(data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load received invitations.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvitations();
  }, [loadInvitations]);

  const handleAccept = async (invitation: Invitation) => {
    try {
      setActionLoadingId(invitation.invitationId);
      setError(null);
      setSuccessMessage(null);

      await invitationService.acceptInvitation(invitation.invitationId);

      // Refresh events so newly joined event appears in context
      await refreshEvents();
      setSelectedEventId(invitation.eventId);

      setSuccessMessage(`Successfully joined "${invitation.eventName || "the event"}"!`);
      await loadInvitations();

      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to accept invitation.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (invitationId: string) => {
    try {
      setActionLoadingId(invitationId);
      setError(null);
      await invitationService.rejectInvitation(invitationId);
      await loadInvitations();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to decline invitation.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingList = invitations.filter((i) => i.status === "Pending");
  const acceptedList = invitations.filter((i) => i.status === "Accepted");
  const filteredList = invitations.filter((i) => {
    if (filter === "ALL") return true;
    return i.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge variant="warning" size="sm">Pending Response</Badge>;
      case "Accepted":
        return <Badge variant="success" size="sm">Accepted</Badge>;
      case "Rejected":
        return <Badge variant="error" size="sm">Declined</Badge>;
      case "Expired":
        return <Badge variant="neutral" size="sm">Expired</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if Success */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span>{successMessage}</span>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => router.push("/dashboard")}
            className="bg-[#28c740] hover:bg-[#23b33a] text-white text-[11px] font-bold"
          >
            Go to Event Dashboard →
          </Button>
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

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pending Invitations
            </p>
            <p className="text-2xl font-black text-amber-500 mt-0.5">
              {pendingList.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Accepted Events
            </p>
            <p className="text-2xl font-black text-emerald-500 mt-0.5">
              {acceptedList.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Received
            </p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-200 mt-0.5">
              {invitations.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(["ALL", "Pending", "Accepted", "Rejected"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === tab
                ? "bg-emerald-500 text-white shadow-xs"
                : "bg-white dark:bg-[#131B2E] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800"
            }`}
          >
            {tab === "ALL" ? "All Invitations" : tab}
          </button>
        ))}
      </div>

      {/* Invitations List / Cards */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] space-y-3">
          <Spinner size="lg" className="text-emerald-500" />
          <p className="text-xs text-slate-500 font-medium">Checking received invitations...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            No received invitations
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            When event organizers invite you to join their event or team, invitations will appear here for you to accept or decline.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredList.map((inv) => {
            const isPending = inv.status === "Pending";
            const isAccepted = inv.status === "Accepted";
            const expiresDate = new Date(inv.expiresAt);
            const isExpired = expiresDate <= new Date() && isPending;
            const isActionLoading = actionLoadingId === inv.invitationId;

            let formattedStartDate = "";
            let formattedEndDate = "";
            if (inv.eventStartDate) {
              formattedStartDate = new Date(inv.eventStartDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
            }
            if (inv.eventEndDate) {
              formattedEndDate = new Date(inv.eventEndDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
            }

            return (
              <div
                key={inv.invitationId}
                className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4 hover:border-emerald-500/30 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar: Event Name & Status Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Event Invitation
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                        {inv.eventName || inv.event?.eventName || "Event Operations"}
                      </h3>
                    </div>
                    {getStatusBadge(isExpired ? "Expired" : inv.status)}
                  </div>

                  {/* Organizer & Event Meta Info */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Organizer</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {inv.organizerName || "Organizer"}
                      </span>
                    </div>

                    {(inv.eventVenue || inv.event?.venue) && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Venue</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                          {inv.eventVenue || inv.event?.venue}
                        </span>
                      </div>
                    )}

                    {formattedStartDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Dates</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {formattedStartDate} {formattedEndDate ? `– ${formattedEndDate}` : ""}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/40 dark:border-slate-800/60 text-[11px]">
                      <span className="text-slate-400">Valid Until</span>
                      <span className="font-medium text-slate-500 dark:text-slate-400">
                        {expiresDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Optional Description */}
                  {(inv.eventDescription || inv.event?.description) && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {inv.eventDescription || inv.event?.description}
                    </p>
                  )}
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2.5">
                  {isPending && !isExpired && (
                    <>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={isActionLoading}
                        onClick={() => handleReject(inv.invitationId)}
                        className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      >
                        Decline
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        isLoading={isActionLoading}
                        onClick={() => handleAccept(inv)}
                        className="bg-[#28c740] hover:bg-[#23b33a] text-white font-bold text-xs"
                      >
                        Accept Invitation
                      </Button>
                    </>
                  )}

                  {isAccepted && (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSelectedEventId(inv.eventId);
                        router.push("/dashboard");
                      }}
                      className="bg-[#28c740] hover:bg-[#23b33a] text-white font-bold text-xs"
                    >
                      View in Dashboard →
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
