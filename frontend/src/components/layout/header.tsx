"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useEvent } from "@/providers/event-provider";
import { UserMenu } from "./user-menu";

export interface HeaderProps {
  onMenuToggle?: () => void;
  title?: string;
  onSearch?: (query: string) => void;
  selectedEventName?: string;
  eventsList?: { eventId: string; eventName: string }[];
  onSelectEvent?: (eventId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuToggle,
  onSearch,
  selectedEventName: propEventName,
  eventsList: propEventsList,
  onSelectEvent: propSelectEvent,
}) => {
  const { events, selectedEvent, setSelectedEventId } = useEvent();

  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);

  const activeEventName =
    propEventName ||
    selectedEvent?.eventName ||
    (events.length > 0 ? events[0].eventName : "No Events");

  const effectiveEventsList =
    propEventsList ||
    events.map((e) => ({ eventId: e.eventId, eventName: e.eventName }));

  const handleSelect = (eventId: string) => {
    if (propSelectEvent) {
      propSelectEvent(eventId);
    } else {
      setSelectedEventId(eventId);
    }
  };

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <header className="h-16 bg-white dark:bg-[#111622] border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between gap-4 select-none">
      {/* Left: Mobile Toggle, Breadcrumb & Event Selector */}
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="md:hidden p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">App</span>
          <span className="text-slate-300 dark:text-slate-600 font-bold">›</span>
          <span className="text-slate-800 dark:text-slate-200 font-bold">Dashboard</span>
        </div>

        {/* Event Selector Pill Dropdown */}
        <div className="relative ml-2 hidden sm:block">
          <button
            type="button"
            onClick={() => setIsEventDropdownOpen(!isEventDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="truncate max-w-[140px]">{activeEventName}</span>
            <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isEventDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsEventDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-1.5 w-60 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 shadow-xl p-1.5 z-50">
                <div className="flex items-center justify-between px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Select Event</span>
                  <Link
                    href="/events/create"
                    onClick={() => setIsEventDropdownOpen(false)}
                    className="text-emerald-600 hover:underline capitalize"
                  >
                    + New Event
                  </Link>
                </div>
                <div className="space-y-0.5 max-h-48 overflow-y-auto">
                  {effectiveEventsList.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400 font-medium">
                      No events found.
                    </div>
                  ) : (
                    effectiveEventsList.map((evt) => (
                      <button
                        key={evt.eventId}
                        onClick={() => {
                          handleSelect(evt.eventId);
                          setIsEventDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                          evt.eventName === activeEventName
                            ? "bg-emerald-500 text-white font-bold"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className="truncate">{evt.eventName}</span>
                        {evt.eventName === activeEventName && (
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Center: Search Input with shortcut hint ⌘K */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search..."
            className="w-full pl-9 pr-12 py-1.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400 pointer-events-none">
            ⌘K
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Dark/Light Mode Moon/Sun Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          title="Toggle theme"
        >
          {isDark ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.03 9.03 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Notification Bell */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          title="Notifications"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#111622]" />
        </Link>

        {/* User Menu Dropdown */}
        <UserMenu />
      </div>
    </header>
  );
};
