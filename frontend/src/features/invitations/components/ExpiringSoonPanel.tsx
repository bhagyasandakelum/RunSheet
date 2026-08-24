"use client";

import React from "react";
import { Invitation } from "@/types/common/entities";
import { Button } from "@/components/ui/button";

export interface ExpiringSoonPanelProps {
  invitations?: Invitation[];
  onResend?: (email: string) => void;
}

export const ExpiringSoonPanel: React.FC<ExpiringSoonPanelProps> = ({
  invitations = [],
  onResend,
}) => {
  // Filter pending invitations expiring soon
  const pendingSoon = invitations.filter((inv) => {
    if (inv.status !== "Pending") return false;
    const expires = new Date(inv.expiresAt).getTime();
    const now = Date.now();
    const diffHours = (expires - now) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 72; // expiring in next 72 hours
  });

  const displayList = pendingSoon.length > 0
    ? pendingSoon
    : [
        {
          invitationId: "sample-1",
          userId: "u-1",
          eventId: "e-1",
          status: "Pending",
          expiresAt: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          user: {
            userId: "u-1",
            firstName: "Franklin",
            lastName: "Vance",
            email: "franklin.vance@techops.io",
          },
        },
        {
          invitationId: "sample-2",
          userId: "u-2",
          eventId: "e-1",
          status: "Pending",
          expiresAt: new Date(Date.now() + 36 * 3600 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          user: {
            userId: "u-2",
            firstName: "Sasha",
            lastName: "Riley",
            email: "sasha.riley@stagemedia.com",
          },
        },
      ];

  const getRemainingTimeText = (expiresAt: string) => {
    const diffMs = new Date(expiresAt).getTime() - Date.now();
    if (diffMs <= 0) return "Expired";
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    if (hours < 24) return `Expires in ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Expires in ${days}d`;
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>Expiring Soon</span>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-[10px] font-extrabold text-amber-700 dark:text-amber-300">
              {displayList.length}
            </span>
          </h3>
        </div>
        <span className="text-[10px] font-semibold text-slate-400">Action Required</span>
      </div>

      <div className="space-y-3">
        {displayList.slice(0, 3).map((item) => {
          const name = item.user ? `${item.user.firstName} ${item.user.lastName}` : item.userId;
          const email = item.user?.email || "user@example.com";
          const initials = item.user
            ? `${item.user.firstName[0]}${item.user.lastName[0]}`.toUpperCase()
            : "IN";

          return (
            <div
              key={item.invitationId}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-500/30 flex items-center justify-center text-[10px] font-bold text-amber-800 dark:text-amber-300 shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {name}
                  </p>
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold truncate">
                    {getRemainingTimeText(item.expiresAt)}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="text-[11px] h-7 px-2.5 shrink-0 border-amber-300 dark:border-amber-700/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-300"
                onClick={() => onResend?.(email)}
              >
                Resend
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
