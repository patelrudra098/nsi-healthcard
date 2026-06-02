"use client";

import { useRef } from "react";
import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/hooks/use-language";

/**
 * Pill selector for the preferred language. Accessible radiogroup with roving
 * tabindex + arrow-key navigation; shows the native script with an English
 * screen-reader label.
 */
export function LanguageSelector() {
  const { language, setLanguage, SUPPORTED_LANGUAGES } = useLanguage();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusIndex = (index: number) => {
    const next = (index + SUPPORTED_LANGUAGES.length) % SUPPORTED_LANGUAGES.length;
    setLanguage(SUPPORTED_LANGUAGES[next].code);
    refs.current[next]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusIndex(index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusIndex(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusIndex(0);
        break;
      case "End":
        event.preventDefault();
        focusIndex(SUPPORTED_LANGUAGES.length - 1);
        break;
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <Languages className="size-4 text-[var(--primary)]" aria-hidden="true" />
        <span className="text-sm font-medium text-[var(--text-primary)]">
          Choose your preferred language
        </span>
      </div>
      <p className="mt-1 text-xs text-[var(--text-muted)]">
        Your assessment questions will appear in this language.
      </p>

      <div
        role="radiogroup"
        aria-label="Preferred language"
        className="mt-3 flex flex-wrap gap-2"
      >
        {SUPPORTED_LANGUAGES.map((lang, index) => {
          const selected = language === lang.code;
          return (
            <button
              key={lang.code}
              ref={(node) => {
                refs.current[index] = node;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => setLanguage(lang.code)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm outline-none",
                "transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
                selected
                  ? "border-[var(--primary)] bg-[var(--primary)] font-semibold text-[var(--text-inverse)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[color-mix(in_srgb,var(--primary)_45%,var(--border))]",
              )}
            >
              <span aria-hidden="true">{lang.nativeLabel}</span>
              <span className="sr-only">{lang.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
