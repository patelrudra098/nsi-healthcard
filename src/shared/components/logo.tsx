import { HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  showText?: boolean;
  className?: string;
  /** Icon box size in px. */
  size?: number;
}

/** NSI Family Health Scorecard brand mark. Presentational only. */
export function Logo({ showText = true, className, size = 36 }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[var(--primary-foreground)] shadow-[var(--shadow-sm)]"
        style={{ width: size, height: size, backgroundColor: "var(--primary)" }}
      >
        <HeartPulse className="size-[55%]" aria-hidden="true" />
      </span>
      {showText && (
        <span className="flex flex-col leading-none">
          <span className="font-heading text-[15px] font-bold tracking-tight text-[var(--text-primary)]">
            NSI Health
          </span>
          <span className="text-[11px] font-medium text-[var(--text-muted)]">
            Family Scorecard
          </span>
        </span>
      )}
    </span>
  );
}
