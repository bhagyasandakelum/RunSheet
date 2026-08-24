"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { teamService } from "@/services/team-service";

export interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
  onSuccess?: () => void;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  isOpen,
  onClose,
  eventId,
  eventName,
  onSuccess,
}) => {
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) {
      setError("Please provide a team name.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await teamService.createTeam(eventId, {
        teamName: teamName.trim(),
        description: description.trim() || undefined,
      });
      setTeamName("");
      setDescription("");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to create team.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Team"
      description={`Add a specialized operational team to "${eventName}".`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error ? (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        ) : null}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Team Name <span className="text-red-500">*</span>
          </label>
          <Input
            value={teamName}
            onChange={(e) => {
              setTeamName(e.target.value);
              setError(null);
            }}
            placeholder="e.g. Tech Ops, Security & Logistics, Media"
            disabled={isLoading}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Responsibilities and goals for this team..."
            rows={3}
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
          >
            Create Team
          </Button>
        </div>
      </form>
    </Modal>
  );
};
