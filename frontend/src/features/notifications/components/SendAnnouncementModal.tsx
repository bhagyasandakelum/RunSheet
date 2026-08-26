"use client";

import React, { useState } from "react";
import { notificationService } from "@/services/notification-service";
import { Button } from "@/components/ui/button";

export interface SendAnnouncementModalProps {
  isOpen: boolean;
  eventId: string;
  eventName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SendAnnouncementModal: React.FC<SendAnnouncementModalProps> = ({
  isOpen,
  eventId,
  eventName,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError("Please provide both a title and announcement message.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await notificationService.sendGeneralAnnouncement(eventId, {
        title: title.trim(),
        message: message.trim(),
      });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to broadcast announcement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 animate-in fade-in-50 zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Broadcast
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              Send Announcement
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Event: <span className="font-semibold text-slate-800 dark:text-slate-200">{eventName}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-xs text-red-600 dark:text-red-400 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Announcement Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Schedule Update, Weather Advisory, Venue Notice"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
              required
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-[#1A2234] text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Message Content *
            </label>
            <textarea
              placeholder="Provide full announcement details to broadcast to all event team members..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={2000}
              required
              className="w-full p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-[#1A2234] text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-500/20 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
            <svg className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <p className="leading-relaxed text-[11px]">
              This notification and an email summary will be delivered to all accepted members of this event.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              disabled={!title.trim() || !message.trim()}
              className="bg-[#28c740] hover:bg-[#23b33a] text-white font-bold text-xs"
            >
              Broadcast Now
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
