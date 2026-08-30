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

export const CreateEventForm: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  // Form State
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<EventStatus>(EventStatus.Active);

  // Status & Validation
  const [submittingAction, setSubmittingAction] = useState<"live" | "draft" | null>(null);
  const isSubmitting = submittingAction !== null;
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
      setSubmittingAction(asDraft ? "draft" : "live");
      setApiError(null);

      const desiredStatus = asDraft ? EventStatus.Draft : selectedStatus;

      // Create directly in backend
      const createdEvent = await eventService.createEvent({
        eventName: eventName.trim(),
        description: description.trim() || undefined,
        venue: venue.trim(),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        status: desiredStatus,
      } as any);

      router.push(`/events/${createdEvent.eventId}`);
    } catch (err: any) {
      setApiError(
        err?.response?.data?.message || err?.message || "Failed to create event."
      );
    } finally {
      setSubmittingAction(null);
    }
  };

  const organizerName = user ? `${user.firstName} ${user.lastName}`.trim() : "Event Organizer";
  const organizerEmail = user?.email || "";

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 select-none">
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
          <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{apiError}</span>
        </div>
      )}

      {/* Main Grid: Form left (2/3), Live Preview right (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Form Area */}
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
                placeholder="e.g. Annual Tech Symposium"
                error={errors.eventName}
                disabled={isSubmitting}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details and operational objectives for this event."
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
                  Location / Venue
                </h2>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Venue <span className="text-red-500">*</span>
                </label>
                <Input
                  value={venue}
                  onChange={(e) => {
                    setVenue(e.target.value);
                    if (errors.venue) setErrors({ ...errors, venue: "" });
                  }}
                  placeholder="e.g. Main Auditorium / Convention Hall"
                  error={errors.venue}
                  disabled={isSubmitting}
                  leftIcon={
                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                />
              </div>
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
                  disabled={submittingAction !== null}
                >
                  <option value={EventStatus.Active}>Live (Active)</option>
                  <option value={EventStatus.Draft}>Draft</option>
                </select>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                  Events can be published Live immediately or saved as a Draft for future release.
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
                    {organizerEmail || "Organizer account"}
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
                disabled={submittingAction !== null}
                isLoading={submittingAction === "draft"}
                className="min-w-[130px]"
              >
                Save as draft
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => handleSave(false)}
                disabled={submittingAction !== null}
                isLoading={submittingAction === "live"}
                className="bg-[#28c740] hover:bg-[#23b33a] text-white font-bold min-w-[140px]"
              >
                Create Event
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Live Preview */}
        <div className="space-y-6 lg:sticky lg:top-20">
          <EventLivePreview
            eventName={eventName || "Event Title"}
            venue={venue || "Venue / Location"}
            startDate={startDate}
            endDate={endDate}
            status={selectedStatus}
            description={description}
            progress={0}
          />
        </div>
      </div>
    </div>
  );
};
