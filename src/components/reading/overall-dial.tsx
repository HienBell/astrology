"use client";

import { motion, useReducedMotion } from "motion/react";

import { scoreBand } from "@/lib/i18n/present";
import type { Dictionary } from "@/lib/i18n";

const BAND_VAR = {
  low: "var(--band-low)",
  belowAverage: "var(--band-below)",
  average: "var(--band-average)",
  good: "var(--band-good)",
  excellent: "var(--band-excellent)",
} as const;

/**
 * The day's headline number, drawn as a 270° arc.
 *
 * Deliberately not a full circle: a full ring reads as a completion meter,
 * which would imply the score is a progress bar rather than a position.
 */
export function OverallDial({
  value,
  dict,
  interpretation,
}: {
  value: number;
  dict: Dictionary;
  interpretation?: string;
}) {
  const reduced = useReducedMotion();
  const color = BAND_VAR[scoreBand(value)];

  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  const sweep = 0.75; // 270° of the circle
  const arc = circumference * sweep;

  return (
    <div className="glass-strong flex flex-col items-center gap-6 rounded-3xl p-7 sm:flex-row sm:items-center sm:gap-8 sm:p-9">
      <div className="relative shrink-0">
        <svg viewBox="0 0 200 200" className="size-44">
          {/* Rotated so the gap sits at the bottom. */}
          <g transform="rotate(135 100 100)">
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="var(--muted)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${arc} ${circumference}`}
              opacity="0.5"
            />
            <motion.circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${arc} ${circumference}`}
              initial={reduced ? false : { strokeDashoffset: arc }}
              animate={{ strokeDashoffset: arc * (1 - value / 100) }}
              transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              style={{ filter: `drop-shadow(0 0 10px ${color})` }}
            />
          </g>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-mono text-5xl font-semibold leading-none"
            style={{ color }}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {value}
          </motion.span>
          <span className="mt-1.5 text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
            {dict.reading.scoreLabel}
          </span>
        </div>
      </div>

      <div className="min-w-0 flex-1 text-center sm:text-left">
        <p className="label-eyebrow text-gold/90">{dict.reading.overall}</p>
        {interpretation ? (
          <p className="mt-3 text-[0.95rem] leading-relaxed text-foreground/90">
            {interpretation}
          </p>
        ) : (
          <div className="mt-3 space-y-2.5" aria-hidden>
            <div className="h-3.5 w-full animate-pulse rounded bg-muted/50" />
            <div className="h-3.5 w-11/12 animate-pulse rounded bg-muted/50" />
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-muted/50" />
          </div>
        )}
      </div>
    </div>
  );
}
