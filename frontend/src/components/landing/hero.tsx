"use client";

import React from "react";
import Link from "next/link";

export const LandingHero: React.FC = () => {
  return (
    <section className="relative pt-20 pb-24 sm:pt-28 sm:pb-32 lg:pt-36 lg:pb-40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Hero Header - Clean, Focused, Ends with CTA Buttons */}
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
            Plan, Organize, and Manage Events —{" "}
            <span className="text-[#32b832] dark:text-[#44D944]">
              All in One Place
            </span>
          </h1>

          <p className="text-lg sm:text-2xl text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
            Organize events, manage teams, assign tasks, track progress, and
            keep everyone informed from one centralized platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-9 py-4 rounded-xl bg-primary hover:bg-[#38C238] active:bg-[#2EA62E] text-slate-950 font-bold text-base sm:text-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-9 py-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-base sm:text-lg transition-all flex items-center justify-center"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
