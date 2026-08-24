"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";

export interface InviteMemberLivePreviewProps {
  eventName?: string;
  inviteeEmail?: string;
  message?: string;
}

export const InviteMemberLivePreview: React.FC<InviteMemberLivePreviewProps> = ({
  eventName = "Your Event Title",
  inviteeEmail = "member@organization.com",
  message,
}) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const expiryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Live Preview
        </h4>
      </div>

      {/* Preview Card */}
      <div className="rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 shadow-md overflow-hidden transition-all duration-300">
        {/* Banner with Event Tag */}
        <div className="relative h-28 w-full bg-gradient-to-tr from-slate-900 via-indigo-950 to-teal-900 p-4 flex flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:14px_14px] opacity-20" />

          <div className="relative z-10 flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-semibold text-white/90">
              RunSheet Invitation
            </span>
            <Badge variant="warning" size="sm">
              Pending
            </Badge>
          </div>

          <div className="relative z-10">
            <h3 className="text-base font-black text-white truncate">
              {eventName}
            </h3>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 space-y-3.5">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Recipient Invitee
            </span>
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {inviteeEmail || "recipient@example.com"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block">Sent Date</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{currentDate}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block">Valid Until</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{expiryDate}</span>
            </div>
          </div>

          {message && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs italic text-slate-600 dark:text-slate-300">
              &ldquo;{message}&rdquo;
            </div>
          )}
        </div>
      </div>

      {/* IMPORTANT RULES Callout */}
      <div className="p-4 rounded-2xl bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-900/40 space-y-2 text-xs text-sky-950 dark:text-sky-200">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-sky-700 dark:text-sky-300">
          <span>ℹ️</span>
          <span>Important Rules</span>
        </div>
        <ul className="space-y-1 text-[11px] text-sky-800 dark:text-sky-300 list-disc list-inside">
          <li>One invitation per user per event.</li>
          <li>Accepted invitations automatically create an Event Member.</li>
          <li>Expired invitations can be re-sent anytime.</li>
        </ul>
      </div>
    </div>
  );
};
