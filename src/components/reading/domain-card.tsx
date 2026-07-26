"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  Briefcase,
  Coins,
  Heart,
  HeartPulse,
  Home,
  Minus,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import { HoverLift } from "@/components/motion/primitives";
import { formatFactor, scoreBand } from "@/lib/i18n/present";
import type { Domain, DomainScore } from "@/lib/astro/types";
import type { Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const DOMAIN_ICON: Record<Domain, LucideIcon> = {
  career: Briefcase,
  love: Heart,
  family: Home,
  health: HeartPulse,
  money: Coins,
};

/** Reads the per-domain hue from the design tokens rather than hard-coding it. */
const DOMAIN_VAR: Record<Domain, string> = {
  career: "var(--domain-career)",
  love: "var(--domain-love)",
  family: "var(--domain-family)",
  health: "var(--domain-health)",
  money: "var(--domain-money)",
};

const BAND_VAR = {
  low: "var(--band-low)",
  belowAverage: "var(--band-below)",
  average: "var(--band-average)",
  good: "var(--band-good)",
  excellent: "var(--band-excellent)",
} as const;

export function DomainCard({
  dict,
  score,
  interpretation,
  index,
}: {
  dict: Dictionary;
  score: DomainScore;
  /** Prose from the LLM layer; absent while loading or when unavailable. */
  interpretation?: string;
  index: number;
}) {
  const reduced = useReducedMotion();
  const Icon = DOMAIN_ICON[score.domain];
  const hue = DOMAIN_VAR[score.domain];
  const bandColor = BAND_VAR[scoreBand(score.score)];

  const TrendIcon =
    score.trend === "rising"
      ? TrendingUp
      : score.trend === "falling"
        ? TrendingDown
        : Minus;

  const trendLabel =
    score.trend === "rising"
      ? dict.reading.trendRising
      : score.trend === "falling"
        ? dict.reading.trendFalling
        : dict.reading.trendSteady;

  return (
    <HoverLift className="h-full">
      <article className="glass flex h-full flex-col rounded-2xl p-6">
        <header className="flex items-start gap-3">
          <span
            className="grid size-10 shrink-0 place-items-center rounded-xl"
            style={{ background: `color-mix(in oklch, ${hue} 16%, transparent)` }}
          >
            <Icon className="size-[18px]" style={{ color: hue }} />
          </span>

          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-xl font-semibold leading-tight">
              {dict.domains[score.domain]}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {dict.domainTaglines[score.domain]}
            </p>
          </div>

          <div className="text-right">
            <p
              className="font-mono text-2xl font-semibold leading-none"
              style={{ color: bandColor }}
            >
              {score.score}
            </p>
            <p className="mt-1 flex items-center justify-end gap-1 text-[0.65rem] text-muted-foreground">
              <TrendIcon className="size-3" />
              {trendLabel}
            </p>
          </div>
        </header>

        <Meter value={score.score} color={bandColor} delay={index * 0.06} reduced={!!reduced} />

        <div className="mt-4 flex-1">
          {interpretation ? (
            <p className="text-sm leading-relaxed text-foreground/90">
              {interpretation}
            </p>
          ) : (
            <div className="space-y-2" aria-hidden>
              <div className="h-3 w-full animate-pulse rounded bg-muted/50" />
              <div className="h-3 w-11/12 animate-pulse rounded bg-muted/50" />
              <div className="h-3 w-4/6 animate-pulse rounded bg-muted/50" />
            </div>
          )}
        </div>

        <details className="group mt-5">
          <summary className="cursor-pointer list-none text-xs text-muted-foreground transition-colors hover:text-foreground">
            <span className="underline decoration-dotted underline-offset-4">
              {dict.reading.whyThisScore}
            </span>
          </summary>

          <ul className="mt-3 space-y-2">
            {score.factors.length === 0 && (
              <li className="text-xs text-muted-foreground">
                {dict.reading.factorsEmpty}
              </li>
            )}
            {score.factors.map((factor, i) => (
              <li key={`${factor.key}-${i}`} className="flex gap-2 text-xs leading-relaxed">
                <span
                  className={cn(
                    "mt-1.5 size-1.5 shrink-0 rounded-full",
                    factor.impact > 0 ? "bg-[var(--band-good)]" : "bg-[var(--band-low)]",
                  )}
                />
                <span className="text-muted-foreground">
                  {formatFactor(dict, factor)}
                </span>
              </li>
            ))}
          </ul>
        </details>
      </article>
    </HoverLift>
  );
}

function Meter({
  value,
  color,
  delay,
  reduced,
}: {
  value: number;
  color: string;
  delay: number;
  reduced: boolean;
}) {
  return (
    <div
      className="mt-5 h-1.5 overflow-hidden rounded-full bg-muted/60"
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={reduced ? false : { width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay }}
      />
    </div>
  );
}
