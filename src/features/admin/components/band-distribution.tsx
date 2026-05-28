import { BAND_META, type ScoreBandKey } from "@/config/constants";

const BAND_ORDER: ScoreBandKey[] = [
  "VERY_STRONG",
  "GOOD",
  "MODERATE",
  "WEAK",
  "HIGH_RISK",
];

interface BandDistributionProps {
  distribution: Record<string, number>;
  completed: number;
}

/** Horizontal bars showing how completed assessments split across score bands. */
export function BandDistribution({
  distribution,
  completed,
}: BandDistributionProps) {
  const total = completed > 0 ? completed : 1;

  return (
    <ul className="space-y-4">
      {BAND_ORDER.map((band) => {
        const count = distribution[band] ?? 0;
        const pct = Math.round((count / total) * 100);
        const meta = BAND_META[band];
        return (
          <li key={band} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 font-medium text-[var(--text-secondary)]">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: meta.token }}
                  aria-hidden="true"
                />
                {meta.label}
              </span>
              <span className="tabular-nums text-[var(--text-muted)]">
                {count} {count === 1 ? "user" : "users"} · {pct}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  backgroundColor: meta.token,
                  transition: "width 600ms cubic-bezier(0.16,1,0.3,1)",
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
