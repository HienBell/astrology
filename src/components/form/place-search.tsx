"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, MapPin, Search } from "lucide-react";

import type { GeocodeResult } from "@/app/api/geocode/route";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n";
import type { Place } from "@/lib/profile/types";

/**
 * Typeahead over the geocoding proxy.
 *
 * Debounced and abortable: Nominatim is rate-limited to roughly one request per
 * second, and an un-debounced field would fire on every keystroke.
 */
export function PlaceSearch({
  dict,
  value,
  onSelect,
}: {
  dict: Dictionary;
  value: Place | null;
  onSelect: (place: Place) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [open, setOpen] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Too short to search. Derived rather than stored, so no state has to be
  // reset when the field is cleared.
  const tooShort = query.trim().length < 2;
  const visibleResults = tooShort ? [] : results;
  const visibleStatus = tooShort ? "idle" : status;

  useEffect(() => {
    if (tooShort) {
      // Cancel anything still in flight for the longer query we just left.
      abortRef.current?.abort();
      return;
    }

    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setStatus("loading");
      try {
        const response = await fetch(
          `/api/geocode?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("geocode failed");
        setResults((await response.json()) as GeocodeResult[]);
        setStatus("idle");
      } catch (error) {
        // An abort means a newer keystroke superseded this request, not a failure.
        if ((error as Error).name === "AbortError") return;
        setStatus("error");
        setResults([]);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, tooShort]);

  // Close the suggestion list when focus leaves the whole control.
  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function choose(result: GeocodeResult) {
    onSelect({
      label: result.label,
      latitude: result.latitude,
      longitude: result.longitude,
      timezone: result.timezone,
    });
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={dict.form.placePlaceholder}
          className="h-11 pl-10"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
        />
        {visibleStatus === "loading" && (
          <Loader2 className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-gold" />
        )}
      </div>

      {value && !open && (
        <p className="mt-2 flex items-start gap-1.5 text-sm text-foreground/85">
          <Check className="mt-0.5 size-3.5 shrink-0 text-gold" />
          <span className="line-clamp-2">{value.label}</span>
        </p>
      )}

      {open && !tooShort && (
        <div className="glass-strong absolute z-50 mt-2 w-full overflow-hidden rounded-xl">
          {visibleStatus === "error" ? (
            <p className="px-4 py-3 text-sm text-destructive">
              {dict.form.searchError}
            </p>
          ) : visibleResults.length === 0 && visibleStatus === "idle" ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              {dict.form.noResults}
            </p>
          ) : (
            <ul className="max-h-64 overflow-y-auto py-1">
              {visibleResults.map((result) => (
                <li key={`${result.latitude},${result.longitude}`}>
                  <button
                    type="button"
                    onClick={() => choose(result)}
                    className={cn(
                      "flex w-full items-start gap-2.5 px-4 py-2.5 text-left text-sm",
                      "transition-colors hover:bg-accent/70 focus-visible:bg-accent/70 focus-visible:outline-none",
                    )}
                  >
                    <MapPin className="mt-0.5 size-3.5 shrink-0 text-gold/80" />
                    <span className="flex-1 leading-snug">{result.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
