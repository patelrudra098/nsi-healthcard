'use client'

import * as React from 'react'
import {
  CheckCircle2,
  FileText,
  ImagePlus,
  Loader2,
  Paperclip,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Input } from '@/shared/ui/input'

/* ════════════════════════════════════════════════════════
   FILE UPLOAD
   Central, design-token-driven dropzone for image + file uploads.
   Replaces ad-hoc dropzones across the codebase (CMS ImageField,
   PhotoUploader, ThumbnailUploadField, MediaDrawer image-side,
   AttachmentUploadField, AvatarSection).

   Kinds:
   - 'image' (default) — drag/drop, preview, optional paste-URL fallback
   - 'file'            — drag/drop, filename + size readout (e.g. PDFs)

   All visuals use the same CSS variables as the rest of shared/ui so
   it stays uniform with Input/Card/Button/Skeleton.
   ════════════════════════════════════════════════════════ */

export interface FileUploadProps {
  /** Visual kind. 'image' renders a preview; 'file' renders a filename row. */
  kind?: 'image' | 'file'
  /** Current value — image URL for kind='image', filename or path for kind='file'. */
  value?: string
  /** Called when the value changes (after upload completes, after URL paste, or on clear). */
  onChange: (value: string) => void
  /** Uploader. Receives the File, must return the final URL/path. Throws on failure. */
  onUpload: (file: File) => Promise<string>
  /** MIME pattern for the underlying <input type=file>. Defaults to images for kind='image'. */
  accept?: string
  /** Optional client-side size cap. Validation only — server still enforces. */
  maxSizeBytes?: number
  /** Field label shown above the dropzone. */
  label?: string
  /** Helper line shown below the preview area (e.g. "JPG · PNG · WebP up to 10 MB"). */
  helperText?: string
  /** Show a manual URL input below the dropzone. Useful for CMS workflows. */
  allowUrlInput?: boolean
  /** URL input placeholder when allowUrlInput is true. */
  urlPlaceholder?: string
  /** Disable interaction. */
  disabled?: boolean
  /** Visual height of the preview area. Defaults to 'md'. */
  size?: 'sm' | 'md' | 'lg'
  /** Optional className for the outer wrapper. */
  className?: string
  /** Show a small "Remove" button on hover when a value is present. */
  removable?: boolean
  /** Filename hint when value is a remote URL with no filename — kind='file' only. */
  fileNameHint?: string
  /** Surface a validation error to the parent (instead of toasting yourself). */
  onError?: (message: string) => void
  /**
   * Lock the dropzone to a specific aspect ratio (e.g. '1/1', '3/4', '16/9').
   * When set, the preview fills the dropzone with object-cover and the
   * `size` height caps are ignored. Useful for portrait photos / banners.
   */
  aspectRatio?: string
}

const SIZE_HEIGHT: Record<NonNullable<FileUploadProps['size']>, string> = {
  sm: 'min-h-[112px]',
  md: 'min-h-[160px]',
  lg: 'min-h-[220px]',
}

const SIZE_PREVIEW: Record<NonNullable<FileUploadProps['size']>, string> = {
  sm: 'max-h-[104px]',
  md: 'max-h-[152px]',
  lg: 'max-h-[212px]',
}

const DEFAULT_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml'

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

function fileNameFromUrl(url: string): string {
  if (!url) return ''
  try {
    const u = new URL(url)
    const last = u.pathname.split('/').filter(Boolean).pop()
    return last ?? url
  } catch {
    return url.split('/').filter(Boolean).pop() ?? url
  }
}

const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(function FileUpload(
  {
    kind = 'image',
    value = '',
    onChange,
    onUpload,
    accept,
    maxSizeBytes,
    label,
    helperText,
    allowUrlInput = false,
    urlPlaceholder = 'Or paste a URL…',
    disabled = false,
    size = 'md',
    className,
    removable = true,
    fileNameHint,
    onError,
    aspectRatio,
  },
  ref,
) {
  const fileRef = React.useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = React.useState(false)
  const [dragging, setDragging] = React.useState(false)
  const [justUploaded, setJustUploaded] = React.useState(false)
  const [localError, setLocalError] = React.useState<string | null>(null)

  const effectiveAccept = accept ?? (kind === 'image' ? DEFAULT_IMAGE_ACCEPT : '*/*')

  /* ── Validation ─────────────────────────────────────── */
  const validate = React.useCallback(
    (file: File): string | null => {
      if (maxSizeBytes && file.size > maxSizeBytes) {
        return `File is too large. Max ${formatBytes(maxSizeBytes)}.`
      }
      if (accept) {
        const patterns = accept.split(',').map((s) => s.trim()).filter(Boolean)
        const match = patterns.some((p) => {
          if (p.endsWith('/*')) return file.type.startsWith(p.slice(0, -1))
          return file.type === p
        })
        if (!match) return 'That file type isn’t supported.'
      } else if (kind === 'image' && !file.type.startsWith('image/')) {
        return 'Please choose an image file.'
      }
      return null
    },
    [accept, kind, maxSizeBytes],
  )

  /* ── Core upload flow ───────────────────────────────── */
  const handleFile = React.useCallback(
    async (file: File) => {
      const err = validate(file)
      if (err) {
        setLocalError(err)
        onError?.(err)
        return
      }
      setLocalError(null)
      setUploading(true)
      try {
        const url = await onUpload(file)
        onChange(url)
        setJustUploaded(true)
        window.setTimeout(() => setJustUploaded(false), 2200)
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Upload failed. Please try again.'
        setLocalError(msg)
        onError?.(msg)
      } finally {
        setUploading(false)
      }
    },
    [onChange, onError, onUpload, validate],
  )

  /* ── Drag handlers ──────────────────────────────────── */
  const onDragOver = (e: React.DragEvent) => {
    if (disabled || uploading) return
    e.preventDefault()
    setDragging(true)
  }
  const onDragLeave = () => setDragging(false)
  const onDrop = (e: React.DragEvent) => {
    if (disabled || uploading) return
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) void handleFile(file)
  }

  /* ── Click / keyboard ───────────────────────────────── */
  const openPicker = () => {
    if (disabled || uploading) return
    fileRef.current?.click()
  }
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openPicker()
    }
  }

  /* ── Derived UI bits ────────────────────────────────── */
  const hasValue = !!value
  const isImage = kind === 'image'
  const displayName = isImage ? fileNameFromUrl(value) : value ? fileNameHint || fileNameFromUrl(value) : ''
  const hint =
    helperText ??
    (isImage
      ? 'JPG · PNG · WebP · GIF · SVG'
      : 'Click or drag a file here')

  return (
    <div ref={ref} className={cn('space-y-2', className)}>
      {(label || justUploaded) && (
        <div className="flex items-center justify-between">
          {label ? (
            <label className="text-sm font-medium text-[var(--text-secondary)]">{label}</label>
          ) : (
            <span />
          )}
          {justUploaded && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--success,#16a34a)]">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Uploaded
            </span>
          )}
        </div>
      )}

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={label ? `Upload ${label}` : 'Upload file'}
        aria-disabled={disabled || undefined}
        onClick={openPicker}
        onKeyDown={onKeyDown}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        data-state={
          uploading ? 'uploading' : dragging ? 'dragging' : hasValue ? 'filled' : 'idle'
        }
        className={cn(
          'group relative flex cursor-pointer flex-col items-center justify-center gap-2',
          'rounded-[var(--radius-md)] border-2 border-dashed',
          'transition-[border-color,background-color,transform] duration-150',
          '[transition-timing-function:cubic-bezier(0,0,0.2,1)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
          // Height: aspect-ratio overrides the size cap when set
          !aspectRatio && SIZE_HEIGHT[size],
          // State styles
          dragging
            ? 'border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_8%,var(--background))]'
            : hasValue
              ? 'border-[var(--border)] hover:border-[var(--primary)]'
              : 'border-[var(--border)] bg-[color-mix(in_srgb,var(--muted)_60%,transparent)] hover:border-[var(--primary)] hover:bg-[color-mix(in_srgb,var(--primary)_3%,var(--background))]',
          (disabled || uploading) && 'pointer-events-none opacity-60',
          'motion-reduce:transition-none',
        )}
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        {/* ── Filled, image kind ──────────────────────── */}
        {isImage && hasValue ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt=""
              className={cn(
                'rounded-[calc(var(--radius-md)-2px)] object-cover',
                // When aspect-locked, fill the dropzone (absolute). Otherwise
                // honour the size cap so the preview stays compact in forms.
                aspectRatio
                  ? 'absolute inset-0 h-full w-full'
                  : cn('w-full', SIZE_PREVIEW[size]),
              )}
            />
            <div
              className={cn(
                'pointer-events-none absolute inset-0 flex items-center justify-center',
                'rounded-[calc(var(--radius-md)-2px)] bg-black/50 opacity-0',
                'transition-opacity duration-150 group-hover:opacity-100',
              )}
            >
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-white" aria-hidden />
              ) : (
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full',
                    'bg-[var(--card)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)]',
                    'shadow-[var(--shadow-md)]',
                  )}
                >
                  <UploadCloud className="h-3.5 w-3.5" aria-hidden /> Replace
                </span>
              )}
            </div>
            {removable && !uploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange('')
                  setLocalError(null)
                }}
                aria-label="Remove image"
                className={cn(
                  'absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center',
                  'rounded-full bg-[var(--card)] text-[var(--text-muted)]',
                  'shadow-[var(--shadow-sm)] opacity-0 transition-opacity duration-150',
                  'group-hover:opacity-100 hover:text-[var(--error)] focus-visible:opacity-100',
                )}
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            )}
          </>
        ) : !isImage && hasValue ? (
          /* ── Filled, file kind ──────────────────────── */
          <div className="flex w-full items-center gap-3 px-4">
            <span
              className={cn(
                'inline-flex h-10 w-10 shrink-0 items-center justify-center',
                'rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--primary)_10%,var(--background))]',
                'text-[var(--primary)]',
              )}
            >
              <FileText className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                {displayName || 'Uploaded file'}
              </p>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                Click to replace · or drop a new file here
              </p>
            </div>
            {removable && !uploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange('')
                  setLocalError(null)
                }}
                aria-label="Remove file"
                className={cn(
                  'inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)]',
                  'text-[var(--text-muted)] transition-colors',
                  'hover:bg-[var(--error-soft,color-mix(in_srgb,var(--error)_12%,transparent))] hover:text-[var(--error)]',
                )}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
              </button>
            )}
          </div>
        ) : (
          /* ── Empty state ─────────────────────────────── */
          <>
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" aria-hidden />
            ) : (
              <div
                className={cn(
                  'inline-flex h-12 w-12 items-center justify-center rounded-full',
                  'bg-[color-mix(in_srgb,var(--primary)_10%,var(--background))] text-[var(--primary)]',
                )}
              >
                {isImage ? (
                  <ImagePlus className="h-5 w-5" aria-hidden />
                ) : (
                  <Paperclip className="h-5 w-5" aria-hidden />
                )}
              </div>
            )}
            <div className="text-center">
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {uploading
                  ? 'Uploading…'
                  : dragging
                    ? 'Drop to upload'
                    : isImage
                      ? 'Click or drag image here'
                      : 'Click or drag file here'}
              </p>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">{hint}</p>
            </div>
          </>
        )}

        <input
          ref={fileRef}
          type="file"
          accept={effectiveAccept}
          className="sr-only"
          disabled={disabled || uploading}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleFile(file)
            // Reset so the same file can be picked again after a remove
            e.target.value = ''
          }}
        />
      </div>

      {localError && (
        <p
          role="alert"
          className="text-xs font-medium text-[var(--error,#dc2626)]"
        >
          {localError}
        </p>
      )}

      {allowUrlInput && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={urlPlaceholder}
          disabled={disabled}
          className="text-xs"
        />
      )}
    </div>
  )
})

export { FileUpload }
