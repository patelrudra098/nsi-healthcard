"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const STEPS = [
  "Reading your nine lifestyle areas",
  "Finding your biggest opportunity",
  "Designing your first 21-day habit",
  "Almost ready…",
] as const;

/**
 * Full-bleed "generating" experience shown while the personalised 21-day plan
 * is being built. Radar pulses + a rotating scanner ring around a breathing
 * HealthCard mark read as "actively working" while staying on-brand. Perfectly
 * centred on every screen; honours reduced motion.
 */
export function PlanGenerating() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      setStep((current) => (current + 1) % STEPS.length);
    }, 1600);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <div className="flex min-h-[72dvh] w-full flex-col items-center justify-center gap-9 px-6 py-10 text-center">
      <div className="relative grid size-44 place-items-center sm:size-52">
        {/* Radar pulses */}
        {!reduce &&
          [0, 1, 2].map((i) => (
            <motion.span
              key={i}
              aria-hidden="true"
              className="absolute inset-0 rounded-full border border-[var(--primary)]"
              initial={{ scale: 0.5, opacity: 0.5 }}
              animate={{ scale: 1.25, opacity: 0 }}
              transition={{
                duration: 2.6,
                repeat: Infinity,
                ease: "easeOut",
                delay: i * 0.85,
              }}
            />
          ))}

        {/* Rotating scanner ring */}
        {!reduce && (
          <motion.span
            aria-hidden="true"
            className="absolute inset-1 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, color-mix(in srgb, var(--primary) 32%, transparent) 65deg, transparent 135deg)",
              maskImage: "radial-gradient(circle, transparent 56%, black 58%)",
              WebkitMaskImage: "radial-gradient(circle, transparent 56%, black 58%)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
          />
        )}

        {/* Breathing halo */}
        <motion.span
          aria-hidden="true"
          className="absolute inset-7 rounded-full"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--primary) 22%, transparent) 0%, transparent 70%)",
            filter: "blur(6px)",
          }}
          animate={reduce ? undefined : { opacity: [0.4, 0.8, 0.4], scale: [0.9, 1.08, 0.9] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Brand mark with glass sheen */}
        <motion.div
          className="relative grid size-24 place-items-center overflow-hidden rounded-full bg-white shadow-[var(--shadow-lg)] ring-1 ring-[var(--border)] sm:size-28"
          animate={reduce ? undefined : { scale: [1, 1.05, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/logo-mark.png"
            alt=""
            width={112}
            height={112}
            priority
            sizes="112px"
            className="size-full rounded-full object-cover"
          />
          {!reduce && (
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2"
              style={{
                background:
                  "linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.65) 50%, transparent 62%)",
              }}
              animate={{ x: ["0%", "320%"] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 1.4,
                ease: "easeInOut",
              }}
            />
          )}
        </motion.div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">
          Building your challenge
        </p>
        <h2 className="font-heading text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Crafting your 21-day plan
        </h2>
        <div className="relative h-6 w-[19rem] max-w-[80vw]">
          <AnimatePresence mode="wait">
            <motion.p
              key={step}
              initial={reduce ? false : { y: 6, opacity: 0, filter: "blur(4px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={reduce ? undefined : { y: -6, opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 text-sm text-[var(--text-muted)]"
            >
              {reduce ? "Creating your plan…" : STEPS[step]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Indeterminate progress shuttle */}
        <div className="relative h-1 w-56 max-w-[70vw] overflow-hidden rounded-full bg-[var(--primary-soft)]">
          {!reduce && (
            <motion.span
              className="absolute inset-y-0 w-1/3 rounded-full bg-[var(--primary)]"
              animate={{ x: ["-110%", "330%"] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
