"use client"; /// 100% Done

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════
   CONSTANTS
   ════════════════════════════════════════════════════════ */

const FALLBACK_DELAY_MS = 600;

/* ════════════════════════════════════════════════════════
   VARIANTS
   ════════════════════════════════════════════════════════ */

const avatarVariants = cva(
  [
    // Layout
    "relative inline-flex shrink-0 select-none items-center justify-center",
    "overflow-hidden align-middle",

    // Surface
    "bg-[var(--muted)] text-[var(--text-primary)]",
    "border-2 border-[var(--surface)]",

    // Typography
    "font-semibold uppercase",

    // Focus — outline-based (matching button)
    "focus-visible:outline-2 focus-visible:outline-offset-2",
    "focus-visible:outline-[var(--focus-ring)]",
  ].join(" "),
  {
    variants: {
      size: {
        xs: "h-6 w-6 text-[0.625rem]",
        sm: "h-8 w-8 text-xs",
        default: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-lg",
        "2xl": "h-20 w-20 text-xl",
      },

      shape: {
        circle: "rounded-full",
        square: "rounded-[var(--radius-sm)]",
        rounded: "rounded-[var(--radius)]",
      },

      interactive: {
        true: [
          "cursor-pointer",

          // Motion — GROUP 1: Tactile press (matching button exactly)
          "transition-[border-color,box-shadow,transform]",
          "duration-150",
          "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
          "motion-reduce:transition-none",

          // Hover
          "hover:shadow-[var(--shadow-md)]",

          // Active — tactile press (same as button)
          "active:scale-[0.985]",
          "motion-reduce:active:scale-100",
        ].join(" "),
        false: [
          // Non-interactive — GROUP 4: State transition
          "transition-[border-color,box-shadow]",
          "duration-150",
          "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
          "motion-reduce:transition-none",
        ].join(" "),
      },
    },

    defaultVariants: {
      size: "default",
      shape: "circle",
      interactive: false,
    },
  },
);

const avatarImageVariants = cva([
  "aspect-square h-full w-full object-cover",
].join(" "));

const avatarFallbackVariants = cva([
  "flex h-full w-full items-center justify-center",
].join(" "));

const avatarBadgeVariants = cva(
  [
    "absolute block rounded-full",
    "ring-2 ring-[var(--surface)]",

    // Motion — GROUP 4: State transition (FIXED)
    "transition-colors",
    "duration-150",
    "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
    "motion-reduce:transition-none",
  ].join(" "),
  {
    variants: {
      status: {
        online: "bg-[var(--success)]",
        offline: "bg-[var(--text-muted)]",
        busy: "bg-[var(--error)]",
        away: "bg-[var(--warning)]",
      },

      size: {
        xs: "h-1.5 w-1.5 bottom-0 right-0",
        sm: "h-2 w-2 bottom-0 right-0",
        default: "h-2.5 w-2.5 bottom-0 right-0",
        lg: "h-3 w-3 bottom-0.5 right-0.5",
        xl: "h-3.5 w-3.5 bottom-1 right-1",
        "2xl": "h-4 w-4 bottom-1.5 right-1.5",
      },
    },

    defaultVariants: {
      status: "online",
      size: "default",
    },
  },
);

const avatarGroupVariants = cva(
  [
    // Stacking context for z-index to work
    "isolate flex items-center",
  ].join(" "),
  {
    variants: {
      spacing: {
        tight: "-space-x-4",
        default: "-space-x-3",
        loose: "-space-x-2",
      },
    },

    defaultVariants: {
      spacing: "default",
    },
  },
);

/* ════════════════════════════════════════════════════════
   CONTEXT
   ════════════════════════════════════════════════════════ */

type AvatarSize = "xs" | "sm" | "default" | "lg" | "xl" | "2xl";

interface AvatarGroupContextValue {
  size?: AvatarSize;
  isGrouped?: boolean;
}

const AvatarGroupContext = React.createContext<AvatarGroupContextValue>({});

const useAvatarGroup = () => React.useContext(AvatarGroupContext);

/* ════════════════════════════════════════════════════════
   TYPES
   ════════════════════════════════════════════════════════ */

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  /** Image source URL */
  src?: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Fallback content (typically initials) */
  fallback?: React.ReactNode;
  /** Status indicator */
  status?: "online" | "offline" | "busy" | "away";
  /** Show status badge */
  showBadge?: boolean;
  /** Click handler (enables interactive mode) */
  onClick?: () => void;
  /** Delay before showing fallback (prevents flash) */
  fallbackDelayMs?: number;
}

export interface AvatarImageProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> {}

export interface AvatarFallbackProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> {
  /** Delay before showing fallback */
  delayMs?: number;
}

export interface AvatarBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof avatarBadgeVariants> {}

export interface AvatarGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarGroupVariants> {
  /** Maximum avatars to display */
  max?: number;
  /** Size for all avatars in group */
  size?: AvatarSize;
}

/* ════════════════════════════════════════════════════════
   STATUS LABELS (i18n-ready)
   ════════════════════════════════════════════════════════ */

const STATUS_LABELS: Record<string, string> = {
  online: "Online",
  offline: "Offline",
  busy: "Busy",
  away: "Away",
} as const;

/* ════════════════════════════════════════════════════════
   AVATAR ROOT
   ════════════════════════════════════════════════════════ */

export const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(
  (
    {
      className,
      size: sizeProp,
      shape,
      interactive: interactiveProp,
      src,
      alt,
      fallback,
      status,
      showBadge = false,
      onClick,
      fallbackDelayMs = FALLBACK_DELAY_MS,
      children,
      ...props
    },
    ref,
  ) => {
    // Inherit from group context
    const groupContext = useAvatarGroup();
    const size = sizeProp ?? groupContext.size ?? "default";
    const isGrouped = groupContext.isGrouped ?? false;

    // Auto-detect interactive if onClick is provided
    const interactive = interactiveProp ?? !!onClick;

    // Keyboard handler for interactive avatars
    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLSpanElement>) => {
        if (interactive && onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      },
      [interactive, onClick],
    );

    // Determine ARIA label
    const ariaLabel = interactive
      ? alt || (typeof fallback === "string" ? fallback : undefined)
      : undefined;

    return (
      <AvatarPrimitive.Root
        ref={ref}
        data-slot="avatar"
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={ariaLabel}
        onClick={onClick}
        onKeyDown={interactive ? handleKeyDown : undefined}
        className={cn(
          avatarVariants({ size, shape, interactive }),
          // Group behavior: z-index only (no scale to prevent layout shift)
          isGrouped && "hover:z-10",
          className,
        )}
        {...props}
      >
        {children ? (
          children
        ) : (
          <>
            {src && <AvatarImage src={src} alt={alt || ""} />}
            <AvatarFallback delayMs={src ? fallbackDelayMs : 0}>
              {fallback}
            </AvatarFallback>
          </>
        )}

        {showBadge && status && <AvatarBadge status={status} size={size} />}
      </AvatarPrimitive.Root>
    );
  },
);

Avatar.displayName = "Avatar";

/* ════════════════════════════════════════════════════════
   AVATAR IMAGE
   ════════════════════════════════════════════════════════ */

export const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  AvatarImageProps
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    data-slot="avatar-image"
    loading="lazy"
    referrerPolicy="no-referrer"
    className={cn(avatarImageVariants(), className)}
    {...props}
  />
));

AvatarImage.displayName = "AvatarImage";

/* ════════════════════════════════════════════════════════
   AVATAR FALLBACK
   ════════════════════════════════════════════════════════ */

export const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  AvatarFallbackProps
>(({ className, delayMs, children, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    data-slot="avatar-fallback"
    delayMs={delayMs}
    className={cn(avatarFallbackVariants(), className)}
    {...props}
  >
    {children}
  </AvatarPrimitive.Fallback>
));

AvatarFallback.displayName = "AvatarFallback";

/* ════════════════════════════════════════════════════════
   AVATAR BADGE (STATUS INDICATOR)
   ════════════════════════════════════════════════════════ */

export const AvatarBadge = React.forwardRef<HTMLSpanElement, AvatarBadgeProps>(
  ({ className, status, size, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="avatar-badge"
      role="status"
      aria-label={status ? STATUS_LABELS[status] : undefined}
      className={cn(avatarBadgeVariants({ status, size }), className)}
      {...props}
    />
  ),
);

AvatarBadge.displayName = "AvatarBadge";

/* ════════════════════════════════════════════════════════
   AVATAR GROUP
   ════════════════════════════════════════════════════════ */

export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, spacing, max, size = "default", children, ...props }, ref) => {
    const childArray = React.Children.toArray(children);
    const displayChildren = max ? childArray.slice(0, max) : childArray;
    const remaining =
      max && childArray.length > max ? childArray.length - max : 0;

    const contextValue = React.useMemo<AvatarGroupContextValue>(
      () => ({ size, isGrouped: true }),
      [size],
    );

    return (
      <AvatarGroupContext.Provider value={contextValue}>
        <div
          ref={ref}
          role="group"
          aria-label={`Group of ${childArray.length} avatars`}
          data-slot="avatar-group"
          className={cn(avatarGroupVariants({ spacing }), className)}
          {...props}
        >
          {displayChildren}

          {remaining > 0 && (
            <Avatar
              fallback={`+${remaining}`}
              aria-label={`${remaining} more users`}
              className="bg-[var(--muted)] text-[var(--text-muted)]"
            />
          )}
        </div>
      </AvatarGroupContext.Provider>
    );
  },
);

AvatarGroup.displayName = "AvatarGroup";