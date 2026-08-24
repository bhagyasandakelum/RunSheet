"use client";

import React, { useState, useEffect } from "react";
import { userService } from "@/services/user-service";
import { teamMembershipService } from "@/services/team-membership-service";
import { User, Team } from "@/types/common/entities";
import { Button } from "@/components/ui/button";

export interface AddTeamMemberModalProps {
  isOpen: boolean;
  team: Team | null;
  currentMemberUserIds?: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export const AddTeamMemberModal: React.FC<AddTeamMemberModalProps> = ({
  isOpen,
  team,
  currentMemberUserIds = [],
  onClose,
  onSuccess,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [manualEmail, setManualEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSelectedUser(null);
      setManualEmail("");
      setError(null);
      return;
    }

    const fetchUsers = async () => {
      try {
        setIsSearching(true);
        const results = await userService.searchUsers(searchQuery, currentMemberUserIds);
        setUsers(results);
      } catch (err) {
        console.error("Failed to search users:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [isOpen, searchQuery, currentMemberUserIds]);

  if (!isOpen || !team) return null;

  const handleAddMember = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (selectedUser) {
        await teamMembershipService.addMemberToTeam(team.teamId, {
          userId: selectedUser.userId,
        });
      } else if (manualEmail.trim()) {
        await teamMembershipService.addMemberToTeam(team.teamId, {
          email: manualEmail.trim(),
        });
      } else {
        setError("Please select a user or enter an email address.");
        setIsSubmitting(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to add member to team.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl z-10 animate-in fade-in-50 zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Add Member to {team.teamName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select an available user or add by email to join this team.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="mt-4 space-y-4">
          {/* Search Candidate */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Search Registered Users
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedUser(null);
                }}
                className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-[#1A2234] text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
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
          </div>

          {/* User Candidates List */}
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-2 bg-slate-50/50 dark:bg-slate-900/30">
            {isSearching ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Searching users...
              </div>
            ) : users.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No users found. Try searching or enter an email below.
              </div>
            ) : (
              users.map((u) => {
                const isSelected = selectedUser?.userId === u.userId;
                return (
                  <div
                    key={u.userId}
                    onClick={() => {
                      setSelectedUser(u);
                      setManualEmail("");
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/40 text-emerald-900 dark:text-emerald-200"
                        : "hover:bg-white dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
                        {u.firstName[0]}
                        {u.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">
                          {u.firstName} {u.lastName}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                          {u.email}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                        ✓ Selected
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Or manual email fallback */}
          <div>
            <div className="flex items-center gap-2 my-2">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              <span className="text-[10px] font-bold uppercase text-slate-400">
                OR ADD BY EMAIL
              </span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>
            <input
              type="email"
              placeholder="user@example.com"
              value={manualEmail}
              onChange={(e) => {
                setManualEmail(e.target.value);
                setSelectedUser(null);
              }}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-[#1A2234] text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleAddMember}
            isLoading={isSubmitting}
            disabled={!selectedUser && !manualEmail.trim()}
            className="bg-[#28c740] hover:bg-[#23b33a] text-white font-bold"
          >
            Add Member
          </Button>
        </div>
      </div>
    </div>
  );
};
