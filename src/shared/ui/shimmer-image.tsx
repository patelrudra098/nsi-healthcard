'use client'

/**
 * Shimmer-aware wrapper around `next/image`.
 *
 * Purpose: eliminate the "blank box → pop-in" feeling on remote images.
 * A muted shimmer bar sweeps left-to-right inside the container until the
 * real image decodes, then fades out in 200ms.
 *
 * Built on top of `next/image` so we still get:
 *   - AVIF/WebP negotiation
 *   - Responsive `srcset` via `sizes`
 *   - Lazy loading for below-the-fold thumbnails
 *   - `priority` → preload link for above-the-fold hero art
 *
 * The component is layout-agnostic: it fills its parent (caller controls
 * aspect ratio), matching the `fill` pattern used across the codebase.
 */

import { useState, type CSSProperties } from 'react'
import Image, { type ImageProps } from 'next/image'
import { cn } from '@/lib/utils'

type ForwardedImageProps = Omit<ImageProps, 'onLoad' | 'onError' | 'placeholder' | 'blurDataURL'>

export interface ShimmerImageProps extends ForwardedImageProps {
  /** Tailwind classes forwarded to the wrapper element (positioning / aspect / radius). */
  wrapperClassName?: string
  /** Inline styles for the wrapper (rare — prefer wrapperClassName). */
  wrapperStyle?: CSSProperties
  /** Fallback element shown when the image fails to load. */
  fallback?: React.ReactNode
  /** Overlays rendered on top of the image (badges, chips, hover affordances). */
  children?: React.ReactNode
}

export function ShimmerImage({
  wrapperClassName,
  wrapperStyle,
  fallback,
  children,
  className,
  alt,
  ...imageProps
}: ShimmerImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  return (
    <div
      className={cn('relative overflow-hidden bg-[var(--muted)]', wrapperClassName)}
      style={wrapperStyle}
    >
      {/* Shimmer overlay — fades out once the image decodes */}
      {status === 'loading' && (
        <div
          className="shimmer absolute inset-0"
          aria-hidden="true"
        />
      )}

      {/* Error fallback */}
      {status === 'error' && (fallback ?? (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--muted)] text-xs text-[var(--text-muted)]">
          Image unavailable
        </div>
      ))}

      {/* Real image — only painted once decoded to avoid flicker */}
      <Image
        {...imageProps}
        alt={alt}
        className={cn(
          'transition-opacity duration-200 ease-out',
          status === 'loaded' ? 'opacity-100' : 'opacity-0',
          className,
        )}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />

      {/* Overlays (badges, chips, hover CTAs) — always on top of shimmer + image */}
      {children}
    </div>
  )
}
