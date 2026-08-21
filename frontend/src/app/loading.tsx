import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-3 p-6 text-center">
      <Spinner size="lg" className="text-primary" />
      <p className="text-xs font-medium text-muted-foreground animate-pulse">
        Loading RunSheet Environment...
      </p>
    </div>
  );
}
