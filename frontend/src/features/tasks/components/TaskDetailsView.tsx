"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { taskService } from "@/services/task-service";
import { taskAssignmentService } from "@/services/task-assignment-service";
import { useAuth } from "@/hooks/use-auth";
import { Task, TaskAssignment } from "@/types/common/entities";
import { AssignmentStatus, TaskPriority, TaskStatus } from "@/types/common/enums";
import { Button } from "@/components/ui/button";
import { AssignMemberModal } from "./AssignMemberModal";
import { UpdateMyProgressModal } from "./UpdateMyProgressModal";
import { DeleteTaskModal } from "./DeleteTaskModal";

export interface TaskDetailsViewProps {
  taskId: string;
}

export const TaskDetailsView: React.FC<TaskDetailsViewProps> = ({ taskId }) => {
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const [task, setTask] = useState<Task | null>(null);
  const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [progressModalData, setProgressModalData] = useState<{
    isOpen: boolean;
    assignmentId: string;
    currentStatus: AssignmentStatus;
  }>({
    isOpen: false,
    assignmentId: "",
    currentStatus: AssignmentStatus.Assigned,
  });

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [taskData, assignmentsData] = await Promise.all([
        taskService.getTaskDetails(taskId),
        taskAssignmentService.getTaskAssignments(taskId),
      ]);
      setTask(taskData);
      setAssignments(assignmentsData || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load task details.");
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="py-24 text-center text-xs font-semibold text-slate-400">
        Loading task workspace...
      </div>
    );
  }

  if (!task || error) {
    return (
      <div className="p-8 text-center bg-red-50 dark:bg-red-950/40 rounded-3xl border border-red-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold space-y-3">
        <p>{error || "Task not found."}</p>
        <Link href="/tasks">
          <Button variant="outline" size="sm" className="text-xs">
            Back to Tasks
          </Button>
        </Link>
      </div>
    );
  }

  // Authorization checks
  const isOrganizer =
    currentUser?.userId === (task as any).event?.organizerId ||
    currentUser?.userId === (task.team?.event as any)?.organizerId;
  const isLeader =
    task.team?.leaderMembershipId === (currentUser as any)?.teamMembershipId ||
    (task.team?.leader as any)?.eventMember?.userId === currentUser?.userId;

  const canManage = isOrganizer || isLeader;

  // Check if current user is an assignee
  const myAssignment = assignments.find(
    (a: any) =>
      a.teamMembership?.eventMember?.userId === currentUser?.userId ||
      a.eventMemberId === (currentUser as any)?.eventMemberId ||
      a.userId === currentUser?.userId
  );

  const handleDeleteTask = async () => {
    await taskService.deleteTask(taskId);
    router.push("/tasks");
  };

  const handleQuickStatusChange = async (newStatus: TaskStatus) => {
    try {
      await taskService.updateTaskStatus(taskId, { status: newStatus });
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to update status.");
    }
  };

  const completedAssignments = assignments.filter(
    (a) => a.assignmentStatus === AssignmentStatus.Completed
  ).length;

  const progressPercent =
    assignments.length > 0
      ? Math.round((completedAssignments / assignments.length) * 100)
      : task.status === TaskStatus.Completed
      ? 100
      : 0;

  const statusColors: Record<TaskStatus, { bg: string; text: string; border: string }> = {
    [TaskStatus.Completed]: {
      bg: "bg-emerald-50 dark:bg-emerald-950/60",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-500/20",
    },
    [TaskStatus.InProgress]: {
      bg: "bg-blue-50 dark:bg-blue-950/60",
      text: "text-blue-700 dark:text-blue-300",
      border: "border-blue-500/20",
    },
    [TaskStatus.Pending]: {
      bg: "bg-amber-50 dark:bg-amber-950/60",
      text: "text-amber-700 dark:text-amber-300",
      border: "border-amber-500/20",
    },
    [TaskStatus.OnHold]: {
      bg: "bg-purple-50 dark:bg-purple-950/60",
      text: "text-purple-700 dark:text-purple-300",
      border: "border-purple-500/20",
    },
    [TaskStatus.Cancelled]: {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-600 dark:text-slate-400",
      border: "border-slate-300 dark:border-slate-700",
    },
    [TaskStatus.Overdue]: {
      bg: "bg-rose-50 dark:bg-rose-950/60",
      text: "text-rose-700 dark:text-rose-300",
      border: "border-rose-500/20",
    },
  };

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

  const assignmentStatusBadges: Record<AssignmentStatus, string> = {
    [AssignmentStatus.Completed]: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-500/30",
    [AssignmentStatus.InProgress]: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-500/30",
    [AssignmentStatus.Assigned]: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-500/30",
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Breadcrumb Header */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <Link href="/dashboard" className="hover:text-emerald-600 transition-colors">
          Dashboard
        </Link>
        <span>/</span>
        <Link href="/tasks" className="hover:text-emerald-600 transition-colors">
          Tasks
        </Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-white font-bold truncate max-w-xs sm:max-w-md">
          {task.taskTitle}
        </span>
      </div>

      {/* Main Top Banner Card */}
      <div className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {task.taskTitle}
            </h1>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                statusColors[task.status]?.bg || ""
              } ${statusColors[task.status]?.text || ""} ${statusColors[task.status]?.border || ""}`}
            >
              {task.status}
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                priorityColors[task.priority]?.bg || ""
              } ${priorityColors[task.priority]?.text || ""} ${priorityColors[task.priority]?.border || ""}`}
            >
              {task.priority} Priority
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-3 max-w-3xl leading-relaxed whitespace-pre-line">
            {task.description || "No operational description provided for this task."}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link
              href={`/teams/${task.teamId}`}
              className="inline-flex items-center gap-1.5 hover:text-emerald-600 transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Team: {task.team?.teamName}</span>
            </Link>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : "No Due Date"}</span>
            </span>
            <span>•</span>
            <span>
              Created by {(task.createdBy as any)?.user?.firstName || (task.createdBy as any)?.firstName || "Member"} {(task.createdBy as any)?.user?.lastName || (task.createdBy as any)?.lastName || ""}
            </span>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {myAssignment && (
            <Button
              variant="primary"
              size="md"
              onClick={() =>
                setProgressModalData({
                  isOpen: true,
                  assignmentId: myAssignment.taskAssignmentId,
                  currentStatus: myAssignment.assignmentStatus,
                })
              }
              className="bg-[#28c740] hover:bg-[#23b33a] text-white font-bold text-xs"
              leftIcon={
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              }
            >
              Update My Progress
            </Button>
          )}

          {canManage && (
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsAssignModalOpen(true)}
              className="text-xs font-semibold"
              leftIcon={
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              }
            >
              Assign Members
            </Button>
          )}

          {canManage && (
            <Link href={`/tasks/${taskId}/edit`}>
              <Button variant="outline" size="md" className="text-xs font-semibold">
                Edit Task
              </Button>
            </Link>
          )}

          {canManage && (
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsDeleteModalOpen(true)}
              className="border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold"
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Progress & Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs md:col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Task Execution Progress
            </span>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 pt-1">
            <span>{completedAssignments} of {assignments.length} assignees completed</span>
            <span>Status: {task.status}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Assignees
          </p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {assignments.length} <span className="text-xs font-normal text-slate-400">/ 3 max</span>
          </p>
        </div>

        <div className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Deadline
          </p>
          <p className="text-base font-black text-slate-900 dark:text-white mt-1 truncate">
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Open Ended"}
          </p>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2/3): Assigned Members & Delegation */}
        <div className="lg:col-span-2 bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Assigned Team Members ({assignments.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Personnel assigned to execute this operational milestone.
              </p>
            </div>

            {canManage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAssignModalOpen(true)}
                className="text-xs font-semibold"
                leftIcon={<span className="text-emerald-500 font-bold">+</span>}
              >
                Assign Member
              </Button>
            )}
          </div>

          {assignments.length === 0 ? (
            <div className="py-14 text-center text-xs text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
              <p>No team members are assigned to this task yet.</p>
              {canManage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAssignModalOpen(true)}
                  className="text-xs font-semibold"
                >
                  + Assign First Member
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {assignments.map((a: any) => {
                const user =
                  a.teamMembership?.eventMember?.user || a.user || a.eventMember?.user || {};
                const name =
                  `${user.firstName || a.firstName || ""} ${user.lastName || a.lastName || ""}`.trim() ||
                  "Assignee";
                const email = user.email || a.email || "";
                const avatar = user.profilePhotoUrl || a.profilePhotoUrl || null;
                const isLeader =
                  task.team?.leaderMembershipId === a.teamMembershipId || a.isLeader;
                const isMyCard =
                  user.userId === currentUser?.userId ||
                  a.userId === currentUser?.userId;

                return (
                  <div
                    key={a.taskAssignmentId}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-300 overflow-hidden shrink-0 shadow-xs">
                        {avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={avatar} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {name}
                          </h4>
                          {isLeader && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-500/30">
                              Leader
                            </span>
                          )}
                          {isMyCard && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-500/20">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{email}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Assigned {new Date(a.assignedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                          assignmentStatusBadges[a.assignmentStatus as AssignmentStatus] ||
                          assignmentStatusBadges[AssignmentStatus.Assigned]
                        }`}
                      >
                        {a.assignmentStatus}
                      </span>

                      {(isMyCard || canManage) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setProgressModalData({
                              isOpen: true,
                              assignmentId: a.taskAssignmentId,
                              currentStatus: a.assignmentStatus,
                            })
                          }
                          className="text-xs font-semibold"
                        >
                          Update Status
                        </Button>
                      )}

                      {canManage && (
                        <button
                          onClick={async () => {
                            await taskAssignmentService.removeAssignment(a.taskAssignmentId);
                            loadData();
                          }}
                          className="p-1.5 text-rose-500 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Remove assignment"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (1/3): Quick Status Manager & Team Meta */}
        <div className="space-y-6">
          {/* Quick Status Control (For Managers) */}
          {canManage && (
            <div className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs space-y-4">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Task Status Control
              </span>
              <div className="space-y-2">
                {[
                  {
                    s: TaskStatus.Pending,
                    label: "Pending",
                    icon: (
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                  },
                  {
                    s: TaskStatus.InProgress,
                    label: "In Progress",
                    icon: (
                      <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    ),
                  },
                  {
                    s: TaskStatus.Completed,
                    label: "Completed",
                    icon: (
                      <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                  },
                  {
                    s: TaskStatus.OnHold,
                    label: "On Hold",
                    icon: (
                      <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                  },
                ].map(({ s, label, icon }) => (
                  <button
                    key={s}
                    onClick={() => handleQuickStatusChange(s)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      task.status === s
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                        : "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{icon}</span>
                      <span>{label}</span>
                    </span>
                    {task.status === s && (
                      <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Team Info Card */}
          <div className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Team Scope
              </span>
              <Link
                href={`/teams/${task.teamId}`}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
              >
                View Team →
              </Link>
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {task.team?.teamName}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                {task.team?.description || "Dedicated operational unit for this event."}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Event</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                  {(task as any).event?.eventName || (task.team?.event as any)?.eventName || "Event"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Created On</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {new Date(task.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AssignMemberModal
        isOpen={isAssignModalOpen}
        taskId={taskId}
        teamId={task.teamId}
        taskTitle={task.taskTitle}
        leaderMembershipId={task.team?.leaderMembershipId}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={loadData}
      />

      <UpdateMyProgressModal
        isOpen={progressModalData.isOpen}
        assignmentId={progressModalData.assignmentId}
        taskId={taskId}
        taskTitle={task.taskTitle}
        currentAssignmentStatus={progressModalData.currentStatus}
        currentTaskStatus={task.status}
        isManager={canManage}
        onClose={() =>
          setProgressModalData({
            isOpen: false,
            assignmentId: "",
            currentStatus: AssignmentStatus.Assigned,
          })
        }
        onSuccess={loadData}
      />

      <DeleteTaskModal
        isOpen={isDeleteModalOpen}
        taskTitle={task.taskTitle}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteTask}
      />
    </div>
  );
};
