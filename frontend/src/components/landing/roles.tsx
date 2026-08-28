"use client";

import React from "react";

export const LandingRoles: React.FC = () => {
  const roles = [
    {
      title: "Event Organizer",
      badge: "Full Event Scope",
      description:
        "Manage events, teams, members, tasks, assignments, and overall event activities.",
      responsibilities: [
        "Create and configure events",
        "Form teams and assign team leaders",
        "Oversee all task assignments across teams",
        "Send event invitations and track RSVPs",
      ],
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: "Team Leader",
      badge: "Team Coordination",
      description:
        "Manage your team, coordinate tasks, and monitor overall task completion.",
      responsibilities: [
        "Coordinate your assigned team members",
        "Create and assign team-specific tasks",
        "Review and manage task progress updates",
        "Ensure milestone completion on schedule",
      ],
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: "Team Member",
      badge: "Task Execution",
      description:
        "View relevant event and team information and update your assigned task progress.",
      responsibilities: [
        "View assigned tasks and clear deadlines",
        "Update personal task completion percentage",
        "Access team rosters and event guidelines",
        "Receive instant notifications and updates",
      ],
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="roles" className="py-20 sm:py-28 bg-slate-50/70 dark:bg-slate-900/30 border-y border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-slate-900 dark:text-primary text-xs font-semibold uppercase tracking-wider">
            Contextual Roles
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Designed for Every Role
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            RunSheet adapts to your role per event. You can organize one event, lead a team in another, or participate as a member elsewhere.
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {roles.map((role, idx) => (
            <div
              key={idx}
              className="p-7 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-primary/50 transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-slate-900 dark:text-primary flex items-center justify-center border border-primary/20">
                    {role.icon}
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {role.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {role.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                  {role.description}
                </p>

                <div className="pt-5 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                    Key Capabilities
                  </span>
                  <ul className="space-y-2">
                    {role.responsibilities.map((resp, rIdx) => (
                      <li
                        key={rIdx}
                        className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2"
                      >
                        <svg
                          className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Context Notice */}
        <div className="mt-12 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111625] border border-slate-200/80 dark:border-slate-800 text-center max-w-2xl mx-auto shadow-sm">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <strong className="font-semibold text-slate-900 dark:text-white">
              Event-Specific Permissions:
            </strong>{" "}
            Roles are assigned on an event-by-event basis. Your account maintains one identity while participating flexibly in multiple events.
          </p>
        </div>
      </div>
    </section>
  );
};
