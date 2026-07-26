"use client";

import { motion, useReducedMotion } from "motion/react";
import { DateTime } from "luxon";

import { GRAHA_GLYPHS } from "@/lib/astro/constants";
import { periodProgress } from "@/lib/astro/dasha";
import type { ActiveDasha, DashaPeriod, NatalChart } from "@/lib/astro/types";
import type { Dictionary, Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * The running Vimshottari periods, plus the surrounding mahadasha sequence.
 *
 * The three nested levels are what make a Jyotish reading time-specific, so
 * they get their own panel rather than being buried in the chart details.
 */
export function DashaTimeline({
  chart,
  active,
  at,
  dict,
  locale,
}: {
  chart: NatalChart;
  active: ActiveDasha;
  at: Date;
  dict: Dictionary;
  locale: Locale;
}) {
  const reduced = useReducedMotion();

  const levels: { label: string; period: DashaPeriod }[] = [
    { label: dict.dasha.maha, period: active.maha },
    { label: dict.dasha.antar, period: active.antar },
  ];
  if (active.pratyantar) {
    levels.push({ label: dict.dasha.pratyantar, period: active.pratyantar });
  }

  // Show a window around the current mahadasha rather than all 120 years.
  const currentIndex = chart.dashaTree.findIndex((p) => p === active.maha);
  const window = chart.dashaTree.slice(
    Math.max(0, currentIndex - 1),
    Math.min(chart.dashaTree.length, currentIndex + 3),
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {levels.map(({ label, period }, i) => {
          const progress = periodProgress(period, at);
          return (
            <div key={label}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm">
                  <span className="mr-1.5 text-gold/85">
                    {GRAHA_GLYPHS[period.lord]}
                  </span>
                  <span className="font-medium">{dict.grahas[period.lord]}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {label}
                  </span>
                </p>
                <p className="whitespace-nowrap font-mono text-[0.7rem] text-muted-foreground">
                  {formatDate(period.start, locale)} –{" "}
                  {formatDate(period.end, locale)}
                </p>
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted/60">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-gold/50 to-gold"
                  initial={reduced ? false : { width: 0 }}
                  animate={{ width: `${progress * 100}%` }}
                  transition={{
                    duration: 0.9,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.15 + i * 0.1,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <p className="label-eyebrow mb-3">{dict.dasha.maha}</p>
        <ol className="space-y-1">
          {window.map((period) => {
            const isCurrent = period === active.maha;
            return (
              <li
                key={period.start.toISOString()}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors",
                  isCurrent
                    ? "bg-gold/10 text-foreground"
                    : "text-muted-foreground",
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="text-gold/70">
                    {GRAHA_GLYPHS[period.lord]}
                  </span>
                  {dict.grahas[period.lord]}
                  {isCurrent && (
                    <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-gold">
                      {dict.dasha.current}
                    </span>
                  )}
                </span>
                <span className="font-mono">
                  {period.start.getUTCFullYear()} – {period.end.getUTCFullYear()}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function formatDate(date: Date, locale: Locale): string {
  return DateTime.fromJSDate(date)
    .setLocale(locale)
    .toFormat("dd/LL/yyyy");
}
