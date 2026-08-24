"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export interface FormattedMember {
  eventMemberId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profilePhotoUrl?: string | null;
  joinedAt: string;
  teamName: string | null;
  isTeamLeader: boolean;
  isOrganizer: boolean;
}

export interface EventMembersTableProps {
  members: FormattedMember[];
  onRemoveMember?: (memberId: string) => Promise<void>;
  isLoading?: boolean;
  teamsList?: string[];
}

export const EventMembersTable: React.FC<EventMembersTableProps> = ({
  members,
  onRemoveMember,
  isLoading = false,
  teamsList = [],
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState<string>("ALL");

  // Deletion modal state
  const [memberToRemove, setMemberToRemove] = useState<FormattedMember | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredMembers = members.filter((m) => {
    const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
    const email = m.email.toLowerCase();
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      email.includes(searchQuery.toLowerCase());

    const matchesTeam =
      teamFilter === "ALL" ||
      (teamFilter === "UNASSIGNED" ? !m.teamName : m.teamName === teamFilter);

    return matchesSearch && matchesTeam;
  });

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage) || 1;
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleConfirmRemove = async () => {
    if (!memberToRemove || !onRemoveMember) return;
    try {
      setIsRemoving(true);
      await onRemoveMember(memberToRemove.eventMemberId);
      setMemberToRemove(null);
    } finally {
      setIsRemoving(false);
    }
  };

  const getRoleBadge = (m: FormattedMember) => {
    if (m.isOrganizer) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-500/30 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
          Organizer
        </span>
      );
    }
    if (m.isTeamLeader) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/80 border border-sky-500/30 text-[10px] font-extrabold text-sky-800 dark:text-sky-300 uppercase tracking-wider">
          Team Leader
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
        Member
      </span>
    );
  };

  const getTeamBadge = (teamName: string | null) => {
    if (!teamName) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-500">
          Unassigned
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 text-[11px] font-bold text-blue-700 dark:text-blue-300">
        {teamName}
      </span>
    );
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
      {/* Search & Team Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search volunteers by name, email..."
            leftIcon={
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={teamFilter}
            onChange={(e) => {
              setTeamFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          >
            <option value="ALL">Team: All</option>
            <option value="UNASSIGNED">Unassigned Only</option>
            {teamsList.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <th className="pb-3 px-3">Member</th>
              <th className="pb-3 px-3">Team</th>
              <th className="pb-3 px-3">Role</th>
              <th className="pb-3 px-3">Joined Date</th>
              <th className="pb-3 px-3">Status</th>
              <th className="pb-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  Loading members...
                </td>
              </tr>
            ) : paginatedMembers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No members match your search or filter.
                </td>
              </tr>
            ) : (
              paginatedMembers.map((m) => {
                const fullName = `${m.firstName} ${m.lastName}`;
                const initials = `${m.firstName[0]}${m.lastName[0]}`.toUpperCase();
                const joinedDate = new Date(m.joinedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <tr key={m.eventMemberId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    {/* Member */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        {m.profilePhotoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.profilePhotoUrl}
                            alt={fullName}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-black flex items-center justify-center text-xs">
                            {initials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {fullName}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {m.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Team */}
                    <td className="py-3.5 px-3">
                      {getTeamBadge(m.teamName)}
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-3">
                      {getRoleBadge(m)}
                    </td>

                    {/* Joined Date */}
                    <td className="py-3.5 px-3 font-medium text-slate-600 dark:text-slate-300">
                      {joinedDate}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-3 text-right">
                      {!m.isOrganizer && (
                        <button
                          type="button"
                          onClick={() => setMemberToRemove(m)}
                          className="text-[11px] font-semibold text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:underline p-1"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div>
          Showing <span className="font-bold text-slate-900 dark:text-white">{Math.min(filteredMembers.length, (currentPage - 1) * itemsPerPage + 1)}</span> to{" "}
          <span className="font-bold text-slate-900 dark:text-white">{Math.min(filteredMembers.length, currentPage * itemsPerPage)}</span> of{" "}
          <span className="font-bold text-slate-900 dark:text-white">{filteredMembers.length}</span> members
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="px-2 text-xs font-semibold">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Remove Member Modal */}
      {memberToRemove && (
        <Modal
          isOpen={Boolean(memberToRemove)}
          onClose={() => setMemberToRemove(null)}
          title="Remove Member from Event"
          description={`Are you sure you want to remove ${memberToRemove.firstName} ${memberToRemove.lastName} from this event? They will lose access to all teams and assignments.`}
          maxWidth="md"
        >
          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setMemberToRemove(null)}
              disabled={isRemoving}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmRemove}
              isLoading={isRemoving}
            >
              Remove Member
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
