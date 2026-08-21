"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MemberActionItem } from "@/services/dashboard-service";
import { taskAssignmentService } from "@/services/task-assignment-service";
import { AssignmentStatus } from "@/types/common/enums";

export interface ActionItemsTableProps {
  items?: MemberActionItem[];
  onStatusChange?: (taskAssignmentId: string, newStatus: AssignmentStatus) => void;
}

const DEFAULT_ACTION_ITEMS: MemberActionItem[] = [
  {
    taskAssignmentId: "ta-demo-1",
    taskId: "t-1",
    taskTitle: "Setup Registration Desks",
    location: "Main Hallway A",
    priority: "High",
    status: "InProgress",
    assignmentStatus: "InProgress",
    teamName: "Event Ops Team",
  },
  {
    taskAssignmentId: "ta-demo-2",
    taskId: "t-2",
    taskTitle: "Briefing with A/V Team",
    location: "Room 302",
    priority: "Medium",
    status: "Pending",
    assignmentStatus: "Assigned",
    teamName: "Event Ops Team",
  },
  {
    taskAssignmentId: "ta-demo-3",
    taskId: "t-3",
    taskTitle: "Distribute Staff Radios",
    location: "Ops HQ",
    priority: "High",
    status: "Completed",
    assignmentStatus: "Completed",
    teamName: "Event Ops Team",
  },
];

export const ActionItemsTable: React.FC<ActionItemsTableProps> = ({
  items = DEFAULT_ACTION_ITEMS,
  onStatusChange,
}) => {
  const [localItems, setLocalItems] = useState<MemberActionItem[]>(items);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Sync with prop when it changes
  React.useEffect(() => {
    if (items && items.length > 0) {
      setLocalItems(items);
    }
  }, [items]);

  const handleToggleStatus = async (item: MemberActionItem) => {
    let nextStatus: AssignmentStatus = AssignmentStatus.InProgress;
    if (item.assignmentStatus === "Assigned") {
      nextStatus = AssignmentStatus.InProgress;
    } else if (item.assignmentStatus === "InProgress") {
      nextStatus = AssignmentStatus.Completed;
    } else {
      nextStatus = AssignmentStatus.Assigned;
    }

    // Optimistic update
    setLocalItems((prev) =>
      prev.map((it) =>
        it.taskAssignmentId === item.taskAssignmentId
          ? { ...it, assignmentStatus: nextStatus }
          : it
      )
    );

    if (onStatusChange) {
      onStatusChange(item.taskAssignmentId, nextStatus);
    }

    // Persist if not demo ID
    if (!item.taskAssignmentId.startsWith("ta-demo")) {
      setUpdatingId(item.taskAssignmentId);
      try {
        await taskAssignmentService.updateAssignmentStatus(item.taskAssignmentId, {
          assignmentStatus: nextStatus,
        });
      } catch (err) {
        console.error("Failed to update assignment status:", err);
      } finally {
        setUpdatingId(null);
      }
    }
  };

  const renderPriorityBadge = (priority: string) => {
    const p = (priority || "Medium").toLowerCase();
    if (p === "high" || p === "critical") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-red-100/80 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200/60 dark:border-red-900/40">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {priority}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40">
        {priority}
      </span>
    );
  };

  const renderStatusBadge = (status: string) => {
    const s = (status || "Assigned").toLowerCase();
    if (s === "completed") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#28c740] text-white shadow-xs">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Completed
        </span>
      );
    }
    if (s === "inprogress" || s === "in progress") {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
          In Progress
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
        Assigned
      </span>
    );
  };

  const displayList = localItems.length > 0 ? localItems : DEFAULT_ACTION_ITEMS;

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131b2e] p-5 md:p-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-100/80 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Action Items
          </h2>
        </div>

        <Link
          href="/tasks"
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline"
        >
          <span>View All</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <th className="pb-3 pr-4 font-semibold">Task</th>
              <th className="pb-3 px-4 font-semibold">Priority</th>
              <th className="pb-3 px-4 font-semibold">Status</th>
              <th className="pb-3 pl-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/50">
            {displayList.map((item) => (
              <tr
                key={item.taskAssignmentId}
                className="group hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                {/* Task Title & Location */}
                <td className="py-3.5 pr-4">
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                    {item.taskTitle}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {item.location || item.teamName || "Main Hallway A"}
                  </p>
                </td>

                {/* Priority */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  {renderPriorityBadge(item.priority)}
                </td>

                {/* Status */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  {renderStatusBadge(item.assignmentStatus)}
                </td>

                {/* Action */}
                <td className="py-3.5 pl-4 text-right whitespace-nowrap">
                  <button
                    onClick={() => handleToggleStatus(item)}
                    disabled={updatingId === item.taskAssignmentId}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Click to toggle status"
                  >
                    {item.assignmentStatus === "Completed" ? (
                      <span className="text-emerald-600 dark:text-emerald-400">Reopen</span>
                    ) : item.assignmentStatus === "InProgress" ? (
                      <span className="text-emerald-600 dark:text-emerald-400">Mark Done</span>
                    ) : (
                      <span>Start</span>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
