"use client";

import React from "react";
import { Input } from "@/components/ui/input";

export interface VenueMapPreviewProps {
  venue: string;
  onChangeVenue: (val: string) => void;
  error?: string;
  disabled?: boolean;
}

export const VenueMapPreview: React.FC<VenueMapPreviewProps> = ({
  venue,
  onChangeVenue,
  error,
  disabled = false,
}) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
          Venue / Location <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Input
            value={venue}
            onChange={(e) => onChangeVenue(e.target.value)}
            placeholder="e.g. Moscone Center, San Francisco, CA"
            error={error}
            disabled={disabled}
            leftIcon={
              <svg
                className="w-4 h-4 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            }
          />
        </div>
      </div>

      {/* Stylized Interactive Map Preview Card */}
      <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-[#e5eef4] dark:bg-[#1a2336] shadow-inner select-none flex flex-col justify-end p-3">
        {/* SVG Map Illustration with Streets, Water, City Blocks */}
        <svg
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 400 200"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waterGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="waterGradDark" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#1e293b" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Background land */}
          <rect width="400" height="200" fill="currentColor" className="text-[#e2e8f0] dark:text-[#182030]" />

          {/* Waterway / Bay */}
          <path
            d="M 260,0 C 270,50 310,90 400,120 L 400,0 Z"
            className="fill-blue-200/70 dark:fill-blue-950/60"
          />
          <path
            d="M 320,130 C 350,150 370,180 400,200 L 400,130 Z"
            className="fill-blue-200/70 dark:fill-blue-950/60"
          />

          {/* Secondary streets */}
          <g stroke="currentColor" className="text-white/80 dark:text-slate-700/60" strokeWidth="3">
            <line x1="0" y1="40" x2="260" y2="40" />
            <line x1="0" y1="90" x2="310" y2="90" />
            <line x1="0" y1="140" x2="350" y2="140" />
            <line x1="60" y1="0" x2="60" y2="200" />
            <line x1="120" y1="0" x2="120" y2="200" />
            <line x1="190" y1="0" x2="190" y2="200" />
            <line x1="250" y1="0" x2="250" y2="200" />
          </g>

          {/* Main Expressway / Highway */}
          <path
            d="M 0,160 Q 150,120 300,70 T 400,30"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="5"
            strokeLinecap="round"
            className="opacity-70"
          />

          {/* Park area */}
          <rect x="70" y="50" width="40" height="30" rx="4" className="fill-emerald-200/60 dark:fill-emerald-950/50" />
          <rect x="130" y="100" width="50" height="30" rx="4" className="fill-emerald-200/60 dark:fill-emerald-950/50" />
        </svg>

        {/* Center Pin Marker with Ripple Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
          <div className="relative flex items-center justify-center">
            <span className="absolute w-8 h-8 rounded-full bg-emerald-500/30 animate-ping" />
            <div className="w-9 h-9 rounded-full bg-emerald-500 text-white shadow-lg flex items-center justify-center border-2 border-white dark:border-slate-900">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-1 px-2.5 py-0.5 rounded-md bg-slate-900/90 text-white text-[10px] font-bold shadow-md truncate max-w-[180px]">
            {venue || "Target Venue"}
          </div>
        </div>

        {/* Bottom Floating Pill with Venue Name */}
        <div className="relative z-10 flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-white/40 dark:border-slate-800 shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-200">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="truncate">{venue || "No location selected yet"}</span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 ml-2">
            Map View
          </span>
        </div>
      </div>
    </div>
  );
};
