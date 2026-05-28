import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2
      role="status"
      aria-label="Loading"
      className={cn("h-5 w-5 animate-spin text-[var(--primary)]", className)}
    />
  );
}

export function FullPageLoader({ label }: { label?: string }) {
  return (
    <div
      className="flex min-h-[60dvh] w-full flex-col items-center justify-center gap-3"
      role="status"
      aria-live="polite"
    >
      <Spinner className="h-7 w-7" />
      <p className="text-sm text-[var(--text-muted)]">
        {label ?? "Loading…"}
      </p>
    </div>
  );
}
