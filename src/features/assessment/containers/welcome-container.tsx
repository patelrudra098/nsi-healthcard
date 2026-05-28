"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  ShieldCheck,
  Sprout,
  HeartHandshake,
} from "lucide-react";
import { ROUTES } from "@/config/constants";
import { Button } from "@/shared/ui/button";
import { FlowShell } from "@/shared/layout";

const REASONS = [
  {
    icon: Eye,
    title: "Awareness Before Advice",
    body: "Know your family's real health reality before seeking guidance.",
    accent: { fg: "var(--icon-blue)", bg: "var(--icon-blue-bg)" },
  },
  {
    icon: ShieldCheck,
    title: "Prevention Before Problem",
    body: "Spot lifestyle risks early and take action before illness sets in.",
    accent: { fg: "var(--icon-green)", bg: "var(--icon-green-bg)" },
  },
  {
    icon: Sprout,
    title: "Lifestyle Shapes Family Future",
    body: "The daily habits of today become the health outcomes of tomorrow.",
    accent: { fg: "var(--icon-violet)", bg: "var(--icon-violet-bg)" },
  },
  {
    icon: HeartHandshake,
    title: "Health is the First Wealth",
    body: "No success, money, or career replaces a strong, healthy family culture.",
    accent: { fg: "var(--icon-amber)", bg: "var(--icon-amber-bg)" },
  },
] as const;

export function WelcomeContainer() {
  const router = useRouter();

  return (
    <FlowShell exitHref={ROUTES.dashboard} width="wide">
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-3 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
            Family Health Scorecard
          </span>
          <h1 className="text-balance font-heading text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            Understand your family&apos;s health, honestly
          </h1>
          <p className="text-pretty mx-auto max-w-xl text-[15px] leading-relaxed text-[var(--text-muted)]">
            A short, private reflection across 9 lifestyle areas. No judgement —
            just clarity on where your family stands today and where to grow next.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2">
          {REASONS.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.1 + index * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="app-card app-card-interactive flex gap-4 p-5"
              >
                <span
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
                  style={{ backgroundColor: reason.accent.bg, color: reason.accent.fg }}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="space-y-1">
                  <h3 className="font-heading text-base font-semibold text-[var(--text-primary)]">
                    {reason.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                    {reason.body}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="flex justify-center pt-2">
          <Button
            size="lg"
            onClick={() => router.push(ROUTES.instructions)}
            className="w-full sm:w-auto"
          >
            Begin Assessment
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </FlowShell>
  );
}
