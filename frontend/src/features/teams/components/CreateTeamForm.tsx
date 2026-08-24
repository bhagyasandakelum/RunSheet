"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEvent } from "@/providers/event-provider";
import { teamService } from "@/services/team-service";
import { userService } from "@/services/user-service";
import { User } from "@/types/common/entities";
import { Button } from "@/components/ui/button";

export const CreateTeamForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramEventId = searchParams.get("eventId") || "";
  const { events, selectedEventId: globalEventId, refreshEvents } = useEvent();

  const [selectedEventId, setSelectedEventId] = useState<string>(
    paramEventId || globalEventId || ""
  );
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");

  // Leader selection
  const [leaderSearchQuery, setLeaderSearchQuery] = useState("");
  const [candidateUsers, setCandidateUsers] = useState<User[]>([]);
  const [selectedLeader, setSelectedLeader] = useState<User | null>(null);
  const [isSearchingLeader, setIsSearchingLeader] = useState(false);
  const [showLeaderDropdown, setShowLeaderDropdown] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedEventId && (paramEventId || globalEventId || events[0]?.eventId)) {
      setSelectedEventId(paramEventId || globalEventId || events[0]?.eventId || "");
    }
  }, [paramEventId, globalEventId, events, selectedEventId]);

  // Search candidate users for leader
  useEffect(() => {
    if (!leaderSearchQuery.trim()) {
      setCandidateUsers([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingLeader(true);
        const results = await userService.searchUsers(leaderSearchQuery);
        setCandidateUsers(results);
      } catch (err) {
        console.error("Failed to search leader candidates:", err);
      } finally {
        setIsSearchingLeader(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [leaderSearchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) {
      setError("Please select an event.");
      return;
    }
    if (!teamName.trim()) {
      setError("Team name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const created = await teamService.createTeam(selectedEventId, {
        teamName: teamName.trim(),
        description: description.trim() || undefined,
        leaderUserId: selectedLeader ? selectedLeader.userId : undefined,
      });

      router.push(`/teams/${created.teamId}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to create team.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedEvent = events.find((e) => e.eventId === selectedEventId);

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/teams" className="hover:text-emerald-600 transition-colors">
            Teams
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white">Create Team</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Create Team
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Set up organizing groups for your event and assign initial team leaders.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Form Left (3/5), Live Preview Right (2/5) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Left Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
            {/* Event Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Target Event *
              </label>
              {events.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300 font-semibold">
                  You have no events created yet. Please create an event first.
                </div>
              ) : (
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-[#1A2234] text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  required
                >
                  {events.map((evt) => (
                    <option key={evt.eventId} value={evt.eventId}>
                      📅 {evt.eventName} ({evt.status})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Team Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Team Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Logistics Alpha, Tech Beta, Security Delta"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                maxLength={100}
                required
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-[#1A2234] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Team Description &amp; Responsibilities
              </label>
              <textarea
                placeholder="Outline the team's primary responsibilities and tasks..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={1000}
                className="w-full p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-[#1A2234] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none"
              />
            </div>

            {/* Team Leader Assignment */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Assign Team Leader
              </label>

              {selectedLeader ? (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-500/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                      {selectedLeader.firstName[0]}
                      {selectedLeader.lastName[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {selectedLeader.firstName} {selectedLeader.lastName}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {selectedLeader.email}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedLeader(null)}
                    className="text-xs font-bold text-rose-500 hover:text-rose-700 dark:text-rose-400 px-2.5 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search candidate by name or email..."
                    value={leaderSearchQuery}
                    onChange={(e) => {
                      setLeaderSearchQuery(e.target.value);
                      setShowLeaderDropdown(true);
                    }}
                    onFocus={() => setShowLeaderDropdown(true)}
                    className="w-full h-11 pl-9 pr-4 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-[#1A2234] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                  <svg
                    className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>

                  {/* Dropdown for leader search */}
                  {showLeaderDropdown && candidateUsers.length > 0 && (
                    <div className="absolute top-12 left-0 right-0 z-20 bg-white dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl max-h-48 overflow-y-auto p-1.5 space-y-1">
                      {candidateUsers.map((u) => (
                        <div
                          key={u.userId}
                          onClick={() => {
                            setSelectedLeader(u);
                            setShowLeaderDropdown(false);
                            setLeaderSearchQuery("");
                          }}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/50 cursor-pointer transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
                            {u.firstName[0]}
                            {u.lastName[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {u.firstName} {u.lastName}
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {isSearchingLeader && (
                    <p className="text-[11px] text-slate-400 mt-1">Searching candidates...</p>
                  )}
                </div>
              )}
            </div>

            {/* Info note */}
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-3">
              <span className="text-emerald-500 text-sm mt-0.5">ℹ️</span>
              <p className="leading-relaxed">
                Team leader will have access to create and manage tasks. Team memberships will be managed strictly within this group&apos;s context.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/teams">
              <Button variant="outline" size="md" className="text-xs font-semibold">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              disabled={!teamName.trim() || !selectedEventId}
              className="bg-[#28c740] hover:bg-[#23b33a] text-white font-bold px-6"
            >
              Create Team
            </Button>
          </div>
        </form>

        {/* Right Live Preview Card */}
        <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-20">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Preview
            </span>
          </div>

          <div className="bg-[#111622] border border-slate-800 rounded-3xl p-6 shadow-xl text-white space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                New Team
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                Active
              </span>
            </div>

            <div>
              <h3 className="text-xl font-black text-white tracking-tight">
                {teamName.trim() || "Logistics Alpha"}
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">
                {description.trim() ||
                  "Outline the team's primary responsibilities and tasks..."}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center text-xs font-bold">
                {selectedLeader
                  ? `${selectedLeader.firstName[0]}${selectedLeader.lastName[0]}`
                  : "TL"}
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  {selectedLeader
                    ? `${selectedLeader.firstName} ${selectedLeader.lastName}`
                    : "Team Leader Pending"}
                </p>
                <p className="text-[11px] text-slate-400">Team Leader</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-medium text-slate-400">
              <span>Event: {selectedEvent?.eventName || "Selected Event"}</span>
              <span className="text-emerald-400 font-bold">1 Initial Member</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
