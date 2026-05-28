import type { ScoreBandKey } from "@/config/constants";
import { getBandLabel, getBandSoftToken, getBandToken } from "@/lib/score";
import { cn } from "@/lib/utils";

interface BandBadgeProps {
  band: ScoreBandKey;
  label?: string;
  size?: "sm" | "default" | "lg";
  className?: string;
}

const sizeClasses: Record<NonNullable<BandBadgeProps["size"]>, string> = {
  sm: "h-5 px-2 text-[11px]",
  default: "h-6 px-2.5 text-xs",
  lg: "h-7 px-3 text-sm",
};

/** Score-band pill, colored by the band's semantic token. */
export function BandBadge({
  band,
  label,
  size = "default",
  className,
}: BandBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-semibold leading-none",
        sizeClasses[size],
        className,
      )}
      style={{
        backgroundColor: getBandSoftToken(band),
        color: getBandToken(band),
      }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ backgroundColor: getBandToken(band) }}
        aria-hidden="true"
      />
      {label ?? getBandLabel(band)}
    </span>
  );
}
