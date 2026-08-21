"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled Runtime Exception:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full p-8 rounded-2xl glass-panel border border-red-500/20 shadow-xl space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto text-2xl font-bold">
          ⚠️
        </div>
        <h2 className="text-xl font-bold text-foreground">Something went wrong!</h2>
        <p className="text-xs text-muted-foreground">
          {error.message || "An unexpected error occurred while rendering the page."}
        </p>
        <div className="pt-2">
          <Button onClick={() => reset()} variant="primary" size="sm">
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
