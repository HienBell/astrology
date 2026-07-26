"use client";

import { useEffect, useRef, useState } from "react";

import type { InterpretResponse } from "@/app/api/interpret/route";
import { NAKSHATRAS, RASHIS } from "@/lib/astro/constants";
import { DOMAINS, type DailyReading, type Domain } from "@/lib/astro/types";
import { formatFactor } from "@/lib/i18n/present";
import type { Dictionary, Locale } from "@/lib/i18n";

type Status = "idle" | "loading" | "ready" | "unavailable";

/**
 * Fetches the written reading for a computed day.
 *
 * The factors are rendered to sentences here rather than server-side so the
 * model receives exactly the text the user can see under "why this score" —
 * the prose and the evidence can never disagree.
 */
export function useInterpretation(
  reading: DailyReading | null,
  dict: Dictionary,
  locale: Locale,
) {
  const [result, setResult] = useState<InterpretResponse | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const abortRef = useRef<AbortController | null>(null);

  // Identifies a reading: same chart + same day means the same prose.
  const key = reading
    ? `${reading.chart.julianDay.toFixed(6)}|${reading.date}|${locale}`
    : null;

  // Reset during render rather than in the effect, so the stale prose from the
  // previous day is never painted alongside the new day's scores.
  const [renderedKey, setRenderedKey] = useState<string | null>(null);
  if (key !== renderedKey) {
    setRenderedKey(key);
    setResult(null);
    setStatus(key ? "loading" : "idle");
  }

  useEffect(() => {
    if (!reading || !key) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const payload = {
      locale,
      date: reading.date,
      overall: reading.overall,
      context: {
        lagna: RASHIS[reading.chart.ascendant.rashi].sanskrit,
        moonRashi: RASHIS[reading.chart.moonRashi].sanskrit,
        moonNakshatra: NAKSHATRAS[reading.moonNakshatra.index],
        mahadasha: reading.activeDasha.maha.lord,
        antardasha: reading.activeDasha.antar.lord,
        tithi: `${reading.tithi.index} ${reading.tithi.paksha}`,
        sadeSati: reading.sadeSati.active ? reading.sadeSati.phase : null,
      },
      domains: Object.fromEntries(
        DOMAINS.map((domain) => {
          const score = reading.domains[domain];
          return [
            domain,
            {
              score: score.score,
              trend: score.trend,
              factors: score.factors.map((factor) => ({
                text: formatFactor(dict, factor),
                impact: Number(factor.impact.toFixed(2)),
              })),
            },
          ];
        }),
      ) as Record<Domain, unknown>,
    };

    async function run() {
      try {
        const response = await fetch("/api/interpret", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!response.ok) {
          setStatus("unavailable");
          return;
        }

        setResult((await response.json()) as InterpretResponse);
        setStatus("ready");
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setStatus("unavailable");
      }
    }

    void run();
    return () => controller.abort();
    // `key` captures every input that changes the prose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { interpretation: result, status };
}
