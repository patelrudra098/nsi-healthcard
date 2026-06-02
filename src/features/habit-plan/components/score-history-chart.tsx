"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LineChart as LineChartIcon } from "lucide-react";
import type { ScoreHistoryEntry } from "@/lib/types";
import { bandFromPercentage, getBandToken } from "@/lib/score";
import { Chart } from "@/shared/ui/chart";

interface Point {
  date: string;
  score: number;
  band: string;
}

function toPoints(entries: ScoreHistoryEntry[]): Point[] {
  return [...entries]
    .filter((entry) => entry.completedAt)
    .sort(
      (a, b) =>
        new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime(),
    )
    .map((entry) => ({
      date: new Date(entry.completedAt).toLocaleDateString("en-IN", {
        month: "short",
        year: "2-digit",
      }),
      score: Math.round(entry.scorePercentage),
      band: entry.bandLabel,
    }));
}

function ScoreTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: Point }>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs shadow-[var(--shadow-md)]">
      <p className="font-semibold tabular-nums text-[var(--text-primary)]">
        {point.score}%
      </p>
      <p className="text-[var(--text-muted)]">{point.band}</p>
      <p className="text-[var(--text-muted)]">{point.date}</p>
    </div>
  );
}

/** Line chart of assessment scores over time, colored by the latest band. */
export function ScoreHistoryChart({ data }: { data: ScoreHistoryEntry[] }) {
  const points = toPoints(data);

  if (points.length === 0) {
    return (
      <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-[var(--muted)] text-[var(--text-disabled)]">
          <LineChartIcon className="size-6" aria-hidden="true" />
        </span>
        <p className="max-w-xs text-sm text-[var(--text-muted)]">
          Your score graph appears here once you complete an assessment.
        </p>
      </div>
    );
  }

  const latest = points[points.length - 1];
  const lineColor = getBandToken(bandFromPercentage(latest.score));

  if (points.length === 1) {
    return (
      <div className="flex min-h-[180px] flex-col items-center justify-center gap-4 text-center">
        <div className="flex flex-col items-center gap-1">
          <span
            className="font-heading text-4xl font-bold tabular-nums"
            style={{ color: lineColor }}
          >
            {latest.score}%
          </span>
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            {latest.band} · {latest.date}
          </span>
        </div>
        <p className="max-w-xs text-sm text-[var(--text-muted)]">
          Complete your next assessment in 30 days to see your progress.
        </p>
      </div>
    );
  }

  return (
    <Chart height={240} aria-label="Assessment score history">
      <LineChart data={points} margin={{ top: 8, right: 12, bottom: 4, left: -16 }}>
        <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
        {[20, 40, 60, 80].map((y) => (
          <ReferenceLine
            key={y}
            y={y}
            stroke="var(--chart-border)"
            strokeDasharray="4 4"
          />
        ))}
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: "var(--text-muted)" }}
          tickLine={false}
          axisLine={{ stroke: "var(--chart-border)" }}
        />
        <YAxis
          domain={[0, 100]}
          ticks={[0, 20, 40, 60, 80, 100]}
          tick={{ fontSize: 12, fill: "var(--text-muted)" }}
          tickLine={false}
          axisLine={false}
          width={40}
        />
        <Tooltip content={<ScoreTooltip />} cursor={{ stroke: "var(--border)" }} />
        <Line
          type="monotone"
          dataKey="score"
          stroke={lineColor}
          strokeWidth={2.5}
          dot={{ r: 4, fill: lineColor, strokeWidth: 0 }}
          activeDot={{ r: 6 }}
          isAnimationActive
        />
      </LineChart>
    </Chart>
  );
}
