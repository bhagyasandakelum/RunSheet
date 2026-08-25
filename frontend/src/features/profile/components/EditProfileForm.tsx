"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { userService } from "@/services/user-service";
import { Button } from "@/components/ui/button";

export const EditProfileForm: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [showAdvancedPhoto, setShowAdvancedPhoto] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const data = await userService.getProfile();
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setPhoneNumber(data.phoneNumber || "");
        setProfilePhotoUrl(data.profilePhotoUrl || "");
      } catch {
        if (user) {
          setFirstName(user.firstName || "");
          setLastName(user.lastName || "");
          setPhoneNumber(user.phoneNumber || "");
          setProfilePhotoUrl(user.profilePhotoUrl || "");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  // Handle Image Upload via Base64 or URL
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setProfilePhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setProfilePhotoUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and Last name are required.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      await userService.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        profilePhotoUrl: profilePhotoUrl.trim() || null,
      });

      await refreshUser();
      setSuccess("Profile updated successfully!");

      setTimeout(() => {
        router.push("/profile");
      }, 800);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "U";

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link href="/profile" className="hover:text-emerald-600 transition-colors">
          Profile
        </Link>
        <span>›</span>
        <span className="font-semibold text-slate-800 dark:text-slate-200">Edit Profile</span>
      </div>

      {/* Header Banner */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Edit Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Update your personal information to ensure your details are current for upcoming events.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-xs text-red-700 dark:text-red-300 font-semibold">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
          {success}
        </div>
      )}

      {isLoading ? (
        <div className="py-24 text-center text-xs font-semibold text-slate-400">
          Loading profile...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">
          {/* Profile Picture Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Profile Picture
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              {/* Circular Avatar */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 flex items-center justify-center text-xl font-black shadow-inner overflow-hidden">
                  {profilePhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profilePhotoUrl}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <span
                  className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#131B2E]"
                  title="Online"
                />
              </div>

              {/* Upload & Instructions */}
              <div className="flex-1 space-y-2.5">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  We recommend using a square image, at least 400x400px. JPG or PNG format.
                </p>

                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleImageFileChange}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold"
                    leftIcon={
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    }
                  >
                    Upload New
                  </Button>

                  {profilePhotoUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemovePhoto}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* Personal Details Section */}
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Personal Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Alex"
                  required
                  maxLength={100}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-[#1A2234] text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Rivera"
                  required
                  maxLength={100}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-[#1A2234] text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <span className="text-[10px] text-slate-400">Locked for identity</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  ✉️
                </div>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-100/70 dark:bg-[#161E2E] text-xs font-semibold text-slate-500 cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Primary contact for notifications.
              </p>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  📞
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  maxLength={20}
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-[#1A2234] text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
            </div>

            {/* Advanced: External Photo URL Accordion */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAdvancedPhoto(!showAdvancedPhoto)}
                className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
              >
                <span>{showAdvancedPhoto ? "▼" : "▶"}</span>
                <span>ADVANCED: EXTERNAL PHOTO URL</span>
              </button>

              {showAdvancedPhoto && (
                <div className="mt-3">
                  <input
                    type="url"
                    value={profilePhotoUrl}
                    onChange={(e) => setProfilePhotoUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-[#1A2234] text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <Link href="/profile">
              <Button
                type="button"
                variant="outline"
                size="md"
                className="text-xs font-semibold"
              >
                Cancel
              </Button>
            </Link>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
              className="bg-[#28c740] hover:bg-[#23b33a] text-white font-bold text-xs shadow-sm shadow-emerald-500/20"
            >
              Save Changes
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
