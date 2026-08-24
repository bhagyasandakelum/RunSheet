"use client";

import React, { useState } from "react";
import { Invitation } from "@/types/common/entities";
import { InvitationStatus } from "@/types/common/enums";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface InvitationsTableProps {
  invitations: Invitation[];
  onResend?: (email: string) => void;
  isLoading?: boolean;
}

export const InvitationsTable: React.FC<InvitationsTableProps> = ({
  invitations,
  onResend,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const getStatusBadge = (status: InvitationStatus | string) => {
    switch (status) {
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-500/30 text-[11px] font-bold text-amber-700 dark:text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pending
          </span>
        );
      case "Accepted":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/30 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Accepted
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/50 border border-red-500/30 text-[11px] font-bold text-red-700 dark:text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Rejected
          </span>
        );
      case "Expired":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Expired
          </span>
        );
      default:
        return (
          <Badge variant="neutral" size="sm">
            {status}
          </Badge>
        );
    }
  };

  const filteredInvitations = invitations.filter((inv) => {
    const name = inv.user ? `${inv.user.firstName} ${inv.user.lastName}` : "";
    const email = inv.user?.email || "";
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredInvitations.length / itemsPerPage) || 1;
  const paginatedInvitations = filteredInvitations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCopyLink = (invId: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/invitations/${invId}`);
      setCopiedId(invId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name or email..."
            leftIcon={
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <th className="pb-3 px-3">Member</th>
              <th className="pb-3 px-3">Status</th>
              <th className="pb-3 px-3">Sent Date</th>
              <th className="pb-3 px-3">Expiration</th>
              <th className="pb-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  Loading invitations...
                </td>
              </tr>
            ) : paginatedInvitations.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No invitations match your search filter.
                </td>
              </tr>
            ) : (
              paginatedInvitations.map((inv) => {
                const user = inv.user;
                const name = user ? `${user.firstName} ${user.lastName}` : "Invited User";
                const email = user?.email || "Email pending";
                const initials = user
                  ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                  : "U";
                const sentDate = new Date(inv.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                const expirationDate = new Date(inv.expiresAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <tr key={inv.invitationId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    {/* Member */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        {user?.profilePhotoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.profilePhotoUrl}
                            alt={name}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-xs">
                            {initials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      {getStatusBadge(inv.status)}
                    </td>

                    {/* Sent Date */}
                    <td className="py-3.5 px-3 font-medium text-slate-600 dark:text-slate-300">
                      {sentDate}
                    </td>

                    {/* Expiration */}
                    <td className="py-3.5 px-3 font-medium text-slate-600 dark:text-slate-300">
                      {expirationDate}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(inv.invitationId)}
                          className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Copy Invitation Link"
                        >
                          {copiedId === inv.invitationId ? "Copied!" : "🔗 Copy Link"}
                        </button>

                        {(inv.status === "Pending" || inv.status === "Expired") && user?.email && (
                          <button
                            type="button"
                            onClick={() => onResend?.(user.email)}
                            className="px-2 py-1 rounded-lg text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                          >
                            Resend
                          </button>
                        )}
                      </div>
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
          Showing <span className="font-bold text-slate-900 dark:text-white">{Math.min(filteredInvitations.length, (currentPage - 1) * itemsPerPage + 1)}</span> to{" "}
          <span className="font-bold text-slate-900 dark:text-white">{Math.min(filteredInvitations.length, currentPage * itemsPerPage)}</span> of{" "}
          <span className="font-bold text-slate-900 dark:text-white">{filteredInvitations.length}</span> invitations
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
    </div>
  );
};
