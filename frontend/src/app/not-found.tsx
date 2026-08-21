import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full p-8 rounded-2xl glass-panel border border-border shadow-xl space-y-4">
        <h1 className="text-6xl font-extrabold text-primary">404</h1>
        <h2 className="text-xl font-bold text-foreground">Page Not Found</h2>
        <p className="text-xs text-muted-foreground">
          The requested page could not be located on the RunSheet platform.
        </p>
        <div className="pt-2">
          <Link href="/dashboard">
            <Button variant="primary" size="sm">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
