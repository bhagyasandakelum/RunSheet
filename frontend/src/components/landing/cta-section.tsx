"use client";

import React from "react";
import Link from "next/link";

export const LandingCtaSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 dark:bg-[#111625] text-white p-8 sm:p-12 lg:p-16 border border-slate-800 text-center relative overflow-hidden shadow-2xl">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Ready to organize your next event?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-normal max-w-xl mx-auto leading-relaxed">
              Bring your teams, tasks, and event activities together in one place.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary hover:bg-[#38C238] active:bg-[#2EA62E] text-slate-950 font-bold text-base shadow-md shadow-primary/25 hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Get Started</span>
                <svg
                  className="w-4 h-4"
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
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white hover:bg-slate-800 font-semibold text-base transition-all flex items-center justify-center"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
