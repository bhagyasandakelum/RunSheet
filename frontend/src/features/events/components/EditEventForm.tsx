"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { eventService } from "@/services/event-service";
import { dashboardService, OrganizerDashboard } from "@/services/dashboard-service";
import { Event } from "@/types/common/entities";
import { EventStatus } from "@/types/common/enums";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EventLivePreview } from "./EventLivePreview";
import { VenueMapPreview } from "./VenueMapPreview";
import { DeleteEventModal } from "./DeleteEventModal";

export interface EditEventFormProps {
  eventId: string;
}

// Backend allowed status transition rules
const ALLOWED_STATUS_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  [EventStatus.Draft]: [EventStatus.Planning, EventStatus.Cancelled],
  [EventStatus.Planning]: [EventStatus.Active, EventStatus.Cancelled],
  [EventStatus.Active]: [EventStatus.Completed, EventStatus.Cancelled],
  [EventStatus.Completed]: [EventStatus.Archived],
  [EventStatus.Cancelled]: [],
  [EventStatus.Archived]: [],
};

export const EditEventForm: React.FC<EditEventFormProps> = ({ eventId }) => {
  const router = useRouter();

  const [eventData, setEventData] = useState<Event | null>(null);
  const [dashboardData, setDashboardData] = useState<OrganizerDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState(false);

  // Form states
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentStatus, setCurrentStatus] = useState<EventStatus>(EventStatus.Draft);
  const [nextStatus, setNextStatus] = useState<EventStatus>(EventStatus.Draft);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const formatIsoForInput = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
  };

  const fetchEvent = useCallback(async () => {
    try {
      setIsLoading(true);
      setApiError(null);

      const [eventRes, dashRes] = await Promise.allSettled([
        eventService.getEventDetails(eventId),
        dashboardService.getOrganizerDashboard(eventId),
      ]);

      if (eventRes.status === "fulfilled") {
        const ev = eventRes.value;
        setEventData(ev);
        setEventName(ev.eventName);
        setDescription(ev.description || "");
        setVenue(ev.venue);
        setStartDate(formatIsoForInput(ev.startDate));
        setEndDate(formatIsoForInput(ev.endDate));
        setCurrentStatus(ev.status as EventStatus);
        setNextStatus(ev.status as EventStatus);
      } else {
        throw new Error(eventRes.reason?.response?.data?.message || "Failed to load event");
      }

      if (dashRes.status === "fulfilled") {
        setDashboardData(dashRes.value);
      }
    } catch (err: any) {
      setApiError(err?.response?.data?.message || err?.message || "Failed to load event.");
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!eventName.trim()) errs.eventName = "Event Name is required";
    if (!venue.trim()) errs.venue = "Venue / Location is required";
    if (!startDate) errs.startDate = "Start Date & Time is required";
    if (!endDate) errs.endDate = "End Date & Time is required";
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end <= start) errs.endDate = "End date and time must be after start date and time";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveChanges = async () => {
    if (!validate()) return;

    try {
      setIsSaving(true);
      setApiError(null);

      // 1. Update basic fields
      await eventService.updateEvent(eventId, {
        eventName: eventName.trim(),
        description: description.trim() || undefined,
        venue: venue.trim(),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });

      // 2. If status was changed, update status adhering to transition flow
      if (nextStatus !== currentStatus) {
        await eventService.updateEventStatus(eventId, {
          status: nextStatus,
        });
        setCurrentStatus(nextStatus);
      }

      setSuccessToast(true);
      setTimeout(() => {
        setSuccessToast(false);
        router.push(`/events/${eventId}`);
      }, 1200);
    } catch (err: any) {
      setApiError(
        err?.response?.data?.message || err?.message || "Failed to save changes."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    await eventService.deleteEvent(eventId);
    router.push("/events");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Spinner size="lg" className="text-emerald-500" />
        <p className="text-xs text-slate-500 font-medium">Loading event editor...</p>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="p-8 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 max-w-xl mx-auto text-center space-y-4 my-12">
        <h3 className="text-base font-bold text-red-950 dark:text-red-200">Event Not Found</h3>
        <p className="text-xs text-red-700 dark:text-red-400">Could not find event with ID {eventId}</p>
        <Link href="/events">
          <Button variant="secondary" size="sm">Return to My Events</Button>
        </Link>
      </div>
    );
  }

  const isTerminalStatus =
    currentStatus === EventStatus.Completed ||
    currentStatus === EventStatus.Cancelled ||
    currentStatus === EventStatus.Archived;

  const allowedNextStatuses = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];

  const teamsCount = dashboardData?.eventSummary?.totalTeams ?? (eventData as any).teamCount ?? 0;
  const membersCount = dashboardData?.eventSummary?.totalMembers ?? (eventData as any).memberCount ?? 0;
  const tasksCount = dashboardData?.eventSummary?.totalTasks ?? (eventData as any).taskCount ?? 0;
  const completion = dashboardData?.overallProgress ?? dashboardData?.taskSummary?.completedPercentage ?? 0;

  const organizerName = eventData.organizer
    ? `${eventData.organizer.firstName} ${eventData.organizer.lastName}`
    : "Alex Rivera";
  const organizerEmail = eventData.organizer?.email || "alex@runsheet.io";

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Header with ID and Timestamps */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link href={`/events/${eventId}`} className="hover:text-emerald-500 transition-colors">
              ← Back to Event Details
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Edit Event
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Update event information and settings.
          </p>
        </div>

        {/* Metadata info badge */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 p-2.5 rounded-xl self-start sm:self-center shadow-xs">
          <span>EVENT ID: <span className="text-slate-800 dark:text-slate-200 font-bold">{eventId.slice(0, 8)}...</span></span>
          <span>•</span>
          <span>CREATED: {new Date(eventData.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
          <span>✓</span>
          <span>Changes saved successfully! Redirecting to event details...</span>
        </div>
      )}

      {apiError && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
          <span>⚠️</span>
          <span>{apiError}</span>
        </div>
      )}

      {/* Main Grid: Left Form (2 cols), Right Metrics & Live Preview (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Form Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Basic Information */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-emerald-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Basic Information
              </h2>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Event Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={eventName}
                onChange={(e) => {
                  setEventName(e.target.value);
                  if (errors.eventName) setErrors({ ...errors, eventName: "" });
                }}
                placeholder="e.g. AI Summit 2026"
                error={errors.eventName}
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this event's key targets, program, and logistics..."
                rows={4}
                disabled={isSaving}
              />
            </div>
          </div>

          {/* Row 2: Schedule & Venue */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Schedule */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-emerald-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Schedule
                </h2>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Start Date & Time <span className="text-red-500">*</span>
                </label>
                <Input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (errors.startDate) setErrors({ ...errors, startDate: "" });
                  }}
                  error={errors.startDate}
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  End Date & Time <span className="text-red-500">*</span>
                </label>
                <Input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    if (errors.endDate) setErrors({ ...errors, endDate: "" });
                  }}
                  error={errors.endDate}
                  disabled={isSaving}
                />
              </div>
            </div>

            {/* Venue & Location Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-emerald-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Venue & Location
                </h2>
              </div>
              <VenueMapPreview
                venue={venue}
                onChangeVenue={(val) => {
                  setVenue(val);
                  if (errors.venue) setErrors({ ...errors, venue: "" });
                }}
                error={errors.venue}
                disabled={isSaving}
              />
            </div>
          </div>

          {/* Row 3: Status & Organizer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Control */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-emerald-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Event Status
                </h2>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Current Status: <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{currentStatus}</span>
                </label>

                {isTerminalStatus ? (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300">
                    This event is <strong>{currentStatus}</strong> and its status can no longer be transitioned.
                  </div>
                ) : (
                  <select
                    value={nextStatus}
                    onChange={(e) => setNextStatus(e.target.value as EventStatus)}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    disabled={isSaving}
                  >
                    <option value={currentStatus}>{currentStatus} (Keep Current)</option>
                    {allowedNextStatuses.map((st) => (
                      <option key={st} value={st}>
                        ➔ Transition to {st}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                  Allowed transitions follow the lifecycle: Draft ➔ Planning ➔ Active ➔ Completed ➔ Archived.
                </p>
              </div>
            </div>

            {/* Organizer Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-emerald-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Organizer
                </h2>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-black text-emerald-600 dark:text-emerald-400">
                  {organizerName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {organizerName}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {organizerEmail}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 hover:underline flex items-center gap-1.5"
            >
              <span>🗑</span>
              <span>Delete Event</span>
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <Link href={`/events/${eventId}`}>
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleSaveChanges}
                isLoading={isSaving}
                className="bg-[#28c740] hover:bg-[#23b33a] text-white font-bold"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Event Metrics & Live Preview */}
        <div className="space-y-6 lg:sticky lg:top-20">
          {/* Quick Metrics Widget */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Event Metrics
              </h4>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                {completion}% Complete
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400 block">Teams</span>
                <span className="text-base font-black text-slate-900 dark:text-white">{teamsCount}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400 block">Members</span>
                <span className="text-base font-black text-slate-900 dark:text-white">{membersCount}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400 block">Tasks</span>
                <span className="text-base font-black text-slate-900 dark:text-white">{tasksCount}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400 block">Readiness</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{completion}%</span>
              </div>
            </div>

            <Link href={`/events/${eventId}`} className="block">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-bold"
                rightIcon={
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                }
              >
                View Live Event Dashboard
              </Button>
            </Link>
          </div>

          {/* Live Preview */}
          <EventLivePreview
            eventName={eventName}
            venue={venue}
            startDate={startDate}
            endDate={endDate}
            status={nextStatus}
            description={description}
            progress={completion}
          />
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteEventModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        eventName={eventData.eventName}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
