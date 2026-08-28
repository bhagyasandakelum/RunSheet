"use client";

import React from "react";

export const LandingFeatures: React.FC = () => {
  const features = [
    {
      id: "01",
      title: "Event Management",
      description:
        "Create, organize, and orchestrate multiple events from one centralized workspace.",
    },
    {
      id: "02",
      title: "Team Management",
      description:
        "Structure members into specialized functional teams and designate team leaders.",
    },
    {
      id: "03",
      title: "Task Management",
      description:
        "Create, assign, prioritize, and track tasks with deadlines and clear operational ownership.",
    },
    {
      id: "04",
      title: "Task Progress",
      description:
        "Members update their own progress while team leaders manage overall task completion.",
    },
    {
      id: "05",
      title: "Invitations",
      description:
        "Invite crew members to events via email and monitor invitation acceptance status in real time.",
    },
    {
      id: "06",
      title: "Notifications",
      description:
        "Receive relevant updates, urgent reminders, and event/task notifications instantly.",
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-28 border-t border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Clean, Human-Coded Section Header (No circle rectangle pill badges) */}
        <div className="max-w-3xl mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Built for Real-World Event Operations
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
            Essential tools designed to manage teams, coordinate responsibilities, and keep events running seamlessly.
          </p>
        </div>

        {/* 6 Feature Grid without clunky circle icon boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111625] hover:border-primary/50 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="text-sm font-mono font-bold text-slate-400 dark:text-slate-500 mb-6">
                  {feature.id}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
