"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { invitationService } from "@/services/invitation-service";
import { eventService } from "@/services/event-service";
import { Event } from "@/types/common/entities";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { InviteMemberLivePreview } from "./InviteMemberLivePreview";

export interface InviteMemberFormProps {
  initialEventId?: string;
}

export const InviteMemberForm: React.FC<InviteMemberFormProps> = ({ initialEventId }) => {
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>(initialEventId || "");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoadingEvents(true);
      const list = await eventService.getMyEvents();
      setEvents(list);
      if (!selectedEventId && list.length > 0) {
        setSelectedEventId(list[0].eventId);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoadingEvents(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) {
      setError("Please select an event to invite members to.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setIsSending(true);
      setError(null);
      await invitationService.inviteUser(selectedEventId, {
        email: email.trim(),
        message: message.trim() || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/invitations");
      }, 1200);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to send invitation."
      );
    } finally {
      setIsSending(false);
    }
  };

  const selectedEvent = events.find((e) => e.eventId === selectedEventId);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <Link href="/invitations" className="hover:text-emerald-500 transition-colors">
            ← Back to Invitation Management
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Invite Member
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Send an invitation to join your event. They will receive an email to access the RunSheet.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
          <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span>Invitation sent successfully! Redirecting...</span>
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

      {/* Grid: Form left (2 cols), Live Preview right (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5">
            {/* Event Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Target Event <span className="text-red-500">*</span>
              </label>
              {isLoadingEvents ? (
                <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                  <Spinner size="sm" />
                  <span>Loading your organized events...</span>
                </div>
              ) : (
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  disabled={isSending}
                >
                  {events.map((evt) => (
                    <option key={evt.eventId} value={evt.eventId}>
                      {evt.eventName} ({evt.venue})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Member Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="alex_sim@company.com"
                disabled={isSending}
                leftIcon={
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              />
            </div>

            {/* Expiration info banner */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Invitation Expiration
              </label>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                <span className="font-semibold">Standard Validity Window</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">3 Days from sending</span>
              </div>
            </div>

            {/* Personal Message */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Personal Message
                </label>
                <span className="text-[11px] text-slate-400">Optional</span>
              </div>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a custom welcome note to the invitation email..."
                rows={3}
                disabled={isSending}
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Link href="/invitations">
                <Button type="button" variant="secondary" size="md" disabled={isSending}>
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSending}
                className="bg-[#28c740] hover:bg-[#23b33a] text-white font-bold"
              >
                Send Invitation
              </Button>
            </div>
          </form>
        </div>

        {/* Live Preview Column */}
        <div className="space-y-6 lg:sticky lg:top-20">
          <InviteMemberLivePreview
            eventName={selectedEvent?.eventName || "AI Summit 2026"}
            inviteeEmail={email}
            message={message}
          />
        </div>
      </div>
    </div>
  );
};
