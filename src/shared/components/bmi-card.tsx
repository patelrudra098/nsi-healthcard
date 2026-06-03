import Link from "next/link";
import { Activity, ArrowRight } from "lucide-react";
import { ROUTES } from "@/config/constants";
import type { BMIResult } from "@/lib/types";

type ColorKey = BMIResult["colorKey"];

/** colorKey → semantic token pair (see `--bmi-*` in globals.css). */
const BMI_TOKENS: Record<ColorKey, { fg: string; soft: string }> = {
  blue: { fg: "var(--bmi-blue)", soft: "var(--bmi-blue-soft)" },
  green: { fg: "var(--bmi-green)", soft: "var(--bmi-green-soft)" },
  yellow: { fg: "var(--bmi-yellow)", soft: "var(--bmi-yellow-soft)" },
  orange: { fg: "var(--bmi-orange)", soft: "var(--bmi-orange-soft)" },
  red: { fg: "var(--bmi-red)", soft: "var(--bmi-red-soft)" },
};

/** The gradient track spans BMI 15 → 35; the marker is clamped to that window. */
const SCALE_MIN = 15;
const SCALE_MAX = 35;
const markerPercent = (value: number) =>
  Math.min(100, Math.max(0, ((value - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100));

const TRACK_GRADIENT =
  "linear-gradient(90deg, var(--bmi-blue) 0%, var(--bmi-green) 35%, " +
  "var(--bmi-yellow) 55%, var(--bmi-orange) 75%, var(--bmi-red) 100%)";

const SCALE_TICKS = ["15", "18.5", "23", "25", "30+"];

interface BmiCardProps {
  bmi: BMIResult | null;
  className?: string;
}

/** Dashboard BMI summary — empty-state prompt until height + weight are set. */
export function BmiCard({ bmi, className }: BmiCardProps) {
  if (!bmi) {
    return (
      <section className={`app-card p-6 ${className ?? ""}`}>
        <div className="flex items-start gap-4">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--icon-neutral-bg)] text-[var(--icon-neutral)]">
            <Activity className="size-[18px]" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <p className="font-heading text-base font-semibold text-[var(--text-primary)]">
              Your BMI
            </p>
            <p className="text-pretty text-sm text-[var(--text-muted)]">
              Add your height and weight to your{" "}
              <Link
                href={ROUTES.onboardingProfile}
                className="inline-flex items-center gap-0.5 font-medium text-[var(--primary)] underline-offset-2 hover:underline"
              >
                family profile
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>{" "}
              to start tracking it here.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const colors = BMI_TOKENS[bmi.colorKey] ?? BMI_TOKENS.green;

  return (
    <section className={`app-card p-6 ${className ?? ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
            style={{ backgroundColor: colors.soft, color: colors.fg }}
          >
            <Activity className="size-[18px]" aria-hidden="true" />
          </span>
          <div className="space-y-2">
            <p className="text-sm font-medium text-[var(--text-muted)]">Your BMI</p>
            <div className="flex items-end gap-3">
              <span
                className="font-heading text-4xl font-bold leading-none tabular-nums tracking-tight"
                style={{ color: colors.fg }}
              >
                {bmi.value}
              </span>
              <span
                className="mb-0.5 inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold leading-none"
                style={{ backgroundColor: colors.soft, color: colors.fg }}
              >
                {bmi.category}
              </span>
            </div>
          </div>
        </div>

        <dl className="flex gap-6 text-sm">
          <div className="space-y-0.5">
            <dt className="text-xs text-[var(--text-muted)]">Height</dt>
            <dd className="font-medium tabular-nums text-[var(--text-secondary)]">
              {bmi.heightCm} cm
            </dd>
          </div>
          <div className="space-y-0.5">
            <dt className="text-xs text-[var(--text-muted)]">Weight</dt>
            <dd className="font-medium tabular-nums text-[var(--text-secondary)]">
              {bmi.weightKg} kg
            </dd>
          </div>
        </dl>
      </div>

      {/* Scale track */}
      <div className="mt-6">
        <div className="mb-1.5 flex justify-between text-xs text-[var(--text-muted)]">
          <span>Underweight</span>
          <span>Normal</span>
          <span>Overweight</span>
          <span>Obese</span>
        </div>
        <div
          className="relative h-2 rounded-full"
          style={{ backgroundImage: TRACK_GRADIENT }}
          role="img"
          aria-label={`BMI ${bmi.value}, ${bmi.category}`}
        >
          <span
            className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-[var(--surface)] shadow-[var(--shadow-sm)]"
            style={{ left: `${markerPercent(bmi.value)}%`, borderColor: colors.fg }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-xs tabular-nums text-[var(--text-disabled)]">
          {SCALE_TICKS.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
