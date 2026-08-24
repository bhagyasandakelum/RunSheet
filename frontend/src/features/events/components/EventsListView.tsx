"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { eventService } from "@/services/event-service";
import { Event } from "@/types/common/entities";
import { EventStatus } from "@/types/common/enums";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { DeleteEventModal } from "./DeleteEventModal";

export const EventsListView: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Deletion state
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await eventService.getMyEvents();
      setEvents(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load events");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;
    await eventService.deleteEvent(eventToDelete.eventId);
    setEventToDelete(null);
    fetchEvents();
  };

  const getStatusVariant = (st: EventStatus) => {
    switch (st) {
      case EventStatus.Active:
        return "success";
      case EventStatus.Planning:
        return "info";
      case EventStatus.Draft:
        return "neutral";
      case EventStatus.Completed:
        return "primary";
      case EventStatus.Cancelled:
        return "error";
      case EventStatus.Archived:
        return "neutral";
      default:
        return "neutral";
    }
  };

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.description && evt.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || evt.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const STATUS_TABS = [
    { label: "All Events", value: "ALL" },
    { label: "Active", value: EventStatus.Active },
    { label: "Planning", value: EventStatus.Planning },
    { label: "Draft", value: EventStatus.Draft },
    { label: "Completed", value: EventStatus.Completed },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            My Events
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Manage, configure, and monitor all your organized runsheets and summits.
          </p>
        </div>

        <Link href="/events/create">
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
            Create New Event
          </Button>
        </Link>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === tab.value
                  ? "bg-emerald-500 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-72">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by title, venue..."
            leftIcon={
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
          <Spinner size="lg" className="text-emerald-500" />
          <p className="text-xs text-slate-500 font-medium">Loading your events...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-center space-y-3">
          <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
          <Button variant="secondary" size="sm" onClick={fetchEvents}>Retry</Button>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-2xl">
            📅
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No events found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {searchQuery || statusFilter !== "ALL"
                ? "No events match your current filter criteria."
                : "You have not organized any events yet. Get started by creating your first runsheet!"}
            </p>
          </div>
          <Link href="/events/create" className="inline-block">
            <Button variant="primary" size="md" className="bg-[#28c740] hover:bg-[#23b33a] text-white font-bold">
              Create First Event
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => {
            const start = new Date(evt.startDate);
            const end = new Date(evt.endDate);
            const formattedDates = `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

            return (
              <div
                key={evt.eventId}
                className="group rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Top Cover Banner */}
                <div className="relative h-28 w-full bg-gradient-to-tr from-slate-900 via-indigo-950 to-teal-900 p-3.5 flex flex-col justify-between overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:14px_14px] opacity-15" />

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[9px] font-semibold text-white/90">
                      RunSheet
                    </span>
                    <Badge variant={getStatusVariant(evt.status) as any} size="sm" className="capitalize">
                      {evt.status}
                    </Badge>
                  </div>

                  <div className="relative z-10 flex items-center gap-2 text-white text-[11px] font-semibold">
                    <span>📅</span>
                    <span>{formattedDates}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-500 transition-colors">
                      {evt.eventName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {evt.description || "No description provided."}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-slate-400">📍</span>
                      <span className="truncate">{evt.venue}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setEventToDelete(evt)}
                      className="text-xs font-semibold text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1.5 transition-colors"
                      title="Delete Event"
                    >
                      🗑
                    </button>

                    <div className="flex items-center gap-2">
                      <Link href={`/events/${evt.eventId}/edit`}>
                        <Button variant="secondary" size="sm" className="text-xs">
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/events/${evt.eventId}`}>
                        <Button variant="primary" size="sm" className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-bold">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Modal */}
      {eventToDelete && (
        <DeleteEventModal
          isOpen={Boolean(eventToDelete)}
          onClose={() => setEventToDelete(null)}
          eventName={eventToDelete.eventName}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
};
