"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export interface DeleteTaskModalProps {
  isOpen: boolean;
  taskTitle: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const DeleteTaskModal: React.FC<DeleteTaskModalProps> = ({
  isOpen,
  taskTitle,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to delete task.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 animate-in fade-in-50 zoom-in-95">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Delete Task
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This action cannot be undone.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-xs text-red-600 dark:text-red-400 font-medium">
            {error}
          </div>
        )}

        <p className="mt-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Are you sure you want to permanently delete <span className="font-bold text-slate-900 dark:text-white">&quot;{taskTitle}&quot;</span>? All member assignments and tracked progress for this task will be removed.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isDeleting}
            className="text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={handleDelete}
            isLoading={isDeleting}
            className="bg-rose-600 hover:bg-rose-700 text-white border-transparent text-xs font-bold"
          >
            Delete Task
          </Button>
        </div>
      </div>
    </div>
  );
};
