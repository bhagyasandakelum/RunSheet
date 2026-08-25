"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { taskService } from "@/services/task-service";
import { Task } from "@/types/common/entities";
import { TaskPriority, TaskStatus } from "@/types/common/enums";
import { Button } from "@/components/ui/button";

export interface EditTaskFormProps {
  taskId: string;
}

export const EditTaskForm: React.FC<EditTaskFormProps> = ({ taskId }) => {
  const router = useRouter();

  const [task, setTask] = useState<Task | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.Medium);
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.Pending);
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await taskService.getTaskDetails(taskId);
        setTask(data);
        setTaskTitle(data.taskTitle || "");
        setDescription(data.description || "");
        setPriority(data.priority || TaskPriority.Medium);
        setStatus(data.status || TaskStatus.Pending);

        if (data.dueDate) {
          const d = new Date(data.dueDate);
          const dateStr = d.toISOString().split("T")[0];
          const hours = String(d.getHours()).padStart(2, "0");
          const mins = String(d.getMinutes()).padStart(2, "0");
          setDueDate(dateStr);
          setDueTime(`${hours}:${mins}`);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || "Failed to load task details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      await taskService.updateTask(taskId, {
        taskTitle: taskTitle.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: isoDueDate,
      });

      if (task && status !== task.status) {
        await taskService.updateTaskStatus(taskId, { status });
      }

      router.push(`/tasks/${taskId}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to update task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-xs font-semibold text-slate-400">
        Loading task editor...
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

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Breadcrumb Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/tasks" className="hover:text-emerald-600 transition-colors">
            Tasks
          </Link>
          <span>/</span>
          <Link href={`/tasks/${taskId}`} className="hover:text-emerald-600 transition-colors">
            {task.taskTitle}
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-bold">Edit</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Edit Task
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Update task details, deadlines, status, and priority levels.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          {/* Team and Event Context Info */}
          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400">
              Team: <span className="text-slate-900 dark:text-white font-bold">{task.team?.teamName || "Assigned Team"}</span>
            </span>
            <span className="text-slate-400">
              Event: {task.team?.event?.eventName || "RunSheet Event"}
            </span>
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              maxLength={255}
              required
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-[#1A2234] text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Description &amp; Instructions
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={3000}
              className="w-full p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-[#1A2234] text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none"
            />
          </div>

          {/* Priority & Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                Task Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full h-11 px-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-[#1A2234] text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                <option value={TaskStatus.Pending}>Pending</option>
                <option value={TaskStatus.InProgress}>In Progress</option>
                <option value={TaskStatus.Completed}>Completed</option>
                <option value={TaskStatus.OnHold}>On Hold</option>
                <option value={TaskStatus.Cancelled}>Cancelled</option>
              </select>
            </div>
          </div>

          {/* Due Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href={`/tasks/${taskId}`}>
            <Button variant="outline" size="md" className="text-xs font-semibold">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            disabled={!taskTitle.trim()}
            className="bg-[#28c740] hover:bg-[#23b33a] text-white font-bold px-6 text-xs"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
