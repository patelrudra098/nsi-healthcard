'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/shared/ui/button'
import { Lock } from 'lucide-react'

/* ─────────────────────────────────────────────────────────────────────────────
 * StatusScreen — single transaction-result component used across every payment
 * surface (Funnel payment, LMS enrolment, Distributor subscription).
 *
 * The visual is a single SVG icon that morphs from a primary-blue spinner
 * into a green ring with a green check (success) or red ring with a red X
 * (failure). One DOM element transitions four properties in parallel:
 *
 *   • stroke               primary  → cat-green / cat-red    (400 ms ease-out)
 *   • stroke-dasharray     "65 220" → "276 0"                 (700 ms expo-out)
 *   • animation-play-state running  → paused                  (instant)
 *   • inner check / X      hidden   → drawn                   (600 ms with delay)
 *
 * The ring closes and shifts colour mid-morph; the check then strokes inside
 * the now-complete ring. Same DOM node persists across status changes so
 * every transition is a CSS animation, not a remount.
 *
 * Strict design rules
 *   • Background is `--surface` for every state (uniform takeover).
 *   • `--primary` while loading; `--cat-green` on success; `--cat-red` on
 *     failure. The colour itself is the success cue, just like GPay /
 *     Razorpay / PhonePe — primary blue alone is not legible as "done".
 *   • Zero gradients anywhere.
 *   • Every animation is a class from globals.css.
 * ────────────────────────────────────────────────────────────────────────── */

export type StatusVariant = 'success' | 'failure' | 'processing'

export interface StatusAction {
  label: string
  onClick: () => void
  variant?: 'default' | 'outline' | 'ghost'
  icon?: React.ReactNode
}

export interface StatusScreenProps {
  status: StatusVariant
  title: string
  /** Supporting description shown below the title */
  message?: string
  /** Primary data callout — e.g. formatted currency for payment success */
  meta?: string
  /** Warning badge (processing state) — e.g. "Please don't close this page" */
  badge?: string
  actions?: StatusAction[]
  /**
   * 'overlay' — fixed full-screen takeover (default).
   * 'panel'   — absolute inset-0 inside the nearest positioned ancestor.
   * 'inline'  — fills parent flex container with no positioning.
   */
  mode?: 'overlay' | 'panel' | 'inline'
  className?: string
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Shared timing — single source of truth for "let the animation play".
 *
 *   T=0      status flips → arc starts morphing, colour starts shifting
 *   T=400    colour transition complete (ring is fully green / red)
 *   T=600    check / X stroke begins drawing inside the now-complete ring
 *   T=800    title + meta begin to rise into place
 *   T=950    message rises
 *   T=1100   actions rise (failure only)
 *   T=~1500  motion fully settled
 *   T=4500   STATUS_TRANSITION_MS.success — caller navigates / advances
 *
 * 4.5 s total gives the user ≥3 s to actually read the receipt before the
 * page changes — matching the GPay / PhonePe dwell time exactly.
 * ────────────────────────────────────────────────────────────────────────── */
export const STATUS_TRANSITION_MS = {
  success: 4500,
  failure: 4500,
} as const

export const STATUS_CELEBRATE_MS = 1700

/* ────────────────────────────────────────────────────────────────────────── */

/**
 * StatusIcon — morphing spinner ↔ green check / red X.
 *
 * The SVG holds `animate-spin` on every render but pauses it the instant
 * `status` leaves 'processing' (`animationPlayState: 'paused'`). The arc's
 * stroke-dasharray and stroke colour both have CSS transitions, so React
 * just changes the props and the browser tweens the morph.
 *
 * Once the ring is complete (≈ 700 ms after status flip), the inner check
 * (or X) strokes via the existing `animate-status-check` keyframes — its
 * 600 ms delay is calibrated so it lands ON a fully-coloured ring, not
 * during the colour shift.
 */
function StatusIcon({ status }: { status: StatusVariant }) {
  const isLoading = status === 'processing'
  const isSuccess = status === 'success'
  const isFailure = status === 'failure'

  // The accent colour itself communicates the state. Loading = primary,
  // success = green, failure = red. The CSS transition between them is
  // what makes the morph feel premium (vs. a hard swap).
  const accent = isFailure
    ? 'var(--cat-red)'
    : isSuccess
      ? 'var(--cat-green)'
      : 'var(--primary)'

  return (
    <div
      className={cn(
        'relative mb-9 h-32 w-32',
        isFailure && 'animate-status-shake',
      )}
      aria-hidden="true"
    >
      {/* Faint full-circle track — its colour also shifts so the entire
       *  icon palette feels coherent (rather than a blue track surviving
       *  inside a green ring). */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        <circle
          cx="50" cy="50" r="44"
          strokeWidth="6"
          fill="none"
          style={{
            stroke: accent,
            strokeOpacity: 0.12,
            transition: 'stroke 400ms ease-out',
          }}
        />
      </svg>

      {/* The morphing arc — same circle for all three states.
       *
       *  Loading: dasharray "65 220" — a partial arc with a long gap. With
       *  animate-spin running, the eye reads it as a rotating arc.
       *
       *  Settled: dasharray "276 0" — full circumference (≈ 2π·44),
       *  zero gap. The CSS transition (700 ms quint-out) smoothly grows
       *  the visible arc into a complete ring.
       *
       *  Stroke colour transitions in parallel (400 ms) so by the time
       *  the ring is closed, it's the success/failure colour. */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full animate-spin"
        style={{
          animationDuration: '1.1s',
          animationPlayState: isLoading ? 'running' : 'paused',
        }}
      >
        <circle
          cx="50" cy="50" r="44"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={isLoading ? '65 220' : '276 0'}
          style={{
            stroke: accent,
            transition:
              'stroke-dasharray 700ms cubic-bezier(0.22, 1, 0.36, 1), ' +
              'stroke 400ms ease-out',
          }}
        />
      </svg>

      {/* Inner check / X — drawn after the ring is complete and coloured.
       *  pathLength="100" lets us use round 100/0 dashoffset values in
       *  the keyframes regardless of actual path length. */}
      {(isSuccess || isFailure) && (
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
          {isSuccess ? (
            // Proper checkmark proportions — short angle then long upstroke.
            // Sized to sit comfortably inside the r=44 ring.
            <path
              d="M28 51 L43 66 L73 33"
              pathLength="100"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              className="animate-status-check"
              style={{ stroke: accent }}
            />
          ) : (
            <>
              <path
                d="M34 34 L66 66"
                pathLength="100"
                strokeWidth="7"
                strokeLinecap="round"
                fill="none"
                className="animate-status-cross-1"
                style={{ stroke: accent }}
              />
              <path
                d="M66 34 L34 66"
                pathLength="100"
                strokeWidth="7"
                strokeLinecap="round"
                fill="none"
                className="animate-status-cross-2"
                style={{ stroke: accent }}
              />
            </>
          )}
        </svg>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */

export function StatusScreen({
  status,
  title,
  message,
  meta,
  badge,
  actions,
  mode = 'overlay',
  className,
}: StatusScreenProps) {
  const isOverlay    = mode === 'overlay'
  const isPanel      = mode === 'panel'
  const isProcessing = status === 'processing'

  return (
    <div
      role={status === 'failure' ? 'alert' : 'status'}
      aria-live={status === 'failure' ? 'assertive' : 'polite'}
      className={cn(
        'flex flex-col items-center justify-center px-6 animate-status-backdrop',
        isOverlay && 'fixed inset-0 z-[200] bg-[var(--surface)]',
        isPanel   && 'absolute inset-0 z-40 bg-[var(--surface)]',
        !isOverlay && !isPanel && 'flex-1 w-full py-16',
        className,
      )}
    >
      <StatusIcon status={status} />

      {/* ── Processing copy ───────────────────────────────────────────── */}
      {isProcessing && (
        <>
          <h3 className="font-heading text-xl sm:text-[1.6rem] font-bold leading-tight tracking-tight text-[var(--text-primary)] text-center">
            {title}
          </h3>
          {message && (
            <p className="mt-3 max-w-[320px] text-center text-[0.9375rem] leading-relaxed text-[var(--text-muted)]">
              {message}
            </p>
          )}
          {badge && (
            <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--cat-amber-soft)] px-4 py-1.5 text-xs font-semibold text-[var(--warning-active)]">
              <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{badge}</span>
            </div>
          )}
        </>
      )}

      {/* ── Success / Failure copy ───────────────────────────────────── */}
      {!isProcessing && (
        <>
          {meta && (
            <p className="animate-status-title font-heading text-[2.75rem] font-bold tabular-nums leading-none text-[var(--text-primary)] mb-2">
              {meta}
            </p>
          )}

          <p
            className={cn(
              'animate-status-title font-heading font-bold tracking-tight text-center',
              meta ? 'text-xl text-[var(--text-secondary)]' : 'text-[1.6rem] leading-tight text-[var(--text-primary)]',
            )}
          >
            {title}
          </p>

          {message && (
            <p className="animate-status-message mt-3 max-w-[320px] text-center text-[0.9375rem] leading-relaxed text-[var(--text-muted)]">
              {message}
            </p>
          )}

          {actions && actions.length > 0 && (
            <div className="animate-status-actions mt-9 flex w-full max-w-[280px] flex-col gap-2.5">
              {actions.map((action, i) => (
                <Button
                  key={i}
                  type="button"
                  variant={action.variant ?? 'default'}
                  onClick={action.onClick}
                  className="w-full"
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
