import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════
   VARIANTS
   ════════════════════════════════════════════════════════ */

const paginationLinkVariants = cva(
  [
    // Layout
    "inline-flex items-center justify-center gap-1.5",
    "whitespace-nowrap relative",
    "cursor-pointer select-none",

    // Typography
    "text-sm font-medium",

    // Shape
    // Radius moved to size variants

    // Focus
    "outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-[var(--focus-ring)]",

    // GROUP 1: TACTILE PRESS (150ms)
    "transition-[background-color,color,border-color,box-shadow,transform]",
    "duration-150",
    "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
    "active:scale-[0.985]",

    // Disabled (anchor elements use aria-disabled, not :disabled)
    "aria-disabled:pointer-events-none",
    "aria-disabled:opacity-50",

    // Icons
    "[&_svg]:pointer-events-none",
    "[&_svg]:shrink-0",
    "[&_svg]:size-4",

    // Accessibility
    "motion-reduce:transition-none",
    "motion-reduce:active:scale-100",
  ].join(" "),
  {
    variants: {
      isActive: {
        true: [
          // ── Active page — primary fill ──
          "bg-[var(--primary)]",
          "text-[var(--primary-foreground)]",
          "shadow-[var(--shadow-sm)]",
          "cursor-default",
          "active:scale-100", // no tactile on current page
        ].join(" "),

        false: [
          // ── Inactive page — ghost style ──
          "bg-transparent",
          "text-[var(--text-secondary)]",
          "hover:bg-[var(--muted)]",
          "hover:text-[var(--foreground)]",
        ].join(" "),
      },

      size: {
        sm: "h-9 min-w-9 px-4 text-sm rounded-[var(--radius-sm)]",
        default: "h-11 min-w-11 md:h-10 md:min-w-10 px-5 md:px-4 text-sm rounded-[var(--radius)]",
        lg: "h-12 min-w-12 px-6 text-base rounded-[var(--radius-md)]",
        icon: "h-10 min-w-10 w-10 rounded-[var(--radius)]",
      },
    },

    defaultVariants: {
      isActive: false,
      size: "default",
    },
  },
);

/* ════════════════════════════════════════════════════════
   TYPES
   ════════════════════════════════════════════════════════ */

export interface PaginationLinkProps
  extends React.ComponentProps<"a">,
    VariantProps<typeof paginationLinkVariants> {}

/* ════════════════════════════════════════════════════════
   COMPONENTS
   ════════════════════════════════════════════════════════ */

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li data-slot="pagination-item" className={cn(className)} {...props} />
  );
}

function PaginationLink({
  className,
  isActive,
  size = "default",
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive || undefined}
      className={cn(
        paginationLinkVariants({ isActive: !!isActive, size }),
        className,
      )}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  size,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size={size}
      className={cn("gap-1.5 px-3", className)}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:inline">Previous</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  size,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size={size}
      className={cn("gap-1.5 px-3", className)}
      {...props}
    >
      <span className="hidden sm:inline">Next</span>
      <ChevronRightIcon />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex h-11 min-w-11 md:h-10 md:min-w-10 items-center justify-center",
        "text-[var(--muted-foreground)]",
        className,
      )}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

/* ════════════════════════════════════════════════════════
   EXPORTS
   ════════════════════════════════════════════════════════ */

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  paginationLinkVariants,
};