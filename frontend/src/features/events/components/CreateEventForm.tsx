"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { eventService } from "@/services/event-service";
import { EventStatus } from "@/types/common/enums";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { EventLivePreview } from "./EventLivePreview";
import { VenueMapPreview } from "./VenueMapPreview";

export const CreateEventForm: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  // Form State
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<EventStatus>(EventStatus.Planning);

  // Status & Validation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!eventName.trim()) {
      errs.eventName = "Event Name is required";
    }
    if (!venue.trim()) {
      errs.venue = "Venue / Location is required";
    }
    if (!startDate) {
      errs.startDate = "Start Date & Time is required";
    }
    if (!endDate) {
      errs.endDate = "End Date & Time is required";
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end <= start) {
        errs.endDate = "End date and time must be after start date and time";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (asDraft: boolean = false) => {
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      setApiError(null);

      // Create in backend
      const createdEvent = await eventService.createEvent({
        eventName: eventName.trim(),
        description: description.trim() || undefined,
        venue: venue.trim(),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });

      // If user chose Planning status (not Draft), update status to Planning
      const desiredStatus = asDraft ? EventStatus.Draft : selectedStatus;
      if (desiredStatus !== EventStatus.Draft && createdEvent.eventId) {
        try {
          await eventService.updateEventStatus(createdEvent.eventId, {
            status: desiredStatus,
          });
        } catch {
          // Fallback if status update failed non-critically
        }
      }

      router.push(`/events/${createdEvent.eventId}`);
    } catch (err: any) {
      setApiError(
        err?.response?.data?.message || err?.message || "Failed to create event."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const organizerName = user ? `${user.firstName} ${user.lastName}` : "Alex Rivera";
  const organizerEmail = user?.email || "alex@runsheet.io";

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Create New Event
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Provide event information to start organizing your event.
        </p>
      </div>

      {apiError && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
          <span>⚠️</span>
          <span>{apiError}</span>
        </div>
      )}

      {/* Main Grid: Form left (2/3), Live Preview right (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Form Area (2 cols on desktop) */}
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

            {/* Event Name */}
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
                disabled={isSubmitting}
              />
            </div>

            {/* Description with formatting header */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Description
                </label>
                <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">B</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px] italic">I</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px] underline">U</span>
                </div>
              </div>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="The premier gathering for artificial intelligence professionals, researchers, and enthusiasts. Join us for 3 days of keynotes, workshops, and networking."
                rows={4}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Row 2: Location & Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-emerald-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Location
                </h2>
              </div>
              <VenueMapPreview
                venue={venue}
                onChangeVenue={(val) => {
                  setVenue(val);
                  if (errors.venue) setErrors({ ...errors, venue: "" });
                }}
                error={errors.venue}
                disabled={isSubmitting}
              />
            </div>

            {/* Schedule Card */}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span>⏱</span>
                <span>Times are saved in your local timezone and synced in UTC.</span>
              </div>
            </div>
          </div>

          {/* Row 3: Event Status & Organizer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Card */}
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
                  Initial Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as EventStatus)}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  disabled={isSubmitting}
                >
                  <option value={EventStatus.Planning}>Planning (Recommended for prep)</option>
                  <option value={EventStatus.Draft}>Draft (Work in progress)</option>
                </select>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                  You can transition the event to &ldquo;Active&rdquo; when ready to launch operations.
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

          {/* Bottom Action Controls */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="text-red-500 font-bold">*</span>
              <span>Required fields to start organizing</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => handleSave(true)}
                isLoading={isSubmitting}
              >
                Save as draft
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => handleSave(false)}
                isLoading={isSubmitting}
                className="bg-[#28c740] hover:bg-[#23b33a] text-white font-bold"
              >
                Create Event
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Live Preview */}
        <div className="space-y-6 lg:sticky lg:top-20">
          <EventLivePreview
            eventName={eventName || "AI Summit 2026"}
            venue={venue || "Moscone Center, SF"}
            startDate={startDate}
            endDate={endDate}
            status={selectedStatus}
            description={description}
            progress={68}
          />
        </div>
      </div>
    </div>
  );
};
