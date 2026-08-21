"use client";

import { useToastContext } from "@/providers/toast-provider";

export function useToast() {
  const { showToast } = useToastContext();

  return {
    toast: showToast,
    success: (title: string, message?: string) =>
      showToast({ type: "success", title, message }),
    error: (title: string, message?: string) =>
      showToast({ type: "error", title, message }),
    warning: (title: string, message?: string) =>
      showToast({ type: "warning", title, message }),
    info: (title: string, message?: string) =>
      showToast({ type: "info", title, message }),
  };
}
