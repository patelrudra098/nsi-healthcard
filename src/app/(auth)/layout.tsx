"use client";

import Image from "next/image";
import { PublicOnlyRoute } from "@/features/auth";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicOnlyRoute>
      <div className="flex min-h-dvh">
        <aside
          className="relative hidden flex-col justify-between overflow-hidden bg-cover bg-center p-12 lg:flex lg:w-1/2 xl:w-[55%]"
          style={{ backgroundImage: "url('/login-image.jpeg')" }}
        >
          {/* Premium subtle overlay — brand navy tint, just enough at top & bottom
              to keep the logo and tagline legible while the photo stays visible. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(10,26,51,0.62) 0%, rgba(10,26,51,0.12) 36%, rgba(10,26,51,0.22) 60%, rgba(10,26,51,0.82) 100%)",
            }}
          />

          {/* Top: brand */}
          <div className="relative flex items-center gap-3">
            <Image
              src="/logo-mark.png"
              alt="HealthCard"
              width={44}
              height={44}
              priority
              sizes="44px"
              className="size-11 shrink-0 rounded-full bg-white object-cover ring-1 ring-white/30"
            />
            <div className="flex flex-col leading-tight">
              <span
                className="font-heading text-lg font-bold"
                style={{ color: "var(--text-inverse)" }}
              >
                HealthCard
              </span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.72)" }}>
                by Growith NSI
              </span>
            </div>
          </div>

          {/* Bottom: tagline */}
          <div className="relative max-w-md space-y-3">
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
          </div>
        </aside>

        <main className="flex flex-1 items-center justify-center bg-[var(--background)] px-4 py-10 sm:px-6">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </PublicOnlyRoute>
  );
}
