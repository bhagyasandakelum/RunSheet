"use client";

import React from "react";
import Link from "next/link";
import { RunSheetLogo } from "@/components/common/logo";

export const LandingFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] transition-colors py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Brand & Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <RunSheetLogo size="sm" />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            &copy; {currentYear} RunSheet. All rights reserved.
          </span>
        </div>

        {/* Center: Clean Nav Links */}
        <div className="flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-400">
          <a
            href="#features"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            How It Works
          </a>
          <a
            href="#about"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            About Us
          </a>
          <a
            href="#contact"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Contact
          </a>
        </div>

        {/* Right: Auth Links */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <Link
            href="/login"
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Log In
          </Link>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <Link
            href="/register"
            className="text-primary hover:underline transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </footer>
  );
};
