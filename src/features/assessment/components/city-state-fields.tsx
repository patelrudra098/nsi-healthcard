"use client";

import { useId, useRef, useState } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input, inputVariants } from "@/shared/ui/input";
import type { FamilyProfileInput } from "../types";
import {
  lookupState,
  searchCities,
  type IndiaLocation,
} from "../data/india-locations";

/**
 * City + State pair with a typo-resistant City autocomplete. Picking a city —
 * or typing one we recognise — auto-fills State. State stays fully editable, so
 * cities outside the dataset still work, and a manual edit to State stops the
 * auto-fill from overwriting the user's choice.
 */
export function CityStateFields({
  form,
}: {
  form: UseFormReturn<FamilyProfileInput>;
}) {
  const { control, setValue, getValues, formState } = form;

  const inputId = useId();
  const listId = useId();

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [suggestions, setSuggestions] = useState<IndiaLocation[]>([]);
  // Drives the "Auto-filled from city" hint and the don't-clobber rule.
  const [autofilled, setAutofilled] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cityError = formState.errors.city?.message;
  const stateError = formState.errors.state?.message;

  const fillStateFromCity = (city: string, force: boolean) => {
    const mapped = lookupState(city);
    // Only overwrite State when forced (explicit pick), when we set it last, or
    // when it is still empty — never stomp on a value the user typed themselves.
    if (mapped && (force || autofilled || !getValues("state"))) {
      setValue("state", mapped, { shouldValidate: true, shouldDirty: true });
      setAutofilled(true);
    }
  };

  const closeList = () => {
    setOpen(false);
    setActive(-1);
  };

  return (
    <>
      {/* ── City (combobox) ── */}
      <Controller
        control={control}
        name="city"
        render={({ field }) => {
          const handleType = (value: string) => {
            field.onChange(value);
            fillStateFromCity(value, false);
            const next = searchCities(value);
            setSuggestions(next);
            setActive(-1);
            setOpen(next.length > 0);
          };

          const select = (loc: IndiaLocation) => {
            field.onChange(loc.city);
            setValue("state", loc.state, {
              shouldValidate: true,
              shouldDirty: true,
            });
            setAutofilled(true);
            closeList();
          };

          const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              if (!open && suggestions.length) {
                setOpen(true);
                return;
              }
              setActive((a) => Math.min(a + 1, suggestions.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter" && open && active >= 0) {
              e.preventDefault();
              select(suggestions[active]);
            } else if (e.key === "Escape") {
              closeList();
            }
          };

          return (
            <div className="flex w-full flex-col gap-1.5">
              <label
                htmlFor={inputId}
                className="select-none text-sm font-medium text-[var(--foreground)]"
              >
                City
              </label>

              <div className="relative">
                <div className="group/field relative flex items-center">
                  <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[var(--muted-foreground)] transition-colors duration-150 group-focus-within/field:text-[var(--ring)] md:left-3">
                    <MapPin className="size-4" aria-hidden="true" />
                  </span>
                  <input
                    id={inputId}
                    role="combobox"
                    aria-expanded={open}
                    aria-controls={listId}
                    aria-autocomplete="list"
                    aria-activedescendant={
                      active >= 0 ? `${listId}-opt-${active}` : undefined
                    }
                    aria-invalid={Boolean(cityError)}
                    autoComplete="off"
                    placeholder="e.g. Mumbai"
                    value={field.value ?? ""}
                    onChange={(e) => handleType(e.target.value)}
                    onFocus={() => {
                      if (suggestions.length > 0) setOpen(true);
                    }}
                    onBlur={() => {
                      blurTimer.current = setTimeout(closeList, 120);
                      field.onBlur();
                    }}
                    onKeyDown={handleKeyDown}
                    className={cn(
                      inputVariants({ state: cityError ? "error" : "default" }),
                      "pl-10 [caret-color:var(--text-primary)] md:pl-9",
                    )}
                  />
                </div>

                {open && suggestions.length > 0 && (
                  <ul
                    id={listId}
                    role="listbox"
                    className="absolute z-50 mt-1.5 max-h-64 w-full overflow-y-auto overflow-x-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--popover)] py-1 shadow-[var(--shadow-md)]"
                  >
                    {suggestions.map((loc, i) => (
                      <li
                        key={`${loc.city}-${loc.state}`}
                        id={`${listId}-opt-${i}`}
                        role="option"
                        aria-selected={i === active}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          select(loc);
                        }}
                        onMouseEnter={() => setActive(i)}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm",
                          i === active
                            ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                            : "text-[var(--text-secondary)]",
                        )}
                      >
                        <MapPin
                          className="size-3.5 shrink-0 text-[var(--text-muted)]"
                          aria-hidden="true"
                        />
                        <span className="truncate font-medium text-[var(--text-primary)]">
                          {loc.city}
                        </span>
                        <span className="ml-auto shrink-0 pl-2 text-xs text-[var(--text-muted)]">
                          {loc.state}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {cityError && (
                <p className="text-xs font-medium text-[var(--destructive)]">
                  {cityError}
                </p>
              )}
            </div>
          );
        }}
      />

      {/* ── State (auto-filled, editable) ── */}
      <Controller
        control={control}
        name="state"
        render={({ field }) => (
          <Input
            label="State"
            placeholder="e.g. Maharashtra"
            prefix={<MapPin className="size-4" />}
            autoComplete="off"
            value={field.value ?? ""}
            onChange={(e) => {
              setAutofilled(false);
              field.onChange(e);
            }}
            onBlur={field.onBlur}
            error={stateError}
            helper={
              autofilled && field.value
                ? "Auto-filled from your city — edit if needed"
                : undefined
            }
          />
        )}
      />
    </>
  );
}
