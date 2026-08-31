"use client";

import React, { useState, useEffect, useCallback } from "react";
import { teamMembershipService } from "@/services/team-membership-service";
import { taskAssignmentService } from "@/services/task-assignment-service";
import { TeamMembership, TaskAssignment } from "@/types/common/entities";
import { Button } from "@/components/ui/button";

export interface AssignMemberModalProps {
  isOpen: boolean;
  taskId: string;
  teamId: string;
  taskTitle: string;
  leaderMembershipId?: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AssignMemberModal: React.FC<AssignMemberModalProps> = ({
  isOpen,
  taskId,
  teamId,
  taskTitle,
  leaderMembershipId,
  onClose,
  onSuccess,
}) => {
  const [teamMembers, setTeamMembers] = useState<TeamMembership[]>([]);
  const [currentAssignments, setCurrentAssignments] = useState<TaskAssignment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!taskId || !teamId) return;
    try {
      setIsLoading(true);
      setError(null);
      const [membersData, assignmentsData] = await Promise.all([
        teamMembershipService.getTeamMembers(teamId),
        taskAssignmentService.getTaskAssignments(taskId),
      ]);
      setTeamMembers(membersData || []);
      setCurrentAssignments(assignmentsData || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load team members.");
    } finally {
      setIsLoading(false);
    }
  }, [taskId, teamId]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  if (!isOpen) return null;

  const assignedMembershipIds = new Set(
    currentAssignments.map((a: any) => a.teamMembershipId)
  );

  const handleAssign = async (membershipId: string) => {
    if (currentAssignments.length >= 3) {
      setError("Maximum 3 assignees allowed per task.");
      return;
    }
    try {
      setIsProcessingId(membershipId);
      setError(null);
      await taskAssignmentService.assignMemberToTask(taskId, {
        teamMembershipId: membershipId,
      });
      await loadData();
      onSuccess?.();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to assign member.");
    } finally {
      setIsProcessingId(null);
    }
  };

  const handleUnassign = async (membershipId: string) => {
    const assignment = currentAssignments.find(
      (a: any) => a.teamMembershipId === membershipId
    );
    if (!assignment) return;

    try {
      setIsProcessingId(membershipId);
      setError(null);
      await taskAssignmentService.removeAssignment(assignment.taskAssignmentId);
      await loadData();
      onSuccess?.();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to remove assignment.");
    } finally {
      setIsProcessingId(null);
    }
  };

  const filteredMembers = teamMembers.filter((m: any) => {
    const firstName = m.firstName || m.user?.firstName || m.eventMember?.user?.firstName || "";
    const lastName = m.lastName || m.user?.lastName || m.eventMember?.user?.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim().toLowerCase();
    const email = (m.email || m.user?.email || m.eventMember?.user?.email || "").toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    return fullName.includes(query) || email.includes(query);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 max-h-[85vh] flex flex-col animate-in fade-in-50 zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Task Delegation
            </span>
            <h2 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
              Assign Team Members
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-sm sm:max-w-md">
              Task: <span className="font-semibold text-slate-700 dark:text-slate-200">&quot;{taskTitle}&quot;</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Counter pill */}
        <div className="mt-4 flex items-center justify-between p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-500/20 text-xs">
          <span className="text-slate-600 dark:text-slate-300 font-medium">
            Assigned Members:
          </span>
          <span className="font-extrabold text-emerald-700 dark:text-emerald-300">
            {currentAssignments.length} / 3 Maximum
          </span>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-xs text-red-600 dark:text-red-400 font-medium">
            {error}
          </div>
        )}

        {/* Search Input */}
        <div className="mt-4 relative">
          <input
            type="text"
            placeholder="Search team members by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/60 dark:bg-[#1A2234] text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
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

        {/* Members List */}
        <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px] max-h-72">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400 font-medium">
              Loading team roster...
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 font-medium bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              No team members available.
            </div>
          ) : (
            filteredMembers.map((m: any) => {
              const firstName = m.firstName || m.user?.firstName || m.eventMember?.user?.firstName || "";
              const lastName = m.lastName || m.user?.lastName || m.eventMember?.user?.lastName || "";
              const name = `${firstName} ${lastName}`.trim() || m.name || "Member";
              const email = m.email || m.user?.email || m.eventMember?.user?.email || "";
              const avatar = m.profilePhotoUrl || m.user?.profilePhotoUrl || m.eventMember?.user?.profilePhotoUrl || null;
              const isLeader = Boolean(leaderMembershipId === m.teamMembershipId || m.isLeader);
              const isAssigned = assignedMembershipIds.has(m.teamMembershipId);
              const isProcessing = isProcessingId === m.teamMembershipId;

              return (
                <div
                  key={m.teamMembershipId}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    isAssigned
                      ? "border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/20"
                      : "border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#1A2234]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-300 overflow-hidden shrink-0">
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
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {name}
                        </p>
                        {isLeader && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-500/30">
                            Leader
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{email}</p>
                    </div>
                  </div>

                  <div>
                    {isAssigned ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnassign(m.teamMembershipId)}
                        isLoading={isProcessing}
                        className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-300 dark:border-rose-900 text-xs font-bold"
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAssign(m.teamMembershipId)}
                        disabled={currentAssignments.length >= 3}
                        isLoading={isProcessing}
                        className="bg-[#28c740] hover:bg-[#23b33a] text-white text-xs font-bold"
                      >
                        + Assign
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <Button
            variant="outline"
            size="md"
            onClick={onClose}
            className="text-xs font-semibold"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
