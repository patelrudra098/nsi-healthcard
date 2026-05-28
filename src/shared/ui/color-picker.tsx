'use client'

/* ════════════════════════════════════════════════════════
   COLOR PICKER
   Modern, accessible, design-token-driven color picker.
   Composes Radix Popover (same primitive used by datepicker)
   so styling/positioning/keyboard a11y match the rest of shared/ui.

   Three usable surfaces:
   • <ColorPicker />          — full row: swatch + label + hex + reset
   • <ColorPicker variant="swatch" />  — just the clickable swatch (icon-grid use)
   • Pass `palette` to drop the curated preset row in the popover
   ════════════════════════════════════════════════════════ */

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Check, Pipette, RotateCcw } from 'lucide-react'

import { cn } from '@/lib/utils'

const HEX_RE = /^#[0-9a-fA-F]{6}$/
const DEFAULT_PALETTE = [
  // Neutrals
  '#ffffff', '#f5f5f4', '#e7e5e4', '#a8a29e',
  '#57534e', '#1c1917', '#0b0b0c',
  // Brand-ish accents
  '#2563eb', '#0ea5e9', '#10b981', '#f59e0b',
  '#ef4444', '#a855f7', '#ec4899', '#14b8a6',
]

function normaliseHex(input: string): string {
  const s = input.trim().replace(/^#?/, '#')
  if (HEX_RE.test(s)) return s.toLowerCase()
  // Accept 3-digit shorthand "#abc" → "#aabbcc"
  if (/^#[0-9a-fA-F]{3}$/.test(s)) {
    return ('#' + s.slice(1).split('').map((c) => c + c).join('')).toLowerCase()
  }
  return s
}

function isValidHex(s: string): boolean {
  return HEX_RE.test(s)
}

/** Pick black/white text for contrast against a hex background. */
function readableOn(hex: string): string {
  if (!HEX_RE.test(hex)) return '#000'
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return luma > 0.55 ? '#000' : '#fff'
}

export interface ColorPickerProps {
  label?: string
  value: string
  onChange: (hex: string) => void
  /** Render an inline reset affordance — shown only when hasOverride is true. */
  onReset?: () => void
  hasOverride?: boolean
  /** Hex colours rendered as preset swatches inside the popover. */
  palette?: string[]
  /** Visual layout. 'row' (default) shows swatch + label + hex + reset. 'swatch' is just the swatch button. */
  variant?: 'row' | 'swatch'
  disabled?: boolean
  className?: string
  /** Optional id propagated to the hex input for label associations. */
  inputId?: string
}

const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(function ColorPicker(
  {
    label,
    value,
    onChange,
    onReset,
    hasOverride,
    palette = DEFAULT_PALETTE,
    variant = 'row',
    disabled = false,
    className,
    inputId,
  },
  ref,
) {
  const safe = isValidHex(value) ? value : '#000000'
  const [open, setOpen] = React.useState(false)
  // Local mirror so users can type intermediate hex without immediately invalidating
  const [draft, setDraft] = React.useState(safe)
  React.useEffect(() => setDraft(safe), [safe])

  const commit = React.useCallback(
    (raw: string) => {
      const next = normaliseHex(raw)
      if (isValidHex(next)) onChange(next)
    },
    [onChange],
  )

  const swatchButton = (
    <PopoverPrimitive.Trigger asChild>
      <button
        type="button"
        aria-label={label ? `Pick ${label} colour` : 'Pick colour'}
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={disabled}
        className={cn(
          'relative inline-flex h-8 w-8 shrink-0 cursor-pointer overflow-hidden rounded-[var(--radius-sm)]',
          'border border-[var(--border)] transition-shadow duration-150',
          'hover:shadow-[var(--shadow-sm)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
          disabled && 'cursor-not-allowed opacity-50',
        )}
        style={{ background: safe }}
      >
        {/* Faint checker for very light colours so the swatch is visible against white surfaces */}
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-0 opacity-0',
            // Show checker subtly when the colour is near-white
            safe.toLowerCase() === '#ffffff' && 'opacity-100',
          )}
          style={{
            backgroundImage:
              'linear-gradient(45deg, var(--border) 25%, transparent 25%), linear-gradient(-45deg, var(--border) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--border) 75%), linear-gradient(-45deg, transparent 75%, var(--border) 75%)',
            backgroundSize: '8px 8px',
            backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0',
            mixBlendMode: 'multiply',
          }}
        />
      </button>
    </PopoverPrimitive.Trigger>
  )

  const popoverContent = (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        side="bottom"
        align="start"
        sideOffset={8}
        className={cn(
          'z-50 w-[280px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-3',
          'shadow-[var(--shadow-md)] outline-none',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98]',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.98]',
          'data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1',
          'duration-150',
        )}
      >
        {/* ── Preview header ── */}
        <div className="mb-3 flex items-center gap-2.5">
          <span
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] text-xs font-bold"
            style={{ background: safe, color: readableOn(safe) }}
          >
            Aa
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-[var(--text-primary)]">
              {label ?? 'Colour'}
            </p>
            <p className="font-mono text-[11px] tabular-nums text-[var(--text-muted)]">
              {safe.toUpperCase()}
            </p>
          </div>
          {hasOverride && onReset && (
            <button
              type="button"
              onClick={() => {
                onReset()
                setOpen(false)
              }}
              aria-label="Reset to default"
              className={cn(
                'inline-flex h-8 items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--border)] px-2',
                'text-[11px] font-medium text-[var(--text-secondary)] transition-colors',
                'hover:border-[var(--text-disabled)] hover:text-[var(--text-primary)]',
              )}
            >
              <RotateCcw className="h-3 w-3" aria-hidden /> Reset
            </button>
          )}
        </div>

        {/* ── Hex input + native eyedropper ── */}
        <div
          className={cn(
            'mb-3 flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border)]',
            'bg-[var(--background)] px-2 transition-colors',
            'focus-within:border-[var(--primary)]',
          )}
        >
          <span className="text-xs font-bold text-[var(--text-disabled)]">#</span>
          <input
            value={draft.replace(/^#/, '').toUpperCase()}
            onChange={(e) => {
              const next = '#' + e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6)
              setDraft(next)
              if (isValidHex(next)) onChange(next)
            }}
            onBlur={() => commit(draft)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                commit(draft)
                ;(e.target as HTMLInputElement).blur()
              }
            }}
            placeholder="000000"
            spellCheck={false}
            inputMode="text"
            maxLength={6}
            aria-label="Hex value"
            className="h-8 w-full bg-transparent font-mono text-xs uppercase tracking-wider text-[var(--text-primary)] outline-none placeholder:text-[var(--text-disabled)]"
          />
          {/* Native colour input — full HSL/EyeDropper, hidden but anchored under a label */}
          <label
            className={cn(
              'inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-[var(--radius-sm)]',
              'text-[var(--text-muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text-primary)]',
            )}
            title="Open system colour picker"
          >
            <Pipette className="h-3.5 w-3.5" aria-hidden />
            <input
              type="color"
              value={safe}
              onChange={(e) => onChange(e.target.value)}
              className="sr-only"
              aria-label="System colour picker"
            />
          </label>
        </div>

        {/* ── Preset palette grid ── */}
        {palette.length > 0 && (
          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
              Presets
            </p>
            <div className="grid grid-cols-8 gap-1.5">
              {palette.map((hex) => {
                const isSel = hex.toLowerCase() === safe.toLowerCase()
                return (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => {
                      onChange(hex)
                    }}
                    aria-label={`Use ${hex}`}
                    aria-pressed={isSel}
                    className={cn(
                      'group relative inline-flex aspect-square w-full items-center justify-center rounded-[var(--radius-sm)]',
                      'border border-[var(--border)] transition-transform duration-100',
                      'hover:scale-[1.08]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--background)]',
                    )}
                    style={{ background: hex }}
                  >
                    {isSel && (
                      <Check
                        className="h-3.5 w-3.5"
                        style={{ color: readableOn(hex) }}
                        aria-hidden
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )

  if (variant === 'swatch') {
    return (
      <div ref={ref} className={className}>
        <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
          {swatchButton}
          {popoverContent}
        </PopoverPrimitive.Root>
      </div>
    )
  }

  return (
    <div ref={ref} className={cn('flex items-center gap-2.5', className)}>
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        {swatchButton}
        <div className="min-w-0 flex-1">
          {label && (
            <label
              htmlFor={inputId}
              className="block text-xs font-medium text-[var(--text-secondary)]"
            >
              {label}
            </label>
          )}
          <input
            id={inputId}
            value={value}
            onChange={(e) => {
              setDraft(e.target.value)
              commit(e.target.value)
            }}
            onBlur={() => commit(draft)}
            spellCheck={false}
            aria-label={label ? `${label} hex value` : 'Hex value'}
            className={cn(
              'mt-0.5 w-full bg-transparent font-mono text-xs uppercase tracking-wider tabular-nums outline-none',
              isValidHex(value) ? 'text-[var(--text-muted)]' : 'text-[var(--error,#dc2626)]',
            )}
          />
        </div>
        {hasOverride && onReset && (
          <button
            type="button"
            onClick={onReset}
            aria-label={label ? `Reset ${label}` : 'Reset'}
            className={cn(
              'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)]',
              'text-[var(--text-muted)] transition-colors',
              'hover:bg-[var(--surface)] hover:text-[var(--text-primary)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]',
            )}
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
        {popoverContent}
      </PopoverPrimitive.Root>
    </div>
  )
})

export { ColorPicker }
