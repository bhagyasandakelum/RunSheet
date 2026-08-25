"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export const SettingsView: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains("dark")) {
      root.classList.remove("dark");
      setIsDark(false);
    } else {
      root.classList.add("dark");
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const fullName = user ? `${user.firstName} ${user.lastName}` : "User";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your application preferences and account settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Side Settings Navigation */}
        <div className="md:col-span-4 space-y-6">
          {/* Account Section */}
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">
              Account
            </span>
            <div className="space-y-1">
              <Link
                href="/profile"
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 font-bold text-xs border border-emerald-500/20 transition-colors"
              >
                <span>👤</span>
                <span>My Profile</span>
              </Link>
              <Link
                href="/profile/edit"
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-colors"
              >
                <span>✏️</span>
                <span>Edit Profile</span>
              </Link>
            </div>
          </div>

          {/* Notification Section */}
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">
              Notification
            </span>
            <div className="space-y-1">
              <Link
                href="/notifications"
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-colors"
              >
                <span>🔔</span>
                <span>Notification Center</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Content Panels */}
        <div className="md:col-span-8 space-y-6">
          {/* User Account Overview Card */}
          <div className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-2 border-emerald-500/30 flex items-center justify-center text-lg font-black overflow-hidden shadow-xs">
                    {user?.profilePhotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.profilePhotoUrl}
                        alt={fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#131B2E]" />
                </div>

                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    {fullName}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {user?.email}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-500/20">
                    Event Organizer
                  </span>
                </div>
              </div>

              <Link href="/profile/edit">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs font-semibold self-start sm:self-auto"
                >
                  Edit Profile
                </Button>
              </Link>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#1A2234]">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Email Address
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                  {user?.email || "—"}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#1A2234]">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Timezone
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  UTC (Local Browser Time)
                </span>
              </div>
            </div>
          </div>

          {/* Application Preferences Card */}
          <div className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                ⚙️
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Application Preferences
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Your application settings are managed automatically based on your organization&apos;s defaults. For custom domains or advanced workspace configurations, please contact your administrator.
                </p>
              </div>
            </div>

            {/* Dark Mode / Light Mode Switch */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Interface Theme
                </span>
                <span className="text-[11px] text-slate-400">
                  Switch between dark and light appearance modes
                </span>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isDark ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isDark ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Account Actions / Log Out */}
          <div className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs space-y-3">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Account Actions
            </span>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                End your active session securely on this device.
              </span>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                leftIcon={
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                }
              >
                Log Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
