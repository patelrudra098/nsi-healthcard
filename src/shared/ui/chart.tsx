'use client'

import { memo, useLayoutEffect, useRef, useState, type ReactElement } from 'react'
import { ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'

interface ChartProps {
  /** Fixed pixel height of the chart area. Required for correct layout. */
  height: number
  /** A single Recharts chart element — BarChart, AreaChart, PieChart, LineChart, etc. */
  children: ReactElement
  /** Screen-reader description; applied with `role="img"` when set. */
  'aria-label'?: string
  className?: string
}

/**
 * Wraps Recharts' `ResponsiveContainer` with a one-tick layout gate.
 *
 * Recharts v3 logs a spurious `width(-1) height(-1)` warning on first render
 * because its `ResizeObserver` hasn't yet reported dimensions. Mounting the
 * container inside a `useLayoutEffect` hook delays it until *after* the browser
 * has measured the parent — synchronously, before paint — so there's no visible
 * flash and no noise in the console.
 *
 * Usage — replace this pattern:
 *
 *   <div style={{ height: 240 }}>
 *     <ResponsiveContainer width="100%" height="100%">
 *       <AreaChart …>…</AreaChart>
 *     </ResponsiveContainer>
 *   </div>
 *
 * with:
 *
 *   <Chart height={240} aria-label="Leads over time">
 *     <AreaChart …>…</AreaChart>
 *   </Chart>
 */
export const Chart = memo(function Chart({
  height,
  children,
  className,
  'aria-label': ariaLabel,
}: ChartProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    // By the time this fires, the browser has already laid out our parent div
    // with `style={{ height }}`, so ResizeObserver inside Recharts will get a
    // valid measurement on mount.
    setReady(true)
  }, [])

  return (
    <div
      ref={ref}
      className={cn('w-full', className)}
      style={{ height }}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
    >
      {ready && (
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      )}
    </div>
  )
})
