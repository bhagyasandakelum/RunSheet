import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full p-8 rounded-2xl glass-panel border border-border shadow-xl space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary font-bold text-2xl border border-primary/20">
          RS
        </div>
        
        <div>
          <h1 className="text-2xl font-bold tracking-tight">RunSheet Platform</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Cloud-Native Event Management System Frontend Architecture
          </p>
        </div>

        <div className="pt-4 border-t border-border flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full py-2.5 px-4 rounded-xl bg-primary text-black font-semibold text-sm hover:opacity-90 transition-opacity text-center"
          >
            Access Portal
          </Link>
          <Link
            href="/dashboard"
            className="w-full py-2.5 px-4 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors text-center"
          >
            Go to Dashboard Area
          </Link>
        </div>
      </div>
    </div>
  );
}
