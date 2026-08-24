"use client";

import React from "react";

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  tag: string;
  active?: boolean;
}

export interface LiveTimelinePanelProps {
  events?: TimelineEvent[];
}

export const LiveTimelinePanel: React.FC<LiveTimelinePanelProps> = ({
  events = [],
}) => {
  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131b2e] p-5 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Today&apos;s Schedule
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          Live Track
        </span>
      </div>

      {/* Timeline items */}
      <div className="space-y-4 relative flex-1">
        {events.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 font-medium">
            No scheduled milestones yet today.
          </div>
        ) : (
          <>
            {/* Continuous line */}
            <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-slate-100 dark:bg-slate-800" />

            {events.map((event) => (
              <div key={event.id} className="relative flex items-start gap-3 pl-1">
                {/* Timeline node */}
                <div
                  className={`w-3.5 h-3.5 rounded-full mt-0.5 shrink-0 ring-4 ${
                    event.active
                      ? "bg-emerald-500 ring-emerald-100 dark:ring-emerald-950/80"
                      : "bg-slate-300 dark:bg-slate-700 ring-white dark:ring-slate-900"
                  }`}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                      {event.time}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                      {event.tag}
                    </span>
                  </div>
                  <p
                    className={`text-xs mt-0.5 font-medium leading-snug ${
                      event.active
                        ? "text-emerald-600 dark:text-emerald-400 font-bold"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {event.title}
                  </p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
