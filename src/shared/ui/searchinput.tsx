"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input, type InputProps } from "@/shared/ui/input";
import { Search, Loader2 } from "lucide-react";

/* ════════════════════════════════════════════════════════
   SEARCH INPUT
   Composes Input — adds debounce, loading, keyboard shortcut
   
   Shortcuts (industry standard):
   ⌘K / Ctrl+K  → Global search (Stripe, Linear, Vercel)
   /             → Quick search (GitHub, YouTube)
   Escape        → Blur / dismiss
   Enter         → Immediate search (skips debounce)
   ════════════════════════════════════════════════════════ */

export interface SearchInputProps
    extends Omit<
        InputProps,
        "prefix" | "state" | "label" | "error" | "success" | "helper" | "type"
    > {
    /** Debounced search callback (fires after delay) */
    onSearch?: (value: string) => void;
    /** Debounce delay in ms */
    debounce?: number;
    /** Show loading spinner in suffix */
    isLoading?: boolean;
    /** Keyboard shortcut key — displayed as ⌘{key} / Ctrl+{key} */
    shortcutKey?: string;
    /** Enable global keyboard shortcut (default: true when shortcutKey set) */
    enableShortcut?: boolean;
}

/* ── Platform detection (cached once per session) ──── */

function getIsMac(): boolean {
    if (typeof window === "undefined") return false;
    // navigator.userAgentData is the modern replacement for navigator.platform
    const uad = (navigator as Navigator & { userAgentData?: { platform: string } }).userAgentData;
    if (uad?.platform) return uad.platform === "macOS";
    return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
}

/* ── Component ─────────────────────────────────────── */

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
    (
        {
            className,
            wrapperClassName,
            onSearch,
            debounce = 300,
            isLoading = false,
            shortcutKey,
            enableShortcut,
            placeholder = "Search…",
            size = "default",
            onChange,
            value,
            defaultValue,
            ...props
        },
        ref,
    ) => {
        const inputRef = React.useRef<HTMLInputElement>(null);
        const debounceRef = React.useRef<ReturnType<typeof setTimeout>>(null);

        // Merge forwarded ref with internal ref
        React.useImperativeHandle(ref, () => inputRef.current!);

        // Cache platform check
        const isMac = React.useMemo(() => getIsMac(), []);

        /* ── Global keyboard shortcut ────────────────── */
        const shouldEnableShortcut = enableShortcut ?? Boolean(shortcutKey);

        React.useEffect(() => {
            if (!shouldEnableShortcut || !shortcutKey) return;

            const handler = (e: KeyboardEvent) => {
                // Don't trigger when user is typing in another input
                const target = e.target as HTMLElement;
                const isInInput =
                    target.tagName === "INPUT" ||
                    target.tagName === "TEXTAREA" ||
                    target.isContentEditable;

                // For "/" shortcut, skip if user is already in an input
                if (shortcutKey === "/" && isInInput) return;

                const modifier = isMac ? e.metaKey : e.ctrlKey;
                const isShortcutMatch =
                    shortcutKey === "/"
                        ? e.key === "/" && !e.metaKey && !e.ctrlKey
                        : modifier && e.key.toLowerCase() === shortcutKey.toLowerCase();

                if (isShortcutMatch) {
                    e.preventDefault();
                    inputRef.current?.focus();
                    inputRef.current?.select();
                }
            };

            document.addEventListener("keydown", handler);
            return () => document.removeEventListener("keydown", handler);
        }, [shortcutKey, shouldEnableShortcut, isMac]);

        /* ── Debounced search ────────────────────────── */
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange?.(e);

            if (onSearch) {
                // Capture value before timeout to avoid stale reference
                const val = e.target.value;
                if (debounceRef.current) clearTimeout(debounceRef.current);
                debounceRef.current = setTimeout(() => {
                    onSearch(val);
                }, debounce);
            }
        };

        /* ── Enter = immediate search, Escape = blur ─── */
        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter" && onSearch) {
                e.preventDefault();
                // Flush any pending debounce and fire immediately
                if (debounceRef.current) clearTimeout(debounceRef.current);
                onSearch((e.target as HTMLInputElement).value);
            }

            if (e.key === "Escape") {
                inputRef.current?.blur();
            }

            props.onKeyDown?.(e);
        };

        /* ── Cleanup debounce timer ──────────────────── */
        React.useEffect(() => {
            return () => {
                if (debounceRef.current) clearTimeout(debounceRef.current);
            };
        }, []);

        /* ── Suffix: loading → shortcut hint ─────────── */
        const suffix = React.useMemo(() => {
            if (isLoading) {
                return (
                    <Loader2
                        className="h-4 w-4 animate-spin text-[var(--muted-foreground)]"
                        aria-hidden="true"
                    />
                );
            }

            if (shortcutKey) {
                return (
                    <kbd
                        className={cn(
                            // Hidden on mobile — keyboard shortcuts are desktop-only
                            "pointer-events-none hidden select-none",
                            "md:inline-flex md:items-center md:gap-0.5",
                            "h-5 px-1.5",
                            "rounded-[var(--radius-sm)]",
                            "border border-[var(--border)]",
                            "bg-[var(--muted)]",
                            "font-mono text-[11px] font-medium leading-none",
                            "text-[var(--muted-foreground)]",
                        )}
                    >
                        {shortcutKey === "/" ? (
                            <span>/</span>
                        ) : (
                            <>
                                <span className="text-[11px]">{isMac ? "⌘" : "Ctrl+"}</span>
                                {shortcutKey.toUpperCase()}
                            </>
                        )}
                    </kbd>
                );
            }

            return null;
        }, [isLoading, shortcutKey, isMac]);

        return (
            <Input
                ref={inputRef}
                type="search"
                role="searchbox"
                placeholder={placeholder}
                size={size}
                value={value}
                defaultValue={defaultValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                clearable
                prefix={
                    <Search
                        className={cn("h-4 w-4", isLoading && "opacity-40")}
                        aria-hidden="true"
                    />
                }
                suffix={suffix}
                wrapperClassName={wrapperClassName}
                className={cn(
                    // Remove browser's native search UI chrome
                    "[&::-webkit-search-cancel-button]:hidden",
                    "[&::-webkit-search-decoration]:hidden",
                    "[&::-webkit-search-results-button]:hidden",
                    "[&::-webkit-search-results-decoration]:hidden",
                    className,
                )}
                {...props}
            />
        );
    },
);

SearchInput.displayName = "SearchInput";

export { SearchInput };