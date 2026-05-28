"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  MoreHorizontal,
  Check,
  Minus,
  Loader2,
  Inbox,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

/* ════════════════════════════════════════════════════════
   TABLE CONTAINER
   ════════════════════════════════════════════════════════ */

interface TableProps extends React.ComponentProps<"table"> {
  isLoading?: boolean;
}

function Table({ className, isLoading, children, ...props }: TableProps) {
  return (
    <div
      data-slot="table-container"
      className={cn(
        "relative w-full overflow-x-auto",
        "rounded-[var(--radius)] border border-[var(--border)]",
        "bg-[var(--card)]",
        "shadow-[var(--shadow-sm)]",
      )}
    >
      {isLoading && (
        <div
          className={cn(
            "absolute inset-0 z-20",
            "flex items-center justify-center",
            "rounded-[var(--radius)]",
            "bg-[var(--card)]/80 backdrop-blur-[2px]",
            "transition-opacity duration-200",
            "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
          )}
          aria-live="polite"
        >
          <Loader2
            className="h-6 w-6 animate-spin text-[var(--primary)]"
            aria-hidden="true"
          />
          <span className="sr-only">Loading table data…</span>
        </div>
      )}

      <table
        data-slot="table"
        className={cn(
          "w-full caption-bottom border-collapse",
          "text-sm text-[var(--text-secondary)]",
          className,
        )}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   TABLE HEADER
   ════════════════════════════════════════════════════════ */

interface TableHeaderProps extends React.ComponentProps<"thead"> {
  sticky?: boolean;
}

function TableHeader({ className, sticky, ...props }: TableHeaderProps) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "bg-[var(--muted)]/60",
        "[&_tr]:border-b [&_tr]:border-[var(--border)]",
        sticky && [
          "sticky top-0 z-10",
          "shadow-[0_1px_0_var(--border)]",
          "backdrop-blur-sm bg-[var(--muted)]/90",
        ],
        className,
      )}
      {...props}
    />
  );
}

/* ════════════════════════════════════════════════════════
   TABLE BODY
   ════════════════════════════════════════════════════════ */

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn(
        "[&_tr:last-child]:border-0",
        "bg-[var(--card)]",
        className,
      )}
      {...props}
    />
  );
}

/* ════════════════════════════════════════════════════════
   TABLE FOOTER
   ════════════════════════════════════════════════════════ */

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t border-[var(--border)]",
        "bg-[var(--muted)]/40",
        "text-sm font-semibold text-[var(--text-primary)]",
        "[&>tr:last-child]:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

/* ════════════════════════════════════════════════════════
   TABLE ROW
   ════════════════════════════════════════════════════════ */

interface TableRowProps extends React.ComponentProps<"tr"> {
  selected?: boolean;
  clickable?: boolean;
}

function TableRow({
  className,
  selected,
  clickable,
  ...props
}: TableRowProps) {
  return (
    <tr
      data-slot="table-row"
      data-state={selected ? "selected" : undefined}
      className={cn(
        "border-b border-[var(--border)]",
        "transition-colors duration-150",
        "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
        "motion-reduce:transition-none",
        "hover:bg-[var(--muted)]/40",
        "data-[state=selected]:bg-[var(--primary-soft)]/60",
        "data-[state=selected]:hover:bg-[var(--primary-soft)]/80",
        clickable && "cursor-pointer active:bg-[var(--muted)]/60",
        className,
      )}
      {...props}
    />
  );
}

/* ════════════════════════════════════════════════════════
   TABLE HEAD (th) — static
   ════════════════════════════════════════════════════════ */

interface TableHeadProps extends React.ComponentProps<"th"> {
  align?: "left" | "center" | "right";
}

function TableHead({ className, align = "left", ...props }: TableHeadProps) {
  return (
    <th
      data-slot="table-head"
      scope="col"
      className={cn(
        "h-11 px-4",
        "align-middle whitespace-nowrap",
        "text-[11px] font-semibold uppercase tracking-[0.06em]",
        "text-[var(--text-muted)]",
        align === "left" && "text-left",
        align === "center" && "text-center",
        align === "right" && "text-right",
        "[&:has([role=checkbox])]:w-14 [&:has([role=checkbox])]:pr-0 [&:has([role=checkbox])]:text-center",
        className,
      )}
      {...props}
    />
  );
}

/* ════════════════════════════════════════════════════════
   TABLE SORTABLE HEAD
   ════════════════════════════════════════════════════════ */

type SortDirection = "asc" | "desc" | null;

interface TableSortableHeadProps extends Omit<TableHeadProps, "onClick"> {
  sortDirection?: SortDirection;
  onSort?: () => void;
}

function TableSortableHead({
  className,
  children,
  sortDirection,
  onSort,
  align = "left",
  ...props
}: TableSortableHeadProps) {
  const SortIcon =
    sortDirection === "asc"
      ? ArrowUp
      : sortDirection === "desc"
        ? ArrowDown
        : ArrowUpDown;

  return (
    <th
      data-slot="table-sortable-head"
      scope="col"
      className={cn(
        "h-11 px-4",
        "align-middle whitespace-nowrap",
        "text-[11px] font-semibold uppercase tracking-[0.06em]",
        "cursor-pointer select-none",
        "transition-colors duration-150",
        "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
        "motion-reduce:transition-none",
        sortDirection
          ? "text-[var(--text-primary)]"
          : "text-[var(--text-muted)]",
        "hover:text-[var(--text-primary)]",
        align === "left" && "text-left",
        align === "center" && "text-center",
        align === "right" && "text-right",
        "[&:has([role=checkbox])]:w-14 [&:has([role=checkbox])]:pr-0",
        className,
      )}
      onClick={onSort}
      aria-sort={
        sortDirection === "asc"
          ? "ascending"
          : sortDirection === "desc"
            ? "descending"
            : "none"
      }
      {...props}
    >
      <div
        className={cn(
          "inline-flex items-center gap-1.5",
          align === "right" && "flex-row-reverse",
          align === "center" && "justify-center",
        )}
      >
        <span>{children}</span>
        <SortIcon
          className={cn(
            "h-3.5 w-3.5 shrink-0",
            "transition-colors duration-150",
            sortDirection
              ? "text-[var(--primary)]"
              : "text-[var(--text-disabled)]",
          )}
          aria-hidden="true"
        />
      </div>
    </th>
  );
}

/* ════════════════════════════════════════════════════════
   TABLE CELL (td)
   ════════════════════════════════════════════════════════ */

interface TableCellProps extends React.ComponentProps<"td"> {
  align?: "left" | "center" | "right";
  truncate?: boolean;
  mono?: boolean;
}

function TableCell({
  className,
  align = "left",
  truncate,
  mono,
  ...props
}: TableCellProps) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-4 py-3.5",
        "align-middle",
        "text-sm text-[var(--text-secondary)]",
        align === "left" && "text-left",
        align === "center" && "text-center",
        align === "right" && "text-right",
        truncate && "max-w-[200px] truncate",
        mono && "font-mono tabular-nums text-[13px]",
        "[&:has([role=checkbox])]:w-14 [&:has([role=checkbox])]:pr-0 [&:has([role=checkbox])]:text-center",
        className,
      )}
      {...props}
    />
  );
}

/* ════════════════════════════════════════════════════════
   TABLE CAPTION
   ════════════════════════════════════════════════════════ */

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn(
        "mt-4 pb-4",
        "text-sm text-[var(--text-muted)]",
        "text-center",
        className,
      )}
      {...props}
    />
  );
}

/* ════════════════════════════════════════════════════════
   TABLE CELL TEXT — primary + secondary stack
   ════════════════════════════════════════════════════════ */

interface TableCellTextProps {
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  className?: string;
}

function TableCellText({ primary, secondary, className }: TableCellTextProps) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className="text-sm font-medium text-[var(--text-primary)] leading-snug">
        {primary}
      </span>
      {secondary && (
        <span className="text-[13px] text-[var(--text-muted)] leading-snug">
          {secondary}
        </span>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   TABLE CELL AVATAR
   ════════════════════════════════════════════════════════ */

interface TableCellAvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  primary?: React.ReactNode;
  secondary?: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
}

function TableCellAvatar({
  src,
  alt,
  fallback,
  primary,
  secondary,
  size = "md",
  className,
}: TableCellAvatarProps) {
  const initials =
    fallback ||
    (typeof primary === "string"
      ? primary
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
      : "?");

  const sizeClasses =
    size === "sm" ? "h-8 w-8 text-[10px]" : "h-9 w-9 text-xs";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "relative shrink-0 rounded-full overflow-hidden",
          "flex items-center justify-center",
          sizeClasses,
        )}
      >
        {src ? (
          <img
            src={src}
            alt={alt || (typeof primary === "string" ? primary : "")}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <span
            className={cn(
              "flex h-full w-full items-center justify-center",
              "font-semibold leading-none",
              "bg-[var(--primary-soft)] text-[var(--primary)]",
            )}
            aria-hidden="true"
          >
            {initials}
          </span>
        )}
      </div>
      {(primary || secondary) && (
        <div className="flex flex-col gap-0.5 min-w-0">
          {primary && (
            <span className="text-sm font-medium text-[var(--text-primary)] leading-snug truncate">
              {primary}
            </span>
          )}
          {secondary && (
            <span className="text-[13px] text-[var(--text-muted)] leading-snug truncate">
              {secondary}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   TABLE CELL STATUS
   ════════════════════════════════════════════════════════ */

type StatusVariant = "success" | "error" | "warning" | "info" | "neutral";

interface TableCellStatusProps {
  children: React.ReactNode;
  variant?: StatusVariant;
  icon?: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const statusStyles: Record<
  StatusVariant,
  { bg: string; text: string; dot: string }
> = {
  success: {
    bg: "bg-[var(--success-soft)]",
    text: "text-[var(--success)]",
    dot: "bg-[var(--success)]",
  },
  error: {
    bg: "bg-[var(--error-soft)]",
    text: "text-[var(--error)]",
    dot: "bg-[var(--error)]",
  },
  warning: {
    bg: "bg-[var(--warning-soft)]",
    text: "text-[var(--warning)]",
    dot: "bg-[var(--warning)]",
  },
  info: {
    bg: "bg-[var(--info-soft)]",
    text: "text-[var(--info)]",
    dot: "bg-[var(--info)]",
  },
  neutral: {
    bg: "bg-[var(--muted)]",
    text: "text-[var(--text-muted)]",
    dot: "bg-[var(--text-disabled)]",
  },
};

function TableCellStatus({
  children,
  variant = "neutral",
  icon,
  dot = true,
  className,
}: TableCellStatusProps) {
  const s = statusStyles[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        "rounded-full px-2.5 py-[5px]",
        "text-xs font-medium leading-none whitespace-nowrap",
        s.bg,
        s.text,
        className,
      )}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", s.dot)}
          aria-hidden="true"
        />
      )}
      {icon && (
        <span className="shrink-0 [&>svg]:h-3 [&>svg]:w-3">{icon}</span>
      )}
      {children}
    </span>
  );
}

/* ════════════════════════════════════════════════════════
   TABLE CELL ICON
   ════════════════════════════════════════════════════════ */

type IconColor =
  | "blue"
  | "cyan"
  | "green"
  | "violet"
  | "magenta"
  | "red"
  | "amber"
  | "neutral";

interface TableCellIconProps {
  icon: React.ReactNode;
  color?: IconColor;
  withBackground?: boolean;
  className?: string;
}

const iconColorMap: Record<IconColor, { fg: string; bg: string }> = {
  blue: { fg: "text-[var(--icon-blue)]", bg: "bg-[var(--icon-blue-bg)]" },
  cyan: { fg: "text-[var(--icon-cyan)]", bg: "bg-[var(--icon-cyan-bg)]" },
  green: { fg: "text-[var(--icon-green)]", bg: "bg-[var(--icon-green-bg)]" },
  violet: { fg: "text-[var(--icon-violet)]", bg: "bg-[var(--icon-violet-bg)]" },
  magenta: { fg: "text-[var(--icon-magenta)]", bg: "bg-[var(--icon-magenta-bg)]" },
  red: { fg: "text-[var(--icon-red)]", bg: "bg-[var(--icon-red-bg)]" },
  amber: { fg: "text-[var(--icon-amber)]", bg: "bg-[var(--icon-amber-bg)]" },
  neutral: { fg: "text-[var(--icon-neutral)]", bg: "bg-[var(--icon-neutral-bg)]" },
};

function TableCellIcon({
  icon,
  color = "neutral",
  withBackground = true,
  className,
}: TableCellIconProps) {
  const s = iconColorMap[color];

  if (withBackground) {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center",
          "h-9 w-9 rounded-[var(--radius-sm)]",
          s.bg,
          className,
        )}
      >
        <span className={cn("[&>svg]:h-[18px] [&>svg]:w-[18px]", s.fg)}>
          {icon}
        </span>
      </div>
    );
  }

  return (
    <span className={cn("[&>svg]:h-[18px] [&>svg]:w-[18px]", s.fg, className)}>
      {icon}
    </span>
  );
}

/* ════════════════════════════════════════════════════════
   TABLE ACTION BUTTON — individual icon button
   ════════════════════════════════════════════════════════ */

interface TableActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  variant?: "default" | "destructive";
}

function TableActionButton({
  icon,
  label,
  variant = "default",
  className,
  onClick,
  ...props
}: TableActionButtonProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      className={cn(
        "inline-flex items-center justify-center",
        "h-9 w-9 rounded-[var(--radius-sm)]",
        "cursor-pointer",
        "transition-all duration-150",
        "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
        "motion-reduce:transition-none",
        "active:scale-[0.96]",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        "focus-visible:outline-[var(--focus-ring)]",
        variant === "default" && [
          "text-[var(--text-muted)]",
          "hover:bg-[var(--muted)] hover:text-[var(--text-primary)]",
        ],
        variant === "destructive" && [
          "text-[var(--text-muted)]",
          "hover:bg-[var(--error-soft)] hover:text-[var(--error)]",
        ],
        className,
      )}
      {...props}
    >
      <span className="[&>svg]:h-[18px] [&>svg]:w-[18px]">{icon}</span>
      <span className="sr-only">{label}</span>
    </button>
  );
}

/* ════════════════════════════════════════════════════════
   TABLE CELL ACTIONS — row action wrapper
   ════════════════════════════════════════════════════════ */

interface TableCellActionsProps {
  children?: React.ReactNode;
  onMoreClick?: () => void;
  className?: string;
}

function TableCellActions({
  children,
  onMoreClick,
  className,
}: TableCellActionsProps) {
  return (
    <div className={cn("flex items-center justify-end gap-1", className)}>
      {children}
      {onMoreClick && (
        <TableActionButton
          icon={<MoreHorizontal />}
          label="More actions"
          onClick={onMoreClick}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   TABLE CELL CHECKBOX
   ════════════════════════════════════════════════════════ */

interface TableCellCheckboxProps {
  checked?: boolean | "indeterminate";
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

function TableCellCheckbox({
  checked,
  onCheckedChange,
  disabled,
  className,
  "aria-label": ariaLabel,
}: TableCellCheckboxProps) {
  const isIndeterminate = checked === "indeterminate";
  const isChecked = checked === true;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isIndeterminate ? "mixed" : isChecked}
      aria-label={ariaLabel || "Select row"}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onCheckedChange?.(!isChecked);
      }}
      className={cn(
        "inline-flex items-center justify-center",
        "h-[18px] w-[18px] shrink-0 rounded-[4px]",
        "cursor-pointer",
        "border border-[var(--border)]",
        "transition-all duration-150",
        "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
        "motion-reduce:transition-none",
        // Unchecked hover
        !(isChecked || isIndeterminate) &&
        !disabled &&
        "hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]/30",
        // Checked / indeterminate
        (isChecked || isIndeterminate) && [
          "bg-[var(--primary)] border-[var(--primary)]",
          "text-[var(--text-inverse)]",
        ],
        // Focus
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        "focus-visible:outline-[var(--focus-ring)]",
        // Disabled
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      {isIndeterminate ? (
        <Minus className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
      ) : isChecked ? (
        <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
      ) : null}
    </button>
  );
}

/* ════════════════════════════════════════════════════════
   TABLE EMPTY STATE
   ════════════════════════════════════════════════════════ */

interface TableEmptyStateProps {
  colSpan: number;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

function TableEmptyState({
  colSpan,
  icon,
  title = "No results found",
  description = "There's nothing to display yet.",
  action,
  className,
}: TableEmptyStateProps) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="h-64">
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-4",
            className,
          )}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--muted)]">
            {icon || (
              <Inbox
                className="h-7 w-7 text-[var(--text-disabled)]"
                aria-hidden="true"
              />
            )}
          </div>
          <div className="flex flex-col items-center gap-1.5 text-center max-w-[280px]">
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              {title}
            </span>
            <span className="text-sm text-[var(--text-muted)] leading-relaxed">
              {description}
            </span>
          </div>
          {action && <div className="mt-1">{action}</div>}
        </div>
      </TableCell>
    </TableRow>
  );
}

/* ════════════════════════════════════════════════════════
   TABLE LOADING ROWS
   ════════════════════════════════════════════════════════ */

interface TableLoadingRowsProps {
  rows?: number;
  columns: number;
  className?: string;
}

const SKELETON_WIDTHS = [65, 80, 45, 70, 55, 75, 60, 50] as const;

function TableLoadingRows({
  rows = 5,
  columns,
  className,
}: TableLoadingRowsProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow
          key={rowIndex}
          className={cn("hover:bg-transparent pointer-events-none", className)}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <div
                className="h-4 rounded-md bg-[var(--muted)] animate-pulse"
                style={{
                  width: `${SKELETON_WIDTHS[(rowIndex + colIndex) % SKELETON_WIDTHS.length]}%`,
                  maxWidth: "200px",
                  animationDelay: `${rowIndex * 75 + colIndex * 50}ms`,
                }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

/* ════════════════════════════════════════════════════════
   PAGINATION BUTTON — extracted for stable identity
   ════════════════════════════════════════════════════════ */

interface PaginationButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  "aria-label": string;
}

function PaginationButton({
  onClick,
  disabled,
  children,
  "aria-label": ariaLabel,
}: PaginationButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center justify-center",
        "h-8 w-8 rounded-[var(--radius-sm)]",
        "border border-[var(--border)]",
        "bg-[var(--card)]",
        "text-[var(--primary)]",
        "cursor-pointer shadow-sm",
        "transition-all duration-150",
        "[transition-timing-function:cubic-bezier(0,0,0.2,1)]",
        "motion-reduce:transition-none",
        "hover:bg-[var(--primary-soft)] hover:text-[var(--primary)] hover:border-[var(--primary)]",
        "active:scale-[0.96]",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        "focus-visible:outline-[var(--focus-ring)]",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        "disabled:hover:bg-[var(--card)] disabled:hover:border-[var(--border)] disabled:hover:text-[var(--text-secondary)]",
        "disabled:active:scale-100",
      )}
    >
      {children}
    </button>
  );
}

/* ════════════════════════════════════════════════════════
   TABLE PAGINATION
   ════════════════════════════════════════════════════════ */

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className,
}: TablePaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4",
        "px-5 py-3.5",
        "rounded-[var(--radius)] border border-[var(--border)]",
        "bg-[var(--card)] shadow-[var(--shadow-sm)]",
        "max-sm:flex-col max-sm:gap-3",
        className,
      )}
    >
      <p className="text-sm text-[var(--text-muted)] tabular-nums max-sm:order-2">
        Showing{" "}
        <span className="font-semibold text-[var(--text-primary)]">
          {startItem}–{endItem}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-[var(--text-primary)]">
          {totalItems.toLocaleString()}
        </span>
      </p>

      <div className="flex items-center gap-1.5 max-sm:order-1">
        <PaginationButton
          onClick={() => onPageChange(1)}
          disabled={isFirstPage}
          aria-label="Go to first page"
        >
          <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
        </PaginationButton>
        <PaginationButton
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </PaginationButton>

        <div className="mx-2 text-sm text-[var(--text-secondary)] tabular-nums whitespace-nowrap select-none">
          Page <span className="font-medium text-[var(--text-primary)]">{currentPage}</span> of{" "}
          <span className="font-medium text-[var(--text-primary)]">{totalPages}</span>
        </div>

        <PaginationButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage}
          aria-label="Go to next page"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </PaginationButton>
        <PaginationButton
          onClick={() => onPageChange(totalPages)}
          disabled={isLastPage}
          aria-label="Go to last page"
        >
          <ChevronsRight className="h-4 w-4" aria-hidden="true" />
        </PaginationButton>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   EXPORTS
   ════════════════════════════════════════════════════════ */

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableSortableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableCellText,
  TableCellAvatar,
  TableCellStatus,
  TableCellIcon,
  TableCellActions,
  TableActionButton,
  TableCellCheckbox,
  TableEmptyState,
  TableLoadingRows,
  TablePagination,
};

export type { SortDirection, StatusVariant, IconColor };