import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  showText?: boolean;
  className?: string;
  /** Logo mark box size in px. */
  size?: number;
}

/** HealthCard (by Growith NSI) brand mark. Presentational only. */
export function Logo({ showText = true, className, size = 38 }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/logo-mark.png"
        alt="HealthCard"
        width={size}
        height={size}
        priority
        sizes={`${size}px`}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
      {showText && (
        <span className="flex flex-col leading-none">
          <span className="font-heading text-[15px] font-bold tracking-tight text-[var(--text-primary)]">
            HealthCard
          </span>
          <span className="text-[11px] font-medium text-[var(--text-muted)]">
            by Growith NSI
          </span>
        </span>
      )}
    </span>
  );
}
