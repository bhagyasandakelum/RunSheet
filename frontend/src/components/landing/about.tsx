"use client";

import React from "react";

export const LandingAbout: React.FC = () => {
  const principles = [
    {
      title: "Built for Real-World Event Pressure",
      description:
        "Live events leave no room for guesswork. RunSheet provides a single source of truth so teams always know what to do, when to do it, and who is responsible.",
    },
    {
      title: "Decentralized Team Empowerment",
      description:
        "Organizers maintain overarching oversight while team leaders independently coordinate their crews and members update progress autonomously.",
    },
    {
      title: "Simple, Frictionless Experience",
      description:
        "No complex onboarding or steep learning curve. Fast invites, clear task assignments, and instant notifications keep operations fluid.",
    },
  ];

  return (
    <section id="about" className="py-20 sm:py-28 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            About RunSheet
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
            RunSheet is a modern event management platform designed to turn complex event logistics into a calm, coordinated, and reliable team experience.
          </p>
        </div>

        {/* Story & Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {principles.map((item, idx) => (
            <div
              key={idx}
              className="p-8 rounded-2xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-primary/50 transition-colors"
            >
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
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
