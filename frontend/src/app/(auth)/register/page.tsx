"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth/auth-service";
import { useToast } from "@/hooks/use-toast";
import { RunSheetLogo } from "@/components/common/logo";
import { ApiError } from "@/lib/api/api-error";

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute password strength (0 to 4)
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return Math.max(1, score);
  };

  const strengthScore = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!firstName || !lastName || !email || !password || !phoneNumber) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      await authService.register({
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
      });
      toast.success(
        "Registration Successful!",
        "Your account has been created. Please sign in."
      );
      router.push("/login");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-[#EEF6EB] dark:bg-[#0B0F19] transition-colors py-8">
      <div className="w-full max-w-md bg-white dark:bg-[#131B2E] rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-200/60 dark:border-slate-800 overflow-hidden relative">
        {/* Top Vibrant Green Accent Line */}
        <div className="h-1.5 w-full bg-[#44D944]" />

        <div className="p-8 sm:p-10 flex flex-col items-center">
          {/* Logo */}
          <RunSheetLogo size="md" />

          {/* Heading */}
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-5 text-center">
            Create your account
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 mb-6 text-center max-w-xs leading-relaxed">
            Start managing high performance events with RunSheet.
          </p>

          {/* Error Alert */}
          {errorMessage && (
            <div className="w-full mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium flex items-center justify-between gap-2">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="opacity-70 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {/* First Name & Last Name Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="firstName"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 block"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jane"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#44D944]/40 focus:border-[#44D944] transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="lastName"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 block"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#44D944]/40 focus:border-[#44D944] transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 block"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@company.com"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#44D944]/40 focus:border-[#44D944] transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 block"
              >
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 pl-3 pr-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#44D944]/40 focus:border-[#44D944] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.03 10.03 0 013.122-.463c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-3.69-3.69a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password Strength Indicator Bar (4 segments) */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[1, 2, 3, 4].map((seg) => (
                  <div
                    key={seg}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      seg <= strengthScore
                        ? strengthScore <= 1
                          ? "bg-red-500"
                          : strengthScore <= 2
                          ? "bg-amber-500"
                          : strengthScore <= 3
                          ? "bg-blue-500"
                          : "bg-[#44D944]"
                        : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label
                htmlFor="phoneNumber"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 block"
              >
                Phone Number
              </label>
              <input
                id="phoneNumber"
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#44D944]/40 focus:border-[#44D944] transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 mt-3 rounded-xl bg-[#44D944] hover:bg-[#38C238] active:bg-[#2EA62E] text-slate-950 font-bold text-sm shadow-md shadow-[#44D944]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Sub text below card */}
      <p className="text-xs text-slate-600 dark:text-slate-400 mt-6 text-center">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-bold text-slate-900 dark:text-slate-200 hover:text-[#44D944] dark:hover:text-[#44D944] transition-colors"
        >
          Log in
        </Link>
      </p>

      {/* Footer Terms / Privacy Links */}
      <div className="flex items-center gap-2 mt-8 text-xs text-slate-400">
        <a
          href="#privacy"
          onClick={(e) => e.preventDefault()}
          className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          Privacy Policy
        </a>
        <span>·</span>
        <a
          href="#terms"
          onClick={(e) => e.preventDefault()}
          className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          Terms of Service
        </a>
      </div>
    </div>
  );
}
