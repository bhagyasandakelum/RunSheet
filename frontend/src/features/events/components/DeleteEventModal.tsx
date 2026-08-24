"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export interface DeleteEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventName: string;
  onConfirm: () => Promise<void>;
}

export const DeleteEventModal: React.FC<DeleteEventModalProps> = ({
  isOpen,
  onClose,
  eventName,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      await onConfirm();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to delete event.");
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Event"
      description="This action cannot be undone. All teams, tasks, and member assignments associated with this event will be permanently deleted."
      maxWidth="md"
    >
      <div className="space-y-4 pt-2">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-red-900 dark:text-red-300 space-y-1">
          <p className="font-bold">Are you sure you want to delete this event?</p>
          <p className="text-slate-600 dark:text-slate-400">
            Event Name: <span className="font-semibold text-slate-900 dark:text-white font-mono">{eventName}</span>
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Yes, Delete Event
          </Button>
        </div>
      </div>
    </Modal>
  );
};
