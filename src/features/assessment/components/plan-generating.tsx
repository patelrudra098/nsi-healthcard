"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const STEPS = [
  "Reading your nine lifestyle areas",
  "Pinpointing your biggest opportunity",
  "Designing your 21-day family habits",
  "Finishing the finer details",
] as const;

/**
 * Generation experience for the improvement plan. Deliberately restrained:
 * a single confident progress arc, a slow breathing halo, a glass sheen that
 * sweeps the HealthCard mark, and blurred caption cross-fades. No orbiting
 * trinkets — the goal is "handcrafted", not "busy". Honours reduced motion.
 */
export function PlanGenerating() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      setStep((current) => (current + 1) % STEPS.length);
    }, 1700);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <div
      className="flex min-h-[70dvh] flex-col items-center justify-center gap-11 py-12 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="relative grid size-[152px] place-items-center">
        {/* Breathing halo */}
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--primary) 20%, transparent) 0%, transparent 68%)",
            filter: "blur(6px)",
          }}
          animate={reduce ? undefined : { opacity: [0.4, 0.75, 0.4], scale: [0.94, 1.06, 0.94] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Progress arc — the single hero motion */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 size-full"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="var(--primary-soft)"
            strokeWidth="2.5"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            stroke="var(--primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="70 213"
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
            animate={reduce ? { rotate: -45 } : { rotate: 360 }}
            transition={
              reduce
                ? { duration: 0 }
                : { duration: 1.25, repeat: Infinity, ease: "linear" }
            }
          />
        </svg>

        {/* Brand mark with a glass sheen sweep */}
        <div className="relative grid size-[112px] place-items-center overflow-hidden rounded-full bg-white shadow-[var(--shadow-lg)] ring-1 ring-[var(--border)]">
          <Image
            src="/logo-mark.png"
            alt=""
            width={92}
            height={92}
            priority
            sizes="92px"
            className="size-[92px] rounded-full object-cover"
          />
          {!reduce && (
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2"
              style={{
                background:
                  "linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.6) 50%, transparent 62%)",
              }}
              animate={{ x: ["0%", "320%"] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 1.6,
                ease: "easeInOut",
              }}
            />
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">
          Building your plan
        </p>
        <h2 className="font-heading text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Crafting your improvement plan
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
              {reduce ? "Creating your improvement plan…" : STEPS[step]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
