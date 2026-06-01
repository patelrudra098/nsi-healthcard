"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const STEPS = [
  "Reviewing your answers…",
  "Pinpointing your biggest opportunity…",
  "Shaping your 21-day family plan…",
  "Almost ready…",
] as const;

/**
 * Premium brand "generating" experience for the improvement plan.
 * Radar pulses + a rotating scanner sweep + an orbiting accent dot around a
 * gently breathing HealthCard mark, with cycling status captions. Honours
 * prefers-reduced-motion by falling back to a calm static composition.
 */
export function PlanGenerating() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      setStep((current) => (current < STEPS.length - 1 ? current + 1 : current));
    }, 1100);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <div
      className="flex min-h-[70dvh] flex-col items-center justify-center gap-10 py-12 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="relative grid size-[200px] place-items-center">
        {/* Radar pulse rings */}
        {!reduce &&
          [0, 1, 2].map((i) => (
            <motion.span
              key={i}
              aria-hidden="true"
              className="absolute inset-0 rounded-full border border-[var(--primary)]"
              initial={{ scale: 0.55, opacity: 0.45 }}
              animate={{ scale: 1.25, opacity: 0 }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeOut",
                delay: i * 0.8,
              }}
            />
          ))}

        {/* Rotating scanner sweep */}
        {!reduce && (
          <motion.span
            aria-hidden="true"
            className="absolute inset-2 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, color-mix(in srgb, var(--primary) 30%, transparent) 60deg, transparent 130deg)",
              maskImage: "radial-gradient(circle, transparent 52%, black 54%)",
              WebkitMaskImage: "radial-gradient(circle, transparent 52%, black 54%)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
          />
        )}

        {/* Orbiting accent dot */}
        {!reduce && (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "linear" }}
          >
            <span className="absolute left-1/2 top-0 size-2.5 -translate-x-1/2 rounded-full bg-[var(--cat-amber)] shadow-[0_0_12px_var(--cat-amber)]" />
          </motion.span>
        )}

        {/* Brand mark */}
        <motion.div
          className="relative grid size-[104px] place-items-center rounded-full bg-white shadow-[var(--shadow-lg)] ring-1 ring-[var(--border)]"
          animate={reduce ? undefined : { scale: [1, 1.045, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/logo-mark.png"
            alt=""
            width={84}
            height={84}
            priority
            sizes="84px"
            className="size-[84px] rounded-full object-cover"
          />
        </motion.div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <h2 className="font-heading text-xl font-bold tracking-tight text-[var(--text-primary)]">
          Creating your improvement plan
        </h2>
        <div className="h-5 overflow-hidden">
          <motion.p
            key={step}
            initial={reduce ? false : { y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="text-sm text-[var(--text-muted)]"
          >
            {STEPS[step]}
          </motion.p>
        </div>

        {/* Indeterminate progress shuttle */}
        <div className="relative h-1 w-56 overflow-hidden rounded-full bg-[var(--primary-soft)]">
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
