import Image from "next/image";
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

/** Full-page brand loader: the HealthCard mark inside a spinning ring. */
export function FullPageLoader({ label }: { label?: string }) {
  return (
    <div
      className="flex min-h-dvh w-full flex-col items-center justify-center gap-5"
      role="status"
      aria-live="polite"
    >
      <span className="relative grid size-[68px] place-items-center">
        {/* Spinning ring — light brand track with a solid leading arc. */}
        <span
          aria-hidden="true"
          className="absolute inset-0 animate-spin rounded-full border-[3px] border-[var(--primary-soft)] border-t-[var(--primary)] [animation-duration:0.85s] motion-reduce:animate-none"
        />
        {/* Brand mark */}
        <Image
          src="/logo-mark.png"
          alt=""
          width={56}
          height={56}
          priority
          sizes="56px"
          className="size-14 rounded-full object-cover"
        />
      </span>
      {label && (
        <p className="text-sm font-medium text-[var(--text-muted)]">{label}</p>
      )}
    </div>
  );
}
