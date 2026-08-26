"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { userService } from "@/services/user-service";
import { User } from "@/types/common/entities";
import { Button } from "@/components/ui/button";

export const ProfileView: React.FC = () => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await userService.getProfile();
        setProfile(data);
      } catch {
        // Fallback to authUser if endpoint fails
        if (authUser) {
          setProfile(authUser as unknown as User);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [authUser]);

  const activeUser = profile || (authUser as unknown as User);

  const fullName = activeUser
    ? `${activeUser.firstName || ""} ${activeUser.lastName || ""}`.trim() || "User"
    : "User";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const formattedCreatedAt = activeUser?.createdAt
    ? new Date(activeUser.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  const formattedUpdatedAt = (activeUser as any)?.updatedAt
    ? new Date((activeUser as any).updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Just now";

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            My Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            View your account information.
          </p>
        </div>

        <Link href="/profile/edit">
          <Button
            variant="primary"
            size="md"
            className="bg-[#28c740] hover:bg-[#23b33a] text-white font-bold text-xs shadow-sm shadow-emerald-500/20"
            leftIcon={
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            }
          >
            Edit Profile
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="py-24 text-center text-xs font-semibold text-slate-400">
          Loading profile details...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Profile Card & Account Metadata */}
          <div className="md:col-span-5 space-y-6">
            {/* Main Profile Summary Card */}
            <div className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-xs">
              {/* Top Banner Gradient */}
              <div className="h-28 bg-gradient-to-br from-emerald-100 via-teal-50 to-emerald-200 dark:from-emerald-950/60 dark:via-[#131B2E] dark:to-teal-950/40 relative">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:12px_12px]" />
              </div>

              {/* Avatar & Details */}
              <div className="px-6 pb-6 pt-0 relative flex flex-col items-center text-center">
                <div className="-mt-12 mb-3 relative">
                  <div className="w-24 h-24 rounded-full border-4 border-white dark:border-[#131B2E] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 flex items-center justify-center text-2xl font-black shadow-md overflow-hidden">
                    {activeUser?.profilePhotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={activeUser.profilePhotoUrl}
                        alt={fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <span
                    className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#131B2E]"
                    title="Active"
                  />
                </div>

                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {fullName}
                </h2>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  {activeUser?.email || "No email available"}
                </p>

                {activeUser?.phoneNumber && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{activeUser.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Account Metadata Card */}
            <div className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Account Metadata
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      Account Created
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {formattedCreatedAt}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      Last Updated
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {formattedUpdatedAt}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Personal Information */}
          <div className="md:col-span-7">
            <div className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Personal Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-[#1A2234] border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    First Name
                  </span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {activeUser?.firstName || "—"}
                  </p>
                </div>

                {/* Last Name */}
                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-[#1A2234] border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Last Name
                  </span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {activeUser?.lastName || "—"}
                  </p>
                </div>
              </div>

              {/* Email Address */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-[#1A2234] border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Email Address
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-500/20">
                    Verified
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {activeUser?.email || "—"}
                </p>
              </div>

              {/* Phone Number */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-[#1A2234] border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Phone Number
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {activeUser?.phoneNumber || "No phone number provided"}
                </p>
              </div>

              {/* Security Banner Note */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-500/20 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="font-medium">
                  Your information is securely encrypted and managed under your account.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
