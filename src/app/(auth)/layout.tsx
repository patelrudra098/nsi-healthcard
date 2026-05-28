"use client";

import { HeartPulse, ShieldCheck, Sparkles, Users } from "lucide-react";
import { PublicOnlyRoute } from "@/features/auth";

const PROMISES = [
  {
    icon: ShieldCheck,
    title: "Private by design",
    body: "Your responses live on your account only — never shared, never sold.",
  },
  {
    icon: Sparkles,
    title: "Built for awareness, not diagnosis",
    body: "A clear, judgement-free reflection on lifestyle and family habits.",
  },
  {
    icon: Users,
    title: "Made for families",
    body: "Score, reflect, and set goals you can act on together.",
  },
] as const;

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicOnlyRoute>
      <div className="flex min-h-dvh">
        <aside
          className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex lg:w-1/2 xl:w-[55%]"
          style={{
            backgroundColor: "var(--secondary)",
            color: "var(--text-inverse)",
          }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-32 -top-32 size-[28rem] rounded-full opacity-30 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, var(--primary) 0%, transparent 65%)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-40 -left-24 size-[24rem] rounded-full opacity-25 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, color-mix(in srgb, var(--primary) 70%, white) 0%, transparent 65%)",
            }}
          />

          <div className="relative flex items-center gap-3">
            <span
              className="inline-flex size-11 items-center justify-center rounded-[var(--radius-md)]"
              style={{ backgroundColor: "rgba(255,255,255,0.14)" }}
            >
              <HeartPulse
                className="size-6"
                style={{ color: "var(--text-inverse)" }}
                aria-hidden="true"
              />
            </span>
            <div className="flex flex-col leading-tight">
              <span
                className="font-heading text-lg font-bold"
                style={{ color: "var(--text-inverse)" }}
              >
                NSI Health
              </span>
              <span
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.72)" }}
              >
                Family Scorecard
              </span>
            </div>
          </div>

          <div className="relative max-w-md space-y-6">
            <h2
              className="font-heading text-3xl font-bold leading-tight tracking-tight"
              style={{ color: "var(--text-inverse)" }}
            >
              Measure what shapes your family&apos;s future.
            </h2>
            <p
              className="text-[15px] leading-relaxed"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              In a few honest minutes, see exactly where your family&apos;s health
              stands today — and the one habit that will move it forward.
            </p>

            <ul className="space-y-4 pt-2">
              {PROMISES.map((promise) => {
                const Icon = promise.icon;
                return (
                  <li key={promise.title} className="flex items-start gap-3">
                    <span
                      className="inline-flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
                      style={{ backgroundColor: "rgba(255,255,255,0.14)" }}
                    >
                      <Icon
                        className="size-4"
                        style={{ color: "var(--text-inverse)" }}
                        aria-hidden="true"
                      />
                    </span>
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--text-inverse)" }}
                      >
                        {promise.title}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: "rgba(255,255,255,0.75)" }}
                      >
                        {promise.body}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <p
            className="relative text-xs"
            style={{ color: "rgba(255,255,255,0.62)" }}
          >
            © {new Date().getFullYear()} NSI Family Health Scorecard
          </p>
        </aside>

        <main className="flex flex-1 items-center justify-center bg-[var(--background)] px-4 py-10 sm:px-6">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </PublicOnlyRoute>
  );
}
