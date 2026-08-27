"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useEvent } from "@/providers/event-provider";
import { taskService } from "@/services/task-service";
import { teamService } from "@/services/team-service";
import { useAuth } from "@/hooks/use-auth";
import { Task, Team } from "@/types/common/entities";
import { TaskPriority, TaskStatus } from "@/types/common/enums";
import { Button } from "@/components/ui/button";
import { AssignMemberModal } from "./AssignMemberModal";
import { DeleteTaskModal } from "./DeleteTaskModal";

export const TasksListView: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { events, selectedEventId, isOrganizer, userTeamName } = useEvent();

  const isLeader = Boolean(userTeamName?.includes("(Lead)") || userTeamName?.includes("Leader"));
  const canManageTasks = isOrganizer || isLeader;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [assignModalTask, setAssignModalTask] = useState<Task | null>(null);
  const [deleteModalTask, setDeleteModalTask] = useState<Task | null>(null);

  // Fetch teams for the current event
  useEffect(() => {
    if (!selectedEventId) {
      setTeams([]);
      return;
    }

    const fetchTeams = async () => {
      try {
        const data = await teamService.getTeamsByEvent(selectedEventId);
        setTeams(data || []);
      } catch (err) {
        console.error("Failed to load teams:", err);
      }
    };

    fetchTeams();
  }, [selectedEventId]);

  // Fetch tasks
  const loadTasks = useCallback(async () => {
    if (!selectedEventId) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (selectedTeamFilter !== "all") {
        const data = await taskService.getTeamTasks(selectedTeamFilter);
        setTasks(data || []);
      } else {
        const data = await taskService.getEventTasks(selectedEventId);
        setTasks(data || []);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load tasks.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedEventId, selectedTeamFilter]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleDeleteTask = async () => {
    if (!deleteModalTask) return;
    await taskService.deleteTask(deleteModalTask.taskId);
    setDeleteModalTask(null);
    loadTasks();
  };

  // Filter tasks in memory for search, status, and priority
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : t.status === statusFilter;

    const matchesPriority =
      priorityFilter === "all" ? true : t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate stats
  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter((t) => t.status === TaskStatus.InProgress).length;
  const completedTasks = tasks.filter((t) => t.status === TaskStatus.Completed).length;
  const pendingTasks = tasks.filter((t) => t.status === TaskStatus.Pending).length;
  const overdueTasks = tasks.filter((t) => t.status === TaskStatus.Overdue).length;

  const currentEvent = events.find((e) => e.eventId === selectedEventId);

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    Completed: {
      bg: "bg-emerald-50 dark:bg-emerald-950/60",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-500/20",
    },
    InProgress: {
      bg: "bg-blue-50 dark:bg-blue-950/60",
      text: "text-blue-700 dark:text-blue-300",
      border: "border-blue-500/20",
    },
    Pending: {
      bg: "bg-amber-50 dark:bg-amber-950/60",
      text: "text-amber-700 dark:text-amber-300",
      border: "border-amber-500/20",
    },
    OnHold: {
      bg: "bg-purple-50 dark:bg-purple-950/60",
      text: "text-purple-700 dark:text-purple-300",
      border: "border-purple-500/20",
    },
    Cancelled: {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-600 dark:text-slate-400",
      border: "border-slate-300 dark:border-slate-700",
    },
    Overdue: {
      bg: "bg-rose-50 dark:bg-rose-950/60",
      text: "text-rose-700 dark:text-rose-300",
      border: "border-rose-500/20",
    },
  };

  const priorityColors: Record<string, { bg: string; text: string; border: string }> = {
    Critical: {
      bg: "bg-rose-50 dark:bg-rose-950/60",
      text: "text-rose-700 dark:text-rose-400",
      border: "border-rose-500/30",
    },
    High: {
      bg: "bg-amber-50 dark:bg-amber-950/60",
      text: "text-amber-700 dark:text-amber-400",
      border: "border-amber-500/30",
    },
    Medium: {
      bg: "bg-blue-50 dark:bg-blue-950/60",
      text: "text-blue-700 dark:text-blue-400",
      border: "border-blue-500/30",
    },
    Low: {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-600 dark:text-slate-400",
      border: "border-slate-300 dark:border-slate-700",
    },
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <span>{currentEvent?.eventName || "Selected Event"}</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              RunSheet Operations
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Tasks &amp; Milestones
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor deliverables, synchronize timelines, and track member delegation.
          </p>
        </div>

        {canManageTasks && (
          <div>
            <Link
              href={
                selectedTeamFilter !== "all"
                  ? `/tasks/create?teamId=${selectedTeamFilter}`
                  : `/tasks/create`
              }
            >
              <Button
                variant="primary"
                size="md"
                className="bg-[#28c740] hover:bg-[#23b33a] text-white font-bold text-xs shadow-sm"
                leftIcon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                Create Task
              </Button>
            </Link>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-xs text-red-700 dark:text-red-300 font-semibold">
          {error}
        </div>
      )}

      {/* 4 Metric Badges Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Tasks
          </p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalTasks}
          </p>
        </div>

        <div className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
          <p className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">
            In Progress
          </p>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {inProgressTasks}
          </p>
        </div>

        <div className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
          <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">
            Completed
          </p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {completedTasks}
          </p>
        </div>

        <div className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
          <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">
            Pending / Overdue
          </p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {pendingTasks + overdueTasks}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search tasks by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-[#1A2234] text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Team Filter */}
          <select
            value={selectedTeamFilter}
            onChange={(e) => setSelectedTeamFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-[#1A2234] text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          >
            <option value="all">All Teams ({teams.length})</option>
            {teams.map((t) => (
              <option key={t.teamId} value={t.teamId}>
                {t.teamName}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-[#1A2234] text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          >
            <option value="all">Status: All</option>
            <option value={TaskStatus.Pending}>Pending</option>
            <option value={TaskStatus.InProgress}>In Progress</option>
            <option value={TaskStatus.Completed}>Completed</option>
            <option value={TaskStatus.OnHold}>On Hold</option>
            <option value={TaskStatus.Overdue}>Overdue</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-[#1A2234] text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          >
            <option value="all">Priority: All</option>
            <option value={TaskPriority.Critical}>Critical</option>
            <option value={TaskPriority.High}>High</option>
            <option value={TaskPriority.Medium}>Medium</option>
            <option value={TaskPriority.Low}>Low</option>
          </select>
        </div>
      </div>

      {/* Tasks Table Card */}
      <div className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-24 text-center text-xs font-semibold text-slate-400">
            Loading tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-400 space-y-3">
            <p>No tasks match the selected criteria.</p>
            {canManageTasks && (
              <Link
                href={
                  selectedTeamFilter !== "all"
                    ? `/tasks/create?teamId=${selectedTeamFilter}`
                    : `/tasks/create`
                }
              >
                <Button variant="outline" size="sm" className="text-xs font-semibold">
                  + Create Task
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-6">Task Title</th>
                  <th className="py-3.5 px-4">Team</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Assignees</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {filteredTasks.map((t) => {
                  const assignees = t.assignments || [];
                  const teamName = t.team?.teamName || (t as any).teamName || "General";

                  return (
                    <tr
                      key={t.taskId}
                      className="hover:bg-slate-50/80 dark:hover:bg-[#1A2234]/80 transition-colors group"
                    >
                      {/* Task Title & Description */}
                      <td className="py-4 px-6 max-w-xs sm:max-w-sm">
                        <Link
                          href={`/tasks/${t.taskId}`}
                          className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate block"
                        >
                          {t.taskTitle}
                        </Link>
                        {t.description && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {t.description}
                          </p>
                        )}
                      </td>

                      {/* Team */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {teamName}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {canManageTasks ? (
                          <select
                            value={t.status}
                            onChange={async (e) => {
                              const newStatus = e.target.value as TaskStatus;
                              try {
                                await taskService.updateTaskStatus(t.taskId, { status: newStatus });
                                loadTasks();
                              } catch (err: any) {
                                setError(err?.response?.data?.message || err?.message || "Failed to update status.");
                              }
                            }}
                            className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none transition-colors ${
                              statusColors[t.status]?.bg || ""
                            } ${statusColors[t.status]?.text || ""} ${statusColors[t.status]?.border || ""}`}
                            title="Click to update task status (Organizer / Team Leader)"
                          >
                            <option value={TaskStatus.Pending}>Pending</option>
                            <option value={TaskStatus.InProgress}>In Progress</option>
                            <option value={TaskStatus.Completed}>Completed</option>
                            <option value={TaskStatus.OnHold}>On Hold</option>
                            <option value={TaskStatus.Overdue}>Overdue</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                              statusColors[t.status]?.bg || ""
                            } ${statusColors[t.status]?.text || ""} ${statusColors[t.status]?.border || ""}`}
                          >
                            {t.status}
                          </span>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            priorityColors[t.priority]?.bg || ""
                          } ${priorityColors[t.priority]?.text || ""} ${priorityColors[t.priority]?.border || ""}`}
                        >
                          {t.priority}
                        </span>
                      </td>

                      {/* Stacked Assignees */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {assignees.length === 0 ? (
                          canManageTasks ? (
                            <button
                              onClick={() => setAssignModalTask(t)}
                              className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold"
                            >
                              + Assign
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400">Unassigned</span>
                          )
                        ) : (
                          <div
                            onClick={() => canManageTasks && setAssignModalTask(t)}
                            className={`flex -space-x-2 overflow-hidden ${canManageTasks ? "cursor-pointer" : ""}`}
                            title={canManageTasks ? "Click to manage assignees" : "Assigned members"}
                          >
                            {assignees.map((a: any) => {
                              const u =
                                a.teamMembership?.eventMember?.user ||
                                a.user ||
                                a.eventMember?.user ||
                                {};
                              const name =
                                `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
                                "Member";
                              const avatar = u.profilePhotoUrl || null;

                              return (
                                <div
                                  key={a.taskAssignmentId}
                                  title={name}
                                  className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-[#131B2E] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold flex items-center justify-center overflow-hidden shrink-0"
                                >
                                  {avatar ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={avatar}
                                      alt={name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    name[0]?.toUpperCase() || "M"
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>

                      {/* Due Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400 font-medium">
                        {t.dueDate
                          ? new Date(t.dueDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/tasks/${t.taskId}`}>
                            <button
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="View Task Details"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </Link>

                          {canManageTasks && (
                            <Link href={`/tasks/${t.taskId}/edit`}>
                              <button
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Edit Task"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            </Link>
                          )}

                          {canManageTasks && (
                            <button
                              onClick={() => setDeleteModalTask(t)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Delete Task"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>Showing {filteredTasks.length} of {tasks.length} tasks</span>
          <span>{currentEvent?.eventName || "Event Tasks"}</span>
        </div>
      </div>

      {/* Assign Members Modal */}
      {assignModalTask && (
        <AssignMemberModal
          isOpen={!!assignModalTask}
          taskId={assignModalTask.taskId}
          teamId={assignModalTask.teamId}
          taskTitle={assignModalTask.taskTitle}
          leaderMembershipId={assignModalTask.team?.leaderMembershipId}
          onClose={() => setAssignModalTask(null)}
          onSuccess={loadTasks}
        />
      )}

      {/* Delete Task Modal */}
      {deleteModalTask && (
        <DeleteTaskModal
          isOpen={!!deleteModalTask}
          taskTitle={deleteModalTask.taskTitle}
          onClose={() => setDeleteModalTask(null)}
          onConfirm={handleDeleteTask}
        />
      )}
    </div>
  );
};
