'use client'

/**
 * Bunny Stream video player.
 *
 * Uses the Player.js library for iframe communication (timeupdate, ended).
 * Falls back to native `<video>` for direct CDN or legacy URLs.
 *
 * Bunny handles its own poster/thumbnail, play button, and loading state
 * inside the iframe — we don't overlay anything on top.
 *
 * @see https://docs.bunny.net/docs/playback-control-api
 * @see https://docs.bunny.net/stream/embedding
 */

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

// ── Constants ────────────────────────────────────────────────────────────────

const BUNNY_EMBED_PREFIX  = 'https://iframe.mediadelivery.net/embed/'
const PLAYERJS_SCRIPT_URL = 'https://assets.mediadelivery.net/playerjs/playerjs-latest.min.js'
const REFRESH_LEAD_SECONDS = 30 * 60
const MIN_REFRESH_DELAY_MS = 5_000
/** Bunny player accent — matches --primary (#1568C0) without the #. */
const BUNNY_PRIMARY_COLOR  = '1568C0'

function isBunnyEmbedUrl(url: string): boolean {
  return url.startsWith(BUNNY_EMBED_PREFIX)
}

function isBunnyCdnUrl(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith('.b-cdn.net')
  } catch {
    return false
  }
}

/**
 * Appends required query params to a Bunny embed URL:
 *   - `responsive=true`   → enables Player.js postMessage API
 *   - `autoplay=false`    → shows poster + play button (no surprise audio)
 *   - `preload=true`      → start buffering immediately for instant playback
 *   - `primaryColor`      → tints Bunny controls to match our brand
 */
function ensureBunnyParams(url: string): string {
  try {
    const u = new URL(url)
    if (!u.searchParams.has('responsive'))   u.searchParams.set('responsive', 'true')
    if (!u.searchParams.has('autoplay'))     u.searchParams.set('autoplay', 'false')
    if (!u.searchParams.has('preload'))      u.searchParams.set('preload', 'true')
    if (!u.searchParams.has('primaryColor')) u.searchParams.set('primaryColor', BUNNY_PRIMARY_COLOR)
    return u.toString()
  } catch {
    return url
  }
}

// ── Player.js types & loader ────────────────────────────────────────────────

interface PlayerJsInstance {
  on(event: string, callback: (...args: unknown[]) => void): void
  play(): void
}

interface PlayerJsConstructor {
  new (iframe: HTMLIFrameElement): PlayerJsInstance
}

declare global {
  interface Window {
    playerjs?: { Player: PlayerJsConstructor }
  }
}

let scriptLoadPromise: Promise<boolean> | null = null

function loadPlayerJsScript(): Promise<boolean> {
  if (window.playerjs) return Promise.resolve(true)
  if (scriptLoadPromise) return scriptLoadPromise

  scriptLoadPromise = new Promise<boolean>((resolve) => {
    const script = document.createElement('script')
    script.src = PLAYERJS_SCRIPT_URL
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => {
      scriptLoadPromise = null
      resolve(false)
    }
    document.head.appendChild(script)
  })

  return scriptLoadPromise
}

// Eagerly preload Player.js on first import so it's cached before any video renders.
if (typeof window !== 'undefined') {
  loadPlayerJsScript()
}

// ── Public types ────────────────────────────────────────────────────────────

export type VideoProvider = 'bunny' | 'direct' | null | undefined

export interface BunnyVideoPlayerHandle {
  getCurrentTime: () => number
}

export interface BunnyVideoPlayerProps {
  src: string
  provider?: VideoProvider
  videoExpiry?: number | null
  title: string
  thumbnailUrl?: string | null
  onTimeUpdate?: (payload: { currentTime: number; duration: number }) => void
  onPause?: () => void
  onEnded?: () => void
  onRefreshToken?: () => Promise<{ videoUrl: string; videoExpiry: number } | null>
  initialSeekSeconds?: number
  className?: string
  autoPlay?: boolean
  controls?: boolean
  /** `'lazy'` defers iframe/video network cost until it scrolls into view. */
  loading?: 'eager' | 'lazy'
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function computeRefreshDelay(videoExpiry: number | null | undefined): number | null {
  if (!videoExpiry || videoExpiry <= 0) return null
  const nowSec = Math.floor(Date.now() / 1000)
  const secondsUntilExpiry = videoExpiry - nowSec
  const refreshIn = Math.max(0, secondsUntilExpiry - REFRESH_LEAD_SECONDS) * 1000
  return refreshIn < MIN_REFRESH_DELAY_MS ? null : refreshIn
}

function parseTimeupdatePayload(raw: unknown): { seconds: number; duration: number } | null {
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as { seconds?: number; duration?: number }
      return { seconds: parsed.seconds ?? 0, duration: parsed.duration ?? 0 }
    } catch {
      return null
    }
  }
  if (raw && typeof raw === 'object') {
    const obj = raw as { seconds?: number; duration?: number }
    return { seconds: obj.seconds ?? 0, duration: obj.duration ?? 0 }
  }
  return null
}

// ── Component ────────────────────────────────────────────────────────────────

export const BunnyVideoPlayer = forwardRef<BunnyVideoPlayerHandle, BunnyVideoPlayerProps>(
  function BunnyVideoPlayer(
    { src, provider, videoExpiry = null, title, thumbnailUrl, onTimeUpdate, onPause, onEnded, onRefreshToken, className, loading = 'eager' },
    ref,
  ) {
    const iframeRef = useRef<HTMLIFrameElement | null>(null)
    const onTimeUpdateRef = useRef(onTimeUpdate)
    const onPauseRef = useRef(onPause)
    const onEndedRef = useRef(onEnded)
    const onRefreshTokenRef = useRef(onRefreshToken)
    const currentTimeRef = useRef(0)
    const durationRef = useRef(0)
    const playerInitialised = useRef(false)

    // Drives the shimmer overlay — flipped off once the iframe/video surface is ready to paint.
    const [isReady, setIsReady] = useState(false)
    useEffect(() => { setIsReady(false) }, [src])

    useEffect(() => { onTimeUpdateRef.current = onTimeUpdate }, [onTimeUpdate])
    useEffect(() => { onPauseRef.current = onPause }, [onPause])
    useEffect(() => { onEndedRef.current = onEnded }, [onEnded])
    useEffect(() => { onRefreshTokenRef.current = onRefreshToken }, [onRefreshToken])

    useImperativeHandle(ref, () => ({
      getCurrentTime: () => currentTimeRef.current,
    }), [])

    // ── Player.js init (called from iframe onLoad) ───────────────────────
    const initPlayerJs = useCallback(() => {
      if (playerInitialised.current || !iframeRef.current || !isBunnyEmbedUrl(src)) return
      playerInitialised.current = true
      const iframe = iframeRef.current

      loadPlayerJsScript().then((loaded) => {
        if (!loaded || !window.playerjs || !iframe.isConnected) return
        const player = new window.playerjs.Player(iframe)

        player.on('ready', () => {
          player.on('timeupdate', (...args: unknown[]) => {
            const data = parseTimeupdatePayload(args[0])
            if (!data) return
            currentTimeRef.current = data.seconds
            durationRef.current = data.duration
            onTimeUpdateRef.current?.({ currentTime: data.seconds, duration: data.duration })
          })

          player.on('pause', () => {
            onPauseRef.current?.()
          })

          player.on('ended', () => {
            onEndedRef.current?.()
          })
        })
      })
    }, [src])

    // Reset on video change
    useEffect(() => { playerInitialised.current = false }, [src])

    // ── Token refresh ────────────────────────────────────────────────────
    useEffect(() => {
      if (!onRefreshToken) return
      const delay = computeRefreshDelay(videoExpiry)
      if (delay === null) return

      let cancelled = false
      const timer = window.setTimeout(async () => {
        if (cancelled) return
        try {
          const next = await onRefreshTokenRef.current?.()
          if (cancelled || !next || !iframeRef.current) return
          iframeRef.current.src = ensureBunnyParams(next.videoUrl)
        } catch { /* silent */ }
      }, delay)

      return () => { cancelled = true; window.clearTimeout(timer) }
    }, [videoExpiry, onRefreshToken, src])

    // ── Render ────────────────────────────────────────────────────────────
    const wrapperClass = useMemo(
      () => cn('relative w-full overflow-hidden bg-black aspect-video', className),
      [className],
    )

    if (!src) return null

    // ── Bunny iframe embed
    if (isBunnyEmbedUrl(src)) {
      return (
        <div className={wrapperClass}>
          {/* Shimmer — visible until the Bunny iframe has finished its handshake */}
          {!isReady && <div className="shimmer absolute inset-0" aria-hidden="true" />}
          <iframe
            ref={iframeRef}
            src={ensureBunnyParams(src)}
            title={title}
            aria-label={title}
            className={cn(
              'absolute inset-0 h-full w-full border-0 transition-opacity duration-200',
              isReady ? 'opacity-100' : 'opacity-0',
            )}
            // picture-in-picture intentionally omitted — we don't want
            // the playback to detach into a floating window. Denying it at
            // the iframe `allow` level is how Bunny's player knows to hide
            // the PiP button, since the API call will fail regardless.
            allow="accelerometer; gyroscope; autoplay; encrypted-media"
            allowFullScreen
            loading={loading}
            onLoad={() => {
              setIsReady(true)
              initPlayerJs()
            }}
          />
        </div>
      )
    }

    // ── Bunny CDN URL → native <video>
    if (isBunnyCdnUrl(src)) {
      return (
        <div className={wrapperClass}>
          {!isReady && <div className="shimmer absolute inset-0" aria-hidden="true" />}
          <video
            src={src}
            title={title}
            aria-label={title}
            controls
            controlsList="nodownload noremoteplayback noplaybackrate"
            disablePictureInPicture
            disableRemotePlayback
            playsInline
            preload={loading === 'lazy' ? 'none' : 'metadata'}
            poster={thumbnailUrl ?? undefined}
            className={cn(
              'absolute inset-0 h-full w-full bg-black transition-opacity duration-200',
              isReady ? 'opacity-100' : 'opacity-0',
            )}
            onLoadedMetadata={() => setIsReady(true)}
            onTimeUpdate={(e) => {
              const v = e.currentTarget
              currentTimeRef.current = v.currentTime
              durationRef.current = v.duration || 0
              onTimeUpdateRef.current?.({ currentTime: v.currentTime, duration: v.duration || 0 })
            }}
            onPause={(e) => {
              // Suppress the final `pause` that fires together with `ended` —
              // the ended path owns that final ping.
              if (e.currentTarget.ended) return
              onPauseRef.current?.()
            }}
            onEnded={() => onEndedRef.current?.()}
          />
        </div>
      )
    }

    // ── provider="bunny" but unrecognised URL
    if (provider === 'bunny') {
      return (
        <div
          className={cn(
            'relative w-full aspect-video overflow-hidden rounded-[var(--radius)]',
            'border border-dashed border-[var(--warning)]/40 bg-[var(--warning-soft)]/30',
            'flex items-center justify-center p-6 text-center',
            className,
          )}
          role="alert"
        >
          <div className="space-y-1 max-w-md">
            <p className="text-sm font-semibold text-[var(--warning)] font-heading">
              Video not linked to Bunny Stream
            </p>
            <p className="text-xs text-[var(--text-muted)] font-sans">
              Link a Bunny Video ID in the admin panel so it plays via the Bunny player.
            </p>
          </div>
        </div>
      )
    }

    // ── Legacy / direct URL → native <video>
    return (
      <div className={wrapperClass}>
        {!isReady && <div className="shimmer absolute inset-0" aria-hidden="true" />}
        <video
          src={src}
          title={title}
          aria-label={title}
          controls
          playsInline
          preload={loading === 'lazy' ? 'none' : 'metadata'}
          poster={thumbnailUrl ?? undefined}
          className={cn(
            'absolute inset-0 h-full w-full bg-black transition-opacity duration-200',
            isReady ? 'opacity-100' : 'opacity-0',
          )}
          onLoadedMetadata={() => setIsReady(true)}
          onTimeUpdate={(e) => {
            const v = e.currentTarget
            currentTimeRef.current = v.currentTime
            durationRef.current = v.duration || 0
            onTimeUpdateRef.current?.({ currentTime: v.currentTime, duration: v.duration || 0 })
          }}
          onPause={(e) => {
            if (e.currentTarget.ended) return
            onPauseRef.current?.()
          }}
          onEnded={() => onEndedRef.current?.()}
        />
      </div>
    )
  },
)
