"use client";

import React from "react";

export const LandingHowItWorks: React.FC = () => {
  const steps = [
    {
      step: "01",
      title: "Create or Join an Event",
      description:
        "Start a new event as an organizer or accept an email invitation with a single click.",
    },
    {
      step: "02",
      title: "Build Your Team",
      description:
        "Form functional squads, assign designated team leaders, and invite participating crew members.",
    },
    {
      step: "03",
      title: "Assign & Track Tasks",
      description:
        "Delegate tasks with clear priority tags, deadlines, and direct member assignments.",
    },
    {
      step: "04",
      title: "Stay Updated",
      description:
        "Track live progress percentages, resolve roadblocks, and receive instant operational notifications.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 border-t border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header (No circle rectangle pill badges) */}
        <div className="max-w-3xl mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How RunSheet Works
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
            From initial event setup to real-time live execution in 4 straightforward steps.
          </p>
        </div>

        {/* 4 Steps Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item) => (
            <div
              key={item.step}
              className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111625] flex flex-col justify-between hover:border-primary/50 transition-colors"
            >
              <div>
                <div className="text-2xl font-black text-slate-300 dark:text-slate-700 font-mono mb-4">
                  {item.step}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
