"use client";

import React, { useState } from "react";
import { taskAssignmentService } from "@/services/task-assignment-service";
import { taskService } from "@/services/task-service";
import { AssignmentStatus, TaskStatus } from "@/types/common/enums";
import { Button } from "@/components/ui/button";

export interface UpdateMyProgressModalProps {
  isOpen: boolean;
  assignmentId: string;
  taskId: string;
  taskTitle: string;
  currentAssignmentStatus: AssignmentStatus;
  currentTaskStatus?: TaskStatus;
  isManager?: boolean; // can also update main task status
  onClose: () => void;
  onSuccess: () => void;
}

export const UpdateMyProgressModal: React.FC<UpdateMyProgressModalProps> = ({
  isOpen,
  assignmentId,
  taskId,
  taskTitle,
  currentAssignmentStatus,
  currentTaskStatus,
  isManager = false,
  onClose,
  onSuccess,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<AssignmentStatus>(
    currentAssignmentStatus || AssignmentStatus.Assigned
  );
  const [selectedTaskStatus, setSelectedTaskStatus] = useState<TaskStatus>(
    currentTaskStatus || TaskStatus.Pending
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);

      // Update assignment status
      await taskAssignmentService.updateAssignmentStatus(assignmentId, {
        assignmentStatus: selectedStatus,
      });

      // If manager changed overall task status or assignment completed
      if (isManager && selectedTaskStatus !== currentTaskStatus) {
        await taskService.updateTaskStatus(taskId, {
          status: selectedTaskStatus,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to update progress.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions: { value: AssignmentStatus; label: string; desc: string; icon: string }[] = [
    {
      value: AssignmentStatus.Assigned,
      label: "Assigned",
      desc: "Task is queued and ready to be started.",
      icon: "📋",
    },
    {
      value: AssignmentStatus.InProgress,
      label: "In Progress",
      desc: "Actively working on this operational task.",
      icon: "⚡",
    },
    {
      value: AssignmentStatus.Completed,
      label: "Completed",
      desc: "Work finished and milestone requirements met.",
      icon: "✅",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 animate-in fade-in-50 zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Operational Status
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              Update Progress
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-sm">
              &quot;{taskTitle}&quot;
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-xs text-red-600 dark:text-red-400 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              My Assignment Status
            </label>
            <div className="space-y-2">
              {statusOptions.map((opt) => {
                const isSelected = selectedStatus === opt.value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => setSelectedStatus(opt.value)}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500"
                        : "border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-[#1A2234] hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <span className="text-lg">{opt.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {opt.label}
                        </p>
                        {isSelected && (
                          <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                            ✓ Selected
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {opt.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Optional: Overall Task Status if Manager */}
          {isManager && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Overall Task Status (Team Lead / Organizer)
              </label>
              <select
                value={selectedTaskStatus}
                onChange={(e) => setSelectedTaskStatus(e.target.value as TaskStatus)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-[#1A2234] text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                <option value={TaskStatus.Pending}>Pending</option>
                <option value={TaskStatus.InProgress}>In Progress</option>
                <option value={TaskStatus.Completed}>Completed</option>
                <option value={TaskStatus.OnHold}>On Hold</option>
                <option value={TaskStatus.Cancelled}>Cancelled</option>
              </select>
            </div>
          )}

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              className="bg-[#28c740] hover:bg-[#23b33a] text-white font-bold text-xs"
            >
              Save Progress
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
