import { cn } from "@/lib/utils"

/**
 * Modern loading skeleton — left-to-right shine sweep over a muted base.
 *
 * Built on the global `.shimmer` class in globals.css (keyframes `shimmer`,
 * 1.6s linear infinite, respects `prefers-reduced-motion`). Exactly matches
 * the skeleton design pattern used across the app.
 *
 * Guidance for callers:
 *   - Keep dimensions IDENTICAL to the real content so there is zero layout
 *     shift when data arrives. Use the same width/height classes the real
 *     element uses (e.g. `h-8 w-40` not `h-full`).
 *   - Stack multiple <Skeleton /> blocks in the same grid/flex layout as the
 *     live component — do not invent a bespoke layout just for loading.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("skeleton rounded-[var(--radius-sm)]", className)}
      {...props}
    />
  )
}

export { Skeleton }
