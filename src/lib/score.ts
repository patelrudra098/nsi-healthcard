import { BAND_META, type ScoreBandKey } from "@/config/constants";

export function getBandToken(band: ScoreBandKey): string {
  return BAND_META[band]?.token ?? "var(--muted-foreground)";
}

export function getBandSoftToken(band: ScoreBandKey): string {
  return BAND_META[band]?.softToken ?? "var(--muted)";
}

export function getBandLabel(band: ScoreBandKey): string {
  return BAND_META[band]?.label ?? band;
}

/** Token for a 0-100 percentage, using the band ramp (green→blue→amber→red). */
export function getPercentToken(pct: number): string {
  return getBandToken(bandFromPercentage(pct));
}

/** Derive band from a 0-100 percentage (fallback when API omits it). */
export function bandFromPercentage(pct: number): ScoreBandKey {
  if (pct >= 81) return "VERY_STRONG";
  if (pct >= 61) return "GOOD";
  if (pct >= 41) return "MODERATE";
  if (pct >= 21) return "WEAK";
  return "HIGH_RISK";
}

export function clampPercent(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}
