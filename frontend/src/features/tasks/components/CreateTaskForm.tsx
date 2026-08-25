"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEvent } from "@/providers/event-provider";
import { teamService } from "@/services/team-service";
import { teamMembershipService } from "@/services/team-membership-service";
import { taskService } from "@/services/task-service";
import { Team, TeamMembership } from "@/types/common/entities";
import { TaskPriority } from "@/types/common/enums";
import { Button } from "@/components/ui/button";

export const CreateTaskForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramEventId = searchParams.get("eventId") || "";
  const paramTeamId = searchParams.get("teamId") || "";

  const { events, selectedEventId: globalEventId } = useEvent();

  const [selectedEventId, setSelectedEventId] = useState<string>(
    paramEventId || globalEventId || ""
  );
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(paramTeamId || "");
  const [teamMembers, setTeamMembers] = useState<TeamMembership[]>([]);

  // Task form fields
  const [taskTitle, setTaskTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.Medium);
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);

  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync event
  useEffect(() => {
    if (!selectedEventId && (paramEventId || globalEventId || events[0]?.eventId)) {
      setSelectedEventId(paramEventId || globalEventId || events[0]?.eventId || "");
    }
  }, [paramEventId, globalEventId, events, selectedEventId]);

  // Load teams when event changes
  useEffect(() => {
    if (!selectedEventId) {
      setTeams([]);
      return;
    }

    const fetchTeams = async () => {
      try {
        setIsLoadingTeams(true);
        const data = await teamService.getTeamsByEvent(selectedEventId);
        setTeams(data || []);

        if (paramTeamId && data.some((t) => t.teamId === paramTeamId)) {
          setSelectedTeamId(paramTeamId);
        } else if (data.length > 0) {
          setSelectedTeamId(data[0].teamId);
        } else {
          setSelectedTeamId("");
        }
      } catch (err: any) {
        console.error("Failed to load teams:", err);
      } finally {
        setIsLoadingTeams(false);
      }
    };

    fetchTeams();
  }, [selectedEventId, paramTeamId]);

  // Load team members when team changes
  useEffect(() => {
    if (!selectedTeamId) {
      setTeamMembers([]);
      setSelectedAssigneeIds([]);
      return;
    }

    const fetchMembers = async () => {
      try {
        setIsLoadingMembers(true);
        const data = await teamMembershipService.getTeamMembers(selectedTeamId);
        setTeamMembers(data || []);
      } catch (err: any) {
        console.error("Failed to load team members:", err);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [selectedTeamId]);

  const handleToggleAssignee = (membershipId: string) => {
    setSelectedAssigneeIds((prev) => {
      if (prev.includes(membershipId)) {
        return prev.filter((id) => id !== membershipId);
      } else {
        if (prev.length >= 3) return prev; // max 3
        return [...prev, membershipId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId) {
      setError("Please select a team for this task.");
      return;
    }
    if (!taskTitle.trim()) {
      setError("Task title is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      let isoDueDate: string | undefined = undefined;
      if (dueDate) {
        isoDueDate = dueTime ? `${dueDate}T${dueTime}:00` : `${dueDate}T23:59:59`;
      }

      const created = await taskService.createTask(selectedTeamId, {
        taskTitle: taskTitle.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: isoDueDate,
        assignedMembershipIds:
          selectedAssigneeIds.length > 0 ? selectedAssigneeIds : undefined,
      });

      router.push(`/tasks/${created.taskId}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to create task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTeam = teams.find((t) => t.teamId === selectedTeamId);
  const selectedEvent = events.find((e) => e.eventId === selectedEventId);

  const priorityColors: Record<TaskPriority, { bg: string; text: string; border: string }> = {
    [TaskPriority.Critical]: {
      bg: "bg-rose-50 dark:bg-rose-950/60",
      text: "text-rose-700 dark:text-rose-400",
      border: "border-rose-500/30",
    },
    [TaskPriority.High]: {
      bg: "bg-amber-50 dark:bg-amber-950/60",
      text: "text-amber-700 dark:text-amber-400",
      border: "border-amber-500/30",
    },
    [TaskPriority.Medium]: {
      bg: "bg-blue-50 dark:bg-blue-950/60",
      text: "text-blue-700 dark:text-blue-400",
      border: "border-blue-500/30",
    },
    [TaskPriority.Low]: {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-600 dark:text-slate-400",
      border: "border-slate-300 dark:border-slate-700",
    },
  };

  return (
    <div className="max-w-6xl mx-auto pb-16">
      {/* Breadcrumb Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/tasks" className="hover:text-emerald-600 transition-colors">
            Tasks
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-bold">Create Task</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Create Task
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Delegate operational responsibilities, set milestones, and assign team members.
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
            {/* Event & Team Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Event *
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-[#1A2234] text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  required
                >
                  {events.map((evt) => (
                    <option key={evt.eventId} value={evt.eventId}>
                      📅 {evt.eventName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Assign to Team *
                </label>
                {teams.length === 0 ? (
                  <div className="h-11 px-3.5 flex items-center rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300 font-medium">
                    {isLoadingTeams ? "Loading teams..." : "No teams in this event."}
                  </div>
                ) : (
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-[#1A2234] text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    required
                  >
                    {teams.map((t) => (
                      <option key={t.teamId} value={t.teamId}>
                        👥 {t.teamName}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Task Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Stage Setup Alpha, Sound System Check, VIP Escort"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                maxLength={255}
                required
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-[#1A2234] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Description &amp; Instructions
              </label>
              <textarea
                placeholder="Provide detailed action items, locations, and prerequisites..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={3000}
                className="w-full p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-[#1A2234] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none"
              />
            </div>

            {/* Priority & Due Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-[#1A2234] text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                >
                  <option value={TaskPriority.Low}>Low</option>
                  <option value={TaskPriority.Medium}>Medium</option>
                  <option value={TaskPriority.High}>High</option>
                  <option value={TaskPriority.Critical}>Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-[#1A2234] text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Due Time
                </label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-[#1A2234] text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
            </div>

            {/* Assign Members Section */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Assign Team Members
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Select up to 3 members from this team (including team leader).
                  </p>
                </div>
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                  {selectedAssigneeIds.length} / 3 Selected
                </span>
              </div>

              {isLoadingMembers ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Loading team members...
                </div>
              ) : teamMembers.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                  No members found in this team yet. You can assign members after adding them to the team.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {teamMembers.map((m: any) => {
                    const user = m.eventMember?.user || m.user || {};
                    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Member";
                    const isLeader = selectedTeam?.leaderMembershipId === m.teamMembershipId;
                    const isChecked = selectedAssigneeIds.includes(m.teamMembershipId);

                    return (
                      <div
                        key={m.teamMembershipId}
                        onClick={() => handleToggleAssignee(m.teamMembershipId)}
                        className={`flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer transition-all ${
                          isChecked
                            ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500"
                            : "border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-[#1A2234] hover:border-slate-200 dark:hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
                            {name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                              {name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {isLeader ? "Team Leader" : "Member"}
                            </p>
                          </div>
                        </div>

                        <div className="w-5 h-5 rounded-md border flex items-center justify-center text-xs transition-colors shrink-0">
                          {isChecked ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600">+</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/tasks">
              <Button variant="outline" size="md" className="text-xs font-semibold">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              disabled={!taskTitle.trim() || !selectedTeamId}
              className="bg-[#28c740] hover:bg-[#23b33a] text-white font-bold px-6 text-xs"
            >
              Create Task
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
                {selectedTeam?.teamName || "Team Task"}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                  priorityColors[priority]?.bg || ""
                } ${priorityColors[priority]?.text || ""} ${priorityColors[priority]?.border || ""}`}
              >
                {priority} Priority
              </span>
            </div>

            <div>
              <h3 className="text-xl font-black text-white tracking-tight">
                {taskTitle.trim() || "Stage Setup Alpha"}
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">
                {description.trim() ||
                  "Detailed action items, responsibilities, and timeline execution..."}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>
                📅 {dueDate ? new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "No Due Date"}
                {dueTime && ` at ${dueTime}`}
              </span>
              <span className="text-emerald-400 font-bold">
                {selectedAssigneeIds.length} Assignee{selectedAssigneeIds.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Assigned Member Avatars in Preview */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Assigned:</span>
              <div className="flex -space-x-2 overflow-hidden">
                {selectedAssigneeIds.length === 0 ? (
                  <span className="text-[11px] text-slate-500">Unassigned</span>
                ) : (
                  selectedAssigneeIds.map((id) => {
                    const m: any = teamMembers.find((member: any) => member.teamMembershipId === id);
                    const user = m?.eventMember?.user || m?.user || {};
                    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Member";
                    return (
                      <div
                        key={id}
                        title={name}
                        className="inline-block h-7 w-7 rounded-full ring-2 ring-[#111622] bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center"
                      >
                        {name[0]?.toUpperCase() || "M"}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
