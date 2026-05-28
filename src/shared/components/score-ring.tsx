"use client";

import { useEffect, useRef, useState } from "react";
import type { ScoreBandKey } from "@/config/constants";
import { clampPercent, getBandToken, getPercentToken } from "@/lib/score";
import { cn } from "@/lib/utils";

interface ScoreRingProps {
  /** 0-100 */
  value: number;
  band?: ScoreBandKey;
  size?: number;
  strokeWidth?: number;
  /** Caption rendered under the percentage. */
  caption?: React.ReactNode;
  className?: string;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Animated circular score gauge. Counts up and sweeps the arc on mount. */
export function ScoreRing({
  value,
  band,
  size = 168,
  strokeWidth = 12,
  caption,
  className,
}: ScoreRingProps) {
  const target = clampPercent(value);
  const color = band ? getBandToken(band) : getPercentToken(target);
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      // Snap to target without animation; reduced-motion is read post-mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(target);
      return;
    }
    const duration = 900;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (display / 100) * circumference;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Score ${target} percent`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 120ms linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-heading text-4xl font-bold tabular-nums leading-none"
          style={{ color }}
        >
          {display}
          <span className="text-2xl">%</span>
        </span>
        {caption && (
          <span className="mt-1 text-xs font-medium text-[var(--text-muted)]">
            {caption}
          </span>
        )}
      </div>
    </div>
  );
}
